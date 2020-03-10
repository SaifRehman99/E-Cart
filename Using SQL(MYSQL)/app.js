const dotenv = require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const app = express();
const path = require("path");
const sequelize = require("./config/db");
const Product = require("./Models/products");
const User = require("./Models/User");
const Cart = require("./Models/cart");
const cartItem = require("./Models/cartItem");
const Order = require("./Models/order");
const orderItem = require("./Models/orderItem");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            // not only object but complete sequelize obj
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.get("/", (req, res) => {
    Product.findAll()
        .then(products => {
            res.render("pages/index", {
                product: products
            });
        })
        .catch(err => console.log(err));
});

app.get("/add-products", (req, res) => {
    res.render("pages/add-products");
});

app.post("/add-products", async(req, res) => {
    if (!req.body.title || !req.body.description || !req.body.price) {
        return res.status(404).send("Kindly fill the form");
    }

    try {
        // simple create here
        // const data = await Product.create(req.body);

        // magic association here, association h islea khd bananrha ye methods wo
        const data = await req.user.createProduct(req.body);

        res.redirect("/");
    } catch (e) {
        res.redirect("/404");
    }
});

app.get("/details/:id", (req, res) => {
    Product.findByPk(req.params.id)
        .then(product => {
            res.render("pages/product-details", {
                product
            });
        })
        .catch(err => console.log(err));
});

app.get("/admin", (req, res) => {
    Product.findAll()
        .then(products => {
            res.render("pages/admin-products", {
                product: products
            });
        })
        .catch(err => console.log(err));
});

app.get("/productUpdate/:id", (req, res) => {
    // it return only the login user product and array of it
    req.user
        .getProducts({ where: { id: req.params.id } })
        // Product.findByPk(req.params.id)
        .then(products => {
            let product = products[0];
            if (!product) {
                return res.redirect("/");
            }
            res.render("pages/edit-products", {
                product
            });
        })
        .catch(err => console.log(err));
});

app.post("/productUpdate/:id", (req, res) => {
    Product.findByPk(req.params.id)
        .then(product => {
            product.title = req.body.title;
            product.description = req.body.description;
            product.image = req.body.image;
            product.price = req.body.price;
            return product.save();
        })
        .then(() => {
            console.log("Product Updated!");
            res.redirect("/admin");
        })
        .catch(err => console.log(err));
});

app.get("/productDelete/:id", (req, res) => {
    Product.findByPk(req.params.id)
        .then(product => {
            return product.destroy();
        })
        .then(() => {
            console.log("Product Deleted!");
            res.redirect("/admin");
        })
        .catch(err => console.log(err));
});

app.get("/cart", (req, res) => {
    // getting the cart and populating with products
    req.user
        .getCart()
        .then(cart => {
            // CART is empty
            // if (!cart) {
            //     return res.render("pages/cart", {
            //         products: cart
            //     });
            // }
            return cart
                .getProducts()
                .then(products => {
                    res.render("pages/cart", {
                        products
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

app.post("/addtocart/:id", (req, res) => {
    let fetchedCart;
    let newQuantity = 1;

    // getting the cart here
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            // getting the cart products here
            return cart.getProducts({ where: { id: req.params.id } });
        })
        .then(products => {
            let product;
            console.log(products);
            if (products.length > 0) {
                product = products[0];
            }

            // if new product add to cart, products[0] undefined wrna true
            // if that product already there
            if (product) {
                let oldQuantity = product.cartItem.quantity;
                newQuantity += oldQuantity;
                return product;
            }

            // if not, getting that product and adding in to cart
            return Product.findByPk(req.params.id);
        })
        .then(product => {
            // this will resolve for either new product or add quantity
            return fetchedCart.addProducts(product, {
                through: { quantity: newQuantity }
            });
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch(e => console.log(e));
});

app.post("/cartDelete/:id", (req, res) => {
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: req.params.id } });
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(e => console.log(e));
});

app.get("/order", (req, res) => {
    res.render("pages/order");
});

app.use((req, res, next) => {
    res.render("pages/404");
    next();
});

const PORT = process.env.PORT || 4765;

// association here
// product and user
// both realtion same
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

// cart and user association
// both realtion same
User.hasOne(Cart);
Cart.belongsTo(User);

// cart and products
// both realtion same
Cart.belongsToMany(Product, { through: cartItem });
Product.belongsToMany(Cart, { through: cartItem });

// cart, order and user
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: orderItem });

sequelize
// .sync({ force: true })
    .sync()
    .then(data => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            console.log("no");
            return User.create({ name: "SAIF", email: "saif@gmail.com" });
        }
        return user;
    })
    // .then(user => {
    //     return user.createCart();
    // })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Started on PORT ${PORT} and connected to DB`);
        });
    })
    .catch(err => console.log(err));