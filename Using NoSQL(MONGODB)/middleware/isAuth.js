module.exports = (req, res, next) => {
    if (!req.session.loggedin) {
        req.flash("error", "Login to view");
        return res.redirect("/login");
    }
    next();
};