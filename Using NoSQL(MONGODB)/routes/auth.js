const router = require("express").Router();
const User = require("../Models/User");
const bcryptjs = require("bcryptjs");
const isLogin = require("../middleware/isLog");

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
                    return res.redirect("/login");
                }
                bcryptjs.compare(req.body.password, user.password).then(Match => {
                    if (Match) {
                        // setting session here
                        req.session.loggedin = true;
                        req.session.user = user;
                        //optional to save the session proper
                        return req.session.save(err => {
                            res.redirect("/");
                        });
                    }
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
                        res.redirect("/login");
                    });
            })
            .catch(err => {
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