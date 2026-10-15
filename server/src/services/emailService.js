const nodemailer = require('nodemailer');

// Transporte SMTP do Gmail / Google Workspace
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nilson.vinicius@academico.ifpb.edu.br',
    pass: process.env.EMAIL_PASS || 'rcmx cjkk qqqa oqkq'
  }
});

/**
 * Dispara e-mail de boas-vindas com credenciais temporárias para novos colaboradores
 */
async function enviarEmailBoasVindas(emailDestino, nomeUsuario, senhaTemporaria) {
  const mailOptions = {
    from: '"NetStock Infraestrutura" <nilson.vinicius@academico.ifpb.edu.br>',
    to: emailDestino,
    subject: '🔑 Acesso Concedido ao Sistema NetStock',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #ffffff; padding: 28px; border-radius: 12px; max-width: 520px; margin: 0 auto; border: 1px solid rgba(0, 210, 255, 0.3);">
        <h2 style="color: #00d2ff; margin-top: 0; font-size: 1.4rem;">NetStock - Acesso ao Sistema</h2>
        <p style="font-size: 0.95rem; color: #e2e8f0;">Olá, <strong>${nomeUsuario}</strong>,</p>
        <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5;">Sua conta de colaborador foi cadastrada com sucesso pela Administração do sistema.</p>
        
        <div style="background: #1e293b; padding: 18px; border-radius: 8px; border-left: 4px solid #00d2ff; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 0.88rem; color: #cbd5e1;"><strong>E-mail de Acesso:</strong> ${emailDestino}</p>
          <p style="margin: 4px 0; font-size: 0.88rem; color: #cbd5e1;"><strong>Senha Temporária:</strong> <span style="color: #00d2ff; font-family: monospace; font-size: 1rem; font-weight: bold;">${senhaTemporaria}</span></p>
        </div>

        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.4;">
          🔒 <strong>Segurança:</strong> Após efetuar seu primeiro acesso em <a href="http://localhost:3001" style="color: #00d2ff;">login.html</a>, acesse o menu <em>"Minha Conta / Alterar Senha"</em> no canto superior direito para definir sua senha pessoal.
        </p>

        <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;" />
        <small style="color: #64748b; font-size: 0.75rem; display: block; text-align: center;">Mensagem automática gerada pelo NetStock Asset Management.</small>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 E-mail de boas-vindas enviado com sucesso para ${emailDestino} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Erro no envio de e-mail via Nodemailer:', error.message);
    return false;
  }
}

module.exports = { enviarEmailBoasVindas };