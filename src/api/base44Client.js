/**
 * Capa de compatibilidad: reemplaza el SDK de base44 por Supabase.
 * Todos los componentes que usaban base44.entities.X.list() etc. siguen funcionando sin cambios.
 */
import { supabase } from './supabaseClient';

// ── Mapa de nombres de entidad → nombre de tabla en Supabase ──────────────────
const TABLE_MAP = {
  Lead: 'leads',
  BuildConfig: 'build_config',
  TermsConfig: 'terms_config',
  SavedProject: 'saved_projects',
  AccessCode: 'access_codes',
};

// ── Constructor de entidad ────────────────────────────────────────────────────
function makeEntity(tableName) {
  return {
    // Listar todos los registros
    async list(orderBy = '-created_at', limit = 500) {
      const ascending = !orderBy.startsWith('-');
      const col = orderBy.replace(/^-/, '').replace('created_date', 'created_at');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(col, { ascending })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // Filtrar por condiciones
    async filter(conditions = {}, orderBy = '-created_at') {
      const ascending = !orderBy.startsWith('-');
      const col = orderBy.replace(/^-/, '').replace('created_date', 'created_at');
      let query = supabase.from(tableName).select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(col, { ascending })
        .limit(500);
      if (error) throw error;
      return data || [];
    },

    // Crear un registro
    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // Actualizar un registro
    async update(id, changes) {
      const { data, error } = await supabase
        .from(tableName)
        .update(changes)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // Eliminar un registro
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { id };
    },
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('No user');
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'user',
      pdf_unlocked: user.user_metadata?.pdf_unlocked || false,
    };
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = redirectUrl;
  },

  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/login?return=${encodeURIComponent(returnUrl)}` : '/login';
    window.location.href = url;
  },
};

// ── Funciones serverless (Cloudflare Workers) ─────────────────────────────────
const functions = {
  async invoke(fnName, payload) {
    const res = await fetch(`/api/${fnName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Function ${fnName} failed: ${res.statusText}`);
    return res.json();
  },
};

// ── Integraciones (LLM, imágenes) ─────────────────────────────────────────────
const integrations = {
  Core: {
    async InvokeLLM({ prompt, response_json_schema, add_context_from_internet }) {
      const res = await fetch('/api/invokeLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, response_json_schema }),
      });
      if (!res.ok) throw new Error('LLM call failed');
      const data = await res.json();
      return data.result;
    },

    async GenerateImage({ prompt }) {
      // Placeholder: devuelve una URL de imagen genérica
      console.warn('GenerateImage no disponible fuera de base44');
      return { url: 'https://placehold.co/512x512?text=Imagen+no+disponible' };
    },

    async SendEmail({ to, subject, body }) {
      const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!res.ok) throw new Error('SendEmail failed');
      return res.json();
    },
  },
};

// ── Exportación principal ─────────────────────────────────────────────────────
export const base44 = {
  auth,
  functions,
  integrations,
  entities: Object.fromEntries(
    Object.entries(TABLE_MAP).map(([name, table]) => [name, makeEntity(table)])
  ),
};
