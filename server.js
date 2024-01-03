require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar el cuerpo de la solicitud en formato JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

connection.connect((err) => {
  if (err) {
    console.log("Error al conectar a la base de datos 🚨", err);
  } else {
    console.log("Conexión exitosa 🚀");
  }
});


// // Crear la tabla en MySQL si no existe
// connection.query(`
//   CREATE TABLE IF NOT EXISTS datos_formulario (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     nombre VARCHAR(255) NOT NULL,
//     email VARCHAR(100) NOT NULL,
//     telefono VARCHAR(10) NOT NULL,
//     comentario TEXT NOT NULL,
//     fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `, (err, results) => {
//   if (err) {
//     console.error('Error al crear la tabla en MySQL:', err);
//   }
// });


// Obtener las credenciales desde variables de entorno
const emailUsuario = process.env.EMAIL_USER_1;
const contraseñaUsuario = process.env.EMAIL_PASS_1;
const destinatario = process.env.DESTINATARIO_EMAIL;

// Configurar el motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Ruta para procesar el envío de correos
app.post('/enviar-correo', async (req, res) => {
  try {
    const { nombre, telefono, email, comentario } = req.body;

    // Verificar si el número tiene 10 dígitos y comienza con "09"
    if (telefono.length === 10 && telefono.startsWith("09")) {
      // Transformar "09" a "+593" y utilizar el resto del número
      const numeroWhatsApp = "+593" + telefono.substring(1);

      // Construye el enlace de WhatsApp
      const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent("Hola, veo que estás interesado en...")}`;
      
      //Renderizo la plantilla .ejs      
      const templatePath = path.join(__dirname, 'views/correo-template.ejs');
      const htmlTemplate = await ejs.renderFile(templatePath, { nombre, telefono, email, comentario, enlaceWhatsApp });

      const mailOptions = {
        from: `"Nuevo Cliente" <${email}>`,
        to: destinatario,
        subject: "Nuevo Cliente desde la Web",
        html: htmlTemplate,
      };

      // Configuración del transporte de nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUsuario,
          pass: contraseñaUsuario,
        },
      });

      // Envia el correo electrónico
      const info = await transporter.sendMail(mailOptions);

      // Insertar datos en la tabla de formularios
      connection.query(
        'INSERT INTO datos_formulario (nombre, telefono, email, comentario) VALUES (?, ?, ?, ?)',
        [nombre, telefono, email, comentario],
        (err, results) => {
          if (err) {
            console.error('Error al insertar datos en MySQL:', err);
            res.status(500).json({ mensaje: 'Error al almacenar los datos en la base de datos' });
          } else {
            console.log('Datos almacenados en MySQL con éxito:', results);
            res.status(200).json({ mensaje: 'Correo enviado y datos almacenados con éxito' });
          }
        }
      );
    } else {
      // No es un número de celular válido, puedes realizar otra acción o simplemente no enviar el correo
      console.log("Número de teléfono no válido");
      res.status(400).json({ mensaje: 'Número de teléfono no válido' });
    }
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ mensaje: "Error al enviar el correo" });
  }
});


app.listen(PORT, () => {
  console.log(`Backend iniciado en http://localhost:${PORT}`);
});
