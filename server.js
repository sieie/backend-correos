require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar el cuerpo de la solicitud en formato JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Obtener las credenciales desde variables de entorno
const emailUsuario = process.env.EMAIL_USER;
const contraseñaUsuario = process.env.EMAIL_PASS;

// Ruta para procesar el envío de correos
app.post('/enviar-correo', (req, res) => {
  const { nombre, telefono, email, comentario } = req.body;

  // Configurar el transporte de nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUsuario,
      pass: contraseñaUsuario,
    },
  });

  // Lee el contenido del archivo HTML
  const templatePath = path.join(__dirname, 'mail/correo-template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Reemplaza las variables en el template HTML
  const templateReemplazado = htmlTemplate
    .replace('{{nombre}}', nombre)
    .replace('{{telefono}}', telefono)
    .replace('{{email}}', email)
    .replace('{{comentario}}', comentario)
    .replace('{{enlaceWhatsApp}}', `https://wa.me/${encodeURIComponent(telefono)}?text=${encodeURIComponent('Hola, veo que estás interesado en...')}`);

  // Detalles del correo electrónico con el template HTML
  const mailOptions = {
    from: `"${nombre}" <${email}>`,
    to: "edgareduardodelgadoscott@gmail.com",
    subject: "Nuevo Cliente desde la Web",
    html: templateReemplazado,
  };

  // Enviar el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      return res.status(500).json({ mensaje: "Error al enviar el correo" });
    }

    console.log("Correo enviado con éxito:", info.response);
    res.status(200).json({ mensaje: "Correo enviado con éxito" });
  });
});

app.listen(PORT, () => {
  console.log(`Backend iniciado en http://localhost:${PORT}`);
});
