const { request, response } = require("express");
const nodeMailer = require("nodemailer");

const envioCorreo = (req = request, resp = response) => {
  let body = req.body;
  let config = nodeMailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    // port: 465, Puerto de ejemplo
    // secure: true, //igual a true si es ssl y false si no lo es
    auth: {
      user: process.env.CORREO_ELECTRONICO, // correo electronico que enviara el mensaje
      pass: process.env.PASSWORD_CORREO, // contraseña del correo electronico
    },
  });

  const opciones = {
    from: 'Nuevo Cliente',
    subject: body.asunto,
    to: body.email,
    text: body.mensaje
  };

  config.sendMail(opciones,function(error, result) {
    if (error) return resp.json({ ok:false, msg:error });

    return resp.json({
        ok:true,
        msg:result
    });
  })
};


module.exports = {
    envioCorreo
}
