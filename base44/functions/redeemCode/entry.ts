import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'Código inválido' }, { status: 400 });
    }

    const normalizedCode = code.trim();

    // Master code — always works, never consumed
    if (normalizedCode === '@tobycoconstructora') {
      const users = await base44.asServiceRole.entities.User.filter({ email: user.email });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, { pdf_unlocked: true });
      }
      console.log(`Master code used by ${user.email}`);
      return Response.json({ success: true, message: 'PDF desbloqueado con código maestro' });
    }

    // Find the code
    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode.toUpperCase() });

    if (codes.length === 0) {
      return Response.json({ error: 'El código no existe o es incorrecto' }, { status: 404 });
    }

    const accessCode = codes[0];

    if (accessCode.used) {
      return Response.json({ error: 'Este código ya fue utilizado' }, { status: 409 });
    }

    // Check if this user already has pdf_unlocked
    if (user.pdf_unlocked === true) {
      return Response.json({ error: 'Tu cuenta ya tiene el PDF desbloqueado' }, { status: 409 });
    }

    // Mark code as used
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      used: true,
      used_by_email: user.email,
      used_at: new Date().toISOString(),
    });

    // Unlock PDF for user
    const users = await base44.asServiceRole.entities.User.filter({ email: user.email });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, { pdf_unlocked: true });
    }

    console.log(`Code ${normalizedCode} redeemed by ${user.email}`);
    return Response.json({ success: true, message: 'PDF desbloqueado correctamente' });

  } catch (error) {
    console.error('Redeem error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});