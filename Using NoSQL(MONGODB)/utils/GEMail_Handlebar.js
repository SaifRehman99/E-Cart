const nodemailer = require("nodemailer");
const hbs = require("nodemailer-handlebars");

// Step 1
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL || "abc@gmail.com", // TODO: your gmail account
        pass: process.env.PASSWORD || "1234" // TODO: your gmail password
    }
});

// Step 2
transporter.use(
    "compile",
    hbs({
        viewEngine: "express-handlebars",
        viewPath: "./views/"
    })
);

// Step 3
let mailOptions = {
    from: "tabbnabbers@gmail.com", // TODO: email sender
    to: "deltamavericks@gmail.com", // TODO: email receiver
    subject: "Nodemailer - Test",
    text: "Wooohooo it works!!",
    template: "index",
    context: {
        name: "Accime Esterling"
    } // send extra values to template
};

// Step 4
transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        return log("Error occurs");
    }
    return log("Email sent!!!");
});