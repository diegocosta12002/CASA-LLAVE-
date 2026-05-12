import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TOBY-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { lead_id, lead_name, lead_email } = await req.json();

    if (!lead_id) {
      return Response.json({ error: 'lead_id requerido' }, { status: 400 });
    }

    // Check if code already exists for this lead
    const existing = await base44.asServiceRole.entities.AccessCode.filter({ lead_id });
    if (existing.length > 0) {
      return Response.json({ code: existing[0].code, already_existed: true });
    }

    // Generate unique code
    let code;
    let attempts = 0;
    while (attempts < 10) {
      code = generateCode();
      const found = await base44.asServiceRole.entities.AccessCode.filter({ code });
      if (found.length === 0) break;
      attempts++;
    }

    await base44.asServiceRole.entities.AccessCode.create({
      code,
      lead_id,
      lead_name: lead_name || '',
      lead_email: lead_email || '',
      used: false,
    });

    console.log(`Generated code ${code} for lead ${lead_id}`);

    // Send email to client if email is available
    if (lead_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'TOBYCO Constructora',
          to: lead_email,
          subject: '🏠 Tu código de acceso Premium — TOBYCO Constructora',
          body: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:#b45309;padding:32px 40px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:2px;">TOBYCO</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">Constructora · Tu casa, a tu medida</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hola, <strong>${lead_name || 'cliente'}</strong> 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
              ¡Gracias por tu confianza! Hemos confirmado tu pago y ya podés acceder a tu <strong>Presupuesto PDF Premium</strong> con el siguiente código:
            </p>

            <!-- Code Box -->
            <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
              <div style="font-size:12px;color:#92400e;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Tu código de acceso</div>
              <div style="font-size:32px;font-weight:800;color:#b45309;letter-spacing:6px;font-family:monospace;">${code}</div>
              <div style="font-size:12px;color:#b45309;margin-top:8px;">⚠️ Este código es de uso único y personal</div>
            </div>

            <!-- Instructions -->
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">¿Cómo usarlo?</p>
            <ol style="margin:0 0 28px;padding-left:20px;color:#6b7280;font-size:14px;line-height:2;">
              <li>Ingresá al <a href="https://www.tobycoconstructora.com.ar" style="color:#b45309;">configurador online</a></li>
              <li>Completá tu configuración y llegá al resumen</li>
              <li>Hacé clic en <strong>"Ya tengo mi código — Ingresar"</strong></li>
              <li>Ingresá el código de arriba y descargá tu PDF</li>
            </ol>

            <!-- What's included -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 28px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#166534;">✅ Tu PDF Premium incluye:</p>
              <ul style="margin:0;padding-left:18px;color:#15803d;font-size:13px;line-height:1.9;">
                <li>Presupuesto detallado con toda tu configuración</li>
                <li>Diagrama de Gantt con cronograma de obra</li>
                <li>Cronograma de desembolsos por etapa</li>
                <li>Términos y condiciones de la obra</li>
              </ul>
            </div>

            <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;line-height:1.6;">
              Si tenés alguna consulta, no dudes en contactarnos por email o WhatsApp.
            </p>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="https://www.tobycoconstructora.com.ar/configurator" style="display:inline-block;background:#b45309;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
                Ir al configurador →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f5f0;border-top:1px solid #e5e0da;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">TOBYCO Constructora · info@tobyco.com.ar</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">+54 9 11 4041-9044 · www.tobycoconstructora.com.ar</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
          `.trim(),
        });
        console.log(`Email sent to ${lead_email}`);
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
        // Don't fail the whole request if email fails
      }
    }

    return Response.json({ code, email_sent: !!lead_email });

  } catch (error) {
    console.error('Generate code error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});