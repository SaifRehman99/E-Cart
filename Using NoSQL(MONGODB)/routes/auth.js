const router = require("express").Router();
const User = require("../Models/User");
const bcryptjs = require("bcryptjs");
const isLogin = require("../middleware/isLog");
const nodemailer = require("nodemailer");

// this is using google setting > security ? app password
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_NAME,
        // this password was generated by them
        pass: process.env.PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

router
    .route("/login")
    .get(isLogin, (req, res) => {
        // cookie data
        // let loggedin = req.get('Cookie').split(';')[1].split('=')[1] === 'true';

        res.render("pages/login", {
            path: "/login",
            isLog: false
        });
    })
    .post((req, res) => {
        // setting the cookie header here
        // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');

        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash("error", "No email Found");
                    return res.redirect("/login");
                }
                bcryptjs.compare(req.body.password, user.password).then(Match => {
                    if (Match) {
                        req.flash("success", "Login Success");

                        // setting session here
                        req.session.loggedin = true;
                        req.session.user = user;
                        //optional to save the session proper
                        return req.session.save(err => {
                            res.redirect("/");
                        });
                    }
                    req.flash("error", "Password Doesnt match");
                    res.redirect("/login");
                });
            })
            .catch(e => console.log(e));
    });

router
    .route("/register")
    .get(isLogin, (req, res) => {
        res.render("pages/register", {
            isLog: false,
            path: "/register"
        });
    })
    .post((req, res) => {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    req.flash("error", "This is email is already registered");
                    return res.redirect("/register");
                }

                return bcryptjs
                    .hash(req.body.password, 12)
                    .then(hashedPass => {
                        return User.create({
                            email: req.body.email,
                            password: hashedPass,
                            cart: { items: [] }
                        });
                    })
                    .then(USER => {
                        // send mail with defined transport object
                        let message = {
                            from: ' "Saif Rehman" <saifr7493@gmail.com>',
                            to: req.body.email,
                            subject: "ECart",
                            text: "Thankyou for registering",
                            attachments: [{
                                filename: "two-macbook-pro-beside-gray-bowl-705675 (1).jpg",
                                path: "./two-macbook-pro-beside-gray-bowl-705675 (1).jpg"
                            }]
                        };

                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                return console.log(err);
                            }
                            console.log(info);
                        });
                        req.flash("success", "User registered");
                        res.redirect("/login");
                    });
            })
            .catch(err => {
                req.flash("error", "Error");

                res.redirect("/register");
            });
    });

// clearing the cookie of session here from server
router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/login");
    });
});
module.exports = router;