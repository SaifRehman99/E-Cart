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
const error = require("./middleware/error");

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

// setting the locals var here
app.use((req, res, next) => {
    res.locals.isLog = req.session.loggedin;
    res.locals.csrf = req.csrfToken();
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
//setting the token before do something on middleware

app.use((req, res, next) => {
    // if user is logout
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(e => console.log("ok"));
});

app.use("/", require("./routes/shop"));
app.use(require("./routes/auth"));

app.get("/500", error.get500);
app.use(error.get404);

// error middleware here
app.use((error, req, res, next) => {
    res.redirect("/500");
});

const PORT = 4765;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    connect();
});