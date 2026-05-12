import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Plus, RefreshCw, Trash2, CheckCircle2, X, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

const DEFAULT_SECTIONS = [
  { section_key: "section_1", title: "1. Partes involucradas", order: 1, content: 'El presente presupuesto es emitido por TOBYCO Constructora (en adelante "LA EMPRESA") con domicilio en la República Argentina, en respuesta a la solicitud del cliente identificado en la sección de datos del presente documento (en adelante "EL CLIENTE").' },
  { section_key: "section_2", title: "2. Validez del presupuesto", order: 2, content: "Este presupuesto tiene una validez de 30 (treinta) días corridos desde su fecha de emisión. Transcurrido dicho plazo, los valores deberán ser actualizados por LA EMPRESA conforme a la variación de costos de materiales, mano de obra y tipo de cambio vigente." },
  { section_key: "section_3", title: "3. Valores y moneda", order: 3, content: "Todos los valores están expresados en dólares estadounidenses (USD). Los precios NO incluyen impuestos nacionales, provinciales ni municipales (IVA, Ingresos Brutos, tasas municipales). El presupuesto es orientativo y puede variar por condiciones del terreno o especificaciones técnicas." },
  { section_key: "section_4", title: "4. Alcance de la obra", order: 4, content: "Los trabajos incluidos son únicamente aquellos descritos en las secciones anteriores de este documento. Cualquier modificación, ampliación o trabajo adicional deberá ser acordada por escrito entre las partes y dará lugar a un ajuste del presupuesto original." },
  { section_key: "section_5", title: "5. Forma de pago", order: 5, content: "Los desembolsos se realizarán por etapas de obra según el cronograma detallado en este documento. Cada certificado de avance deberá ser aprobado por ambas partes antes del pago correspondiente. TOBYCO ofrece opciones de financiación — consultar en www.tobycoconstructora.com.ar." },
  { section_key: "section_6", title: "6. Garantía y responsabilidad", order: 6, content: "TOBYCO Constructora garantiza la calidad de los trabajos ejecutados conforme a las normas IRAM y el Código de Edificación vigente. Se otorga garantía estructural de 10 años sobre la obra y 1 año sobre instalaciones y terminaciones a partir de la fecha de entrega final." },
  { section_key: "section_7", title: "7. Profesionales habilitados", order: 7, content: "Todos los trabajos son ejecutados por profesionales matriculados (arquitectos e ingenieros) con experiencia comprobable, cumpliendo la normativa vigente de cada municipio. TOBYCO se hace responsable de tramitar los permisos de obra necesarios." },
  { section_key: "section_8", title: "8. Resolución de conflictos", order: 8, content: "Ante cualquier diferencia entre las partes, se buscará resolución amistosa. En caso de no llegarse a un acuerdo, se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero." },
];

function SectionRow({ record, onSave, onDelete, saving, deleting }) {
  const [title, setTitle] = useState(record.title || "");
  const [content, setContent] = useState(record.content || "");
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const change = (setter) => (e) => { setter(e.target.value); setDirty(true); setSavedMsg(false); };

  const handleSave = () => {
    onSave({ ...record, title, content }, () => { setDirty(false); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2500); });
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${dirty ? "border-primary/40" : "border-border"}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title || record.title}</span>
          {dirty && <Badge variant="outline" className="text-[10px] border-primary text-primary">Modificado</Badge>}
          {savedMsg && <span className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Guardado</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-background">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Título de la cláusula</label>
            <Input value={title} onChange={change(setTitle)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Contenido</label>
            <Textarea value={content} onChange={change(setContent)} className="text-sm min-h-[80px] resize-y" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5 text-xs"
              onClick={() => onDelete(record)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Eliminar cláusula
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty} className="gap-1.5 h-8">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TermsEditor() {
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["terms_config"],
    queryFn: () => base44.entities.TermsConfig.list("order", 50),
  });

  const seedDefaults = async () => {
    setSeeding(true);
    const existing = new Set(sections.map(s => s.section_key));
    const toCreate = DEFAULT_SECTIONS.filter(s => !existing.has(s.section_key));
    for (const row of toCreate) await base44.entities.TermsConfig.create(row);
    queryClient.invalidateQueries({ queryKey: ["terms_config"] });
    setGlobalMsg(toCreate.length > 0 ? `${toCreate.length} cláusulas inicializadas.` : "Todo al día.");
    setSeeding(false);
  };

  const handleSave = async (record, onDone) => {
    setSavingKey(record.section_key);
    if (record.id) {
      await base44.entities.TermsConfig.update(record.id, { title: record.title, content: record.content });
    } else {
      await base44.entities.TermsConfig.create(record);
    }
    queryClient.invalidateQueries({ queryKey: ["terms_config"] });
    onDone?.();
    setSavingKey(null);
  };

  const handleDelete = async (record) => {
    setDeletingKey(record.section_key);
    await base44.entities.TermsConfig.delete(record.id);
    queryClient.invalidateQueries({ queryKey: ["terms_config"] });
    setDeletingKey(null);
  };

  const handleAddNew = async () => {
    if (!newTitle.trim()) return;
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.order || 0), 0);
    await base44.entities.TermsConfig.create({
      section_key: `section_${Date.now()}`,
      title: newTitle,
      content: newContent,
      order: maxOrder + 1,
    });
    queryClient.invalidateQueries({ queryKey: ["terms_config"] });
    setNewTitle("");
    setNewContent("");
    setAddingNew(false);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" /> Cargando términos...
    </div>
  );

  const sorted = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Términos y Condiciones del PDF</h2>
          <p className="text-sm text-muted-foreground">Editá el contenido de cada cláusula que aparece en los presupuestos generados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={seedDefaults} disabled={seeding} className="gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Inicializar defaults
          </Button>
          <Button size="sm" onClick={() => setAddingNew(p => !p)} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva cláusula
          </Button>
        </div>
      </div>

      {globalMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{globalMsg}</span>
          <button type="button" onClick={() => setGlobalMsg(null)}><X className="w-4 h-4 hover:opacity-70" /></button>
        </div>
      )}

      {sections.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No hay cláusulas guardadas. Hacé clic en <strong>"Inicializar defaults"</strong> para cargar las cláusulas estándar.
        </div>
      )}

      {addingNew && (
        <div className="border border-primary/40 rounded-xl p-4 space-y-3 bg-primary/5">
          <h3 className="font-semibold text-sm">Nueva cláusula</h3>
          <Input placeholder="Título de la cláusula (ej: 9. Confidencialidad)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-8 text-sm" />
          <Textarea placeholder="Contenido de la cláusula..." value={newContent} onChange={e => setNewContent(e.target.value)} className="text-sm min-h-[80px]" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setAddingNew(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddNew} disabled={!newTitle.trim()} className="gap-1.5">
              <Plus className="w-3 h-3" /> Agregar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(section => (
          <SectionRow
            key={section.id || section.section_key}
            record={section}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={savingKey === section.section_key}
            deleting={deletingKey === section.section_key}
          />
        ))}
      </div>
    </div>
  );
}