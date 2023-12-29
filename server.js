require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const PORT = process.env.PORT;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(require('./routes/correoRouter'));


app.listen(PORT, () => {
  console.log(`Ejecutando BackEnd http://localhost:${PORT}`);
});


// const express = require('express');
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT;

// app.use(cors());
// app.use(bodyParser.json());

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.DESTINATARIO_EMAIL,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// app.post('/enviar-correo', (req, res) => {
//   const { nombre, correo, mensaje } = req.body;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.DESTINATARIO_EMAIL,
//     subject: 'Nuevo mensaje de contacto',
//     text: `Nombre: ${nombre}\nCorreo: ${correo}\nMensaje: ${mensaje}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).json({ success: false, error: 'Error al enviar el correo' });
//     }

//     console.log('Correo enviado:', info.response);
//     res.status(200).json({ success: true, message: 'Correo enviado con éxito' });
//   });
// });
