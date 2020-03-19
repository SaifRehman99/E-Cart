exports.get404 = (req, res, next) => {
    res.status(404).render("pages/404", {
        isLog: req.session.loggedin
    });
};
exports.get500 = (req, res, next) => {
    res.status(500).render("pages/500", {
        isLog: req.session.loggedin
    });
};