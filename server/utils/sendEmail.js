const nodeMailer = require('nodemailer');
const mime = require("mime");

function arrayBufferToBase64(arrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const transporter = nodeMailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  service: 'gmail',
  // secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (payload = {
  to: 'example@gmail.com',
  subject: 'Default Subject',
  text: 'Default text content',
  html: '<p>Default HTML content</p>',
  attachments: []
}) => {
  try {

    let finalAttachments = [];
    if (payload?.attachments?.length > 0) {
      for (const a of payload.attachments) {
        let t = [];
        let path = a;
        let fileName = "";
        if (a?.filename !== undefined) {
          t = a.filename?.split(".");
          path = a.path;
          fileName = a.filename;
        } else {
          t = a?.split(".");
          path = a;
          let temp = a.split("/");
          fileName = temp[temp.length - 1];
        }

        const extension = t[t.length - 1];

        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const base64Image = arrayBufferToBase64(arrayBuffer);
        finalAttachments.push({
          name: fileName,
          content_type: mime.getType(extension),
          data: base64Image,
        });
      }
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: payload.to,
      ...(payload.subject && {subject: payload.subject}),
      ...(payload.text && {text: payload.text}),
      ...(payload.html && {html: payload.html}),
      ...(payload.attachments && {attachments: finalAttachments}),
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message);
        return process.exit(1);
      }

      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info));
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = sendEmail;