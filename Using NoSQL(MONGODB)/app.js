const dotenv = require("dotenv").config({ path: "./config/config.env" });

const express = require("express");
const app = express();
const path = require("path");
const User = require("./Models/User");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const connect = require("./config/db");
const csrf = require("csurf");
const flash = require("connect-flash");

const csrfProtection = csrf();

// Storing session data in database and this middleware set cookie in the brower by default
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "mySessions"
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// using flash after session
app.use(flash());

app.use(csrfProtection);

app.use((req, res, next) => {
    // if user is logout
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(e => console.log("ok"));
});

// setting the locals var here
app.use((req, res, next) => {
    res.locals.isLog = req.session.loggedin;
    res.locals.csrf = req.csrfToken();
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", require("./routes/shop"));
app.use(require("./routes/auth"));

app.use((req, res, next) => {
    res.render("pages/404", {
        isLog: req.session.loggedin
    });
    next();
});

const PORT = 4765;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    connect();
});