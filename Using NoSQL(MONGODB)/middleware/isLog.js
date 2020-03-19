module.exports = (req, res, next) => {
    if (req.session.user) {
        req.flash("error", "Already login");
        return res.redirect("/");
    }
    next();
};