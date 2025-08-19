const nodemailer = require('nodemailer');

async function crearTransporterEthereal() {
    const testAccount =  await nodemailer.createTestAccount();

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
         auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

exports.enviarCorreoRecuperacion = async (destinatario, token) => {
  try {
    const transporter = await crearTransporterEthereal();

    const url = `http://localhost:4200/reset-password?token=${token}`;

    const mailOptions = {
      from: '"Banco" <no-reply@banco.com>',
      to: destinatario,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${url}">${url}</a>
        <p>Este enlace caduca en 15 minutos.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('correo de recuperación enviado(ETHEREAL)');
    console.log('vista previa:', nodemailer.getTestMessageUrl(info));

    return info;
    
    }catch (error) {
        console.log('error al enviar el correo:', error);
        throw error;
    }
};


exports.enviarCorreoTicket = async (destinatario, motivo, mensaje) => {
    try {
      const transporter = await crearTransporterEthereal();

      const mailOptions = {
      from: '"Banco" <no-reply@banco.com>',
      to: destinatario,
      subject: 'Confirmación de creación de ticket',
      html: `
          <p>Hola,</p>
          <p>Hemos recibido tu ticket con el siguiente detalle:</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Mensaje:</strong> ${mensaje}</p>
          <p>Nos pondremos en contacto contigo lo antes posible.</p>
      `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Correo de ticket enviado (ETHEREAL)');
      console.log('Vista previa:', nodemailer.getTestMessageUrl(info));
      return info;
  } catch (error) {
      console.log('Error al enviar el correo de ticket:', error);
      throw error;
  }
  };


