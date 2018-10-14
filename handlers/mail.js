const nodemailer = require('nodemailer'); //interfaces with SMTP and different transports to send email
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

// transport : way to interface with different ways of sending email
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options); //takes name of file we are looking for
  const inlined = juice(html); // turns all of css into inline styles
    return inlined;
  }

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Diana Shin <noreply@dianashin.com>',
    to: options.user.email,
    subject: options.subject,
    html: html,
    text: text,
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
}

// transport.sendMail({
//   from: 'Diana Shin <diana.shin@gmail.com>',
//   to: 'ej83jun@gmail.com',
//   subject: 'Get better soon!!!!',
//   html: 'Stay <strong>strong</strong>!!!!',
//   text: 'Stay **strong**!!!'
// })
