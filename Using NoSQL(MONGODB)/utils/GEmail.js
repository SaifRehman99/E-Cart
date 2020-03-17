const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendMail = async options => {
    //==================================== USING OAUTH2 =================================================//

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAUTH2",
            user: process.env.USER,
            accessToken: process.env.ACCESS_TOKEN
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    //==================================== USING GOOGLE PASSWORD =================================================//

    // this is using google setting > security ? app password
    // let transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: "saifr7493@gmail.com",
    // this password was generated by them
    //         pass: "taaxcgabisccmuwh"
    //     },
    //     tls: {
    //         rejectUnauthorized: false
    //     }
    // });

    //===================================================================================================//

    //======================================SENDING HTML TEMPLATES and attachments ========================================//

    // ejs.renderFile(
    //     path.join(__dirname, "../views/pages/attachment.ejs"),
    //     (err, data) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             // send mail with defined transport object
    //             let message = {
    //                 from: ' "Saif Rehman" <saifr7493@gmail.com>',
    //                 to: req.body.email,
    //                 subject: "ECart",
    //                 text: "Thankyou for registering",
    //                 attachments: [{
    //                     filename: "two-macbook-pro-beside-gray-bowl-705675 (1).jpg",
    //                     path: "./two-macbook-pro-beside-gray-bowl-705675 (1).jpg"
    //                 }],
    //                 html: data
    //             };
    //             transporter.sendMail(message, (err, info) => {
    //                 if (err) {
    //                     return console.log(err);
    //                 }
    //                 console.log(info);
    //             });
    //         }
    //     }
    // );

    //==================================================================================================================//

    // send mail with defined transport object
    let message = {
        from: ' "Saif Rehman" <saifr7493@gmail.com>',
        to: req.body.email,
        subject: "ECart",
        text: "Thak"
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            return console.log(err);
        }
        console.log(info);
    });
};

module.exports = sendMail;