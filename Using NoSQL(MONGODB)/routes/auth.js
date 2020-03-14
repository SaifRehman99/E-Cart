const router = require("express").Router();
const User = require("../Models/User");

router
    .route("/login")
    .get((req, res) => {
        // cookie data
        // let loggedin = req.get('Cookie').split(';')[1].split('=')[1] === 'true';

        res.render("pages/login", {
            path: "/login",
            isLog: req.session.loggedin
        });
    })
    .post((req, res) => {
        // setting the cookie header here
        // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');

        User.findById("5e68f6771231311364e4bcc6")
            .then(user => {
                // setting session here
                req.session.loggedin = true;
                req.session.user = user;

                //optional to save the session proper
                req.session.save(err => {
                    res.redirect("/");
                });
            })
            .catch(e => console.log(E));
    });

// clearing the cookie of session here from server
router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/login");
    });
});

router.route("/register").get((req, res) => {
    res.render("pages/register", {
        isLog: req.session.loggedin
    });
});

module.exports = router;