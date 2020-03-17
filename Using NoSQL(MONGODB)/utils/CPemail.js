const nodemailer = require("nodemailer");

const sendMail = async options => {
    const transporter = nodemailer.createTransport({
        host: "mail.f9construction.com",
        port: 465,
        secure: true,
        auth: {
            user: "test@f9construction.com",
            pass: "test12345"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    const message = {
        from: ' "Saif Rehman" <test@f9construction.com>',
        to: options.email,
        subject: options.subject,
        text: options.messagea
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
};

module.exports = sendMail;