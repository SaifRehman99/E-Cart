const dotenv = require('dotenv').config({ path: "./config/config.env" });

const express = require("express");
const app = express();
const path = require("path");
const User = require('./Models/User')
const connect = require('./config/db')

app.set("view engine", "ejs");
app.set("views", "views");

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
    User.findById('5e68f6771231311364e4bcc6').then(user => {
        req.user = user;
        next();
    }).catch(e => console.log(E))
});


app.use('/', require('./routes/shop'))

app.use((req, res, next) => {
    res.render("pages/404");
    next();
});

const PORT = process.env.PORT || 4765;


app.listen(PORT, () => {

    User.findOne().then(user => {
        if (!user) {
            return User.create({ name: "Saif", email: "saif@gmail.com", cart: { items: [] } })
        }
    })
    console.log('App listening on port 3000!');

});