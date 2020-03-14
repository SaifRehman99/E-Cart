const router = require("express").Router();
const Product = require("../Models/products");
const Order = require("../Models/order");

router.get("/", (req, res) => {
    Product.find()
        .then(products => {
            res.render("pages/index", {
                product: products,
                path: "/",
                isLog: req.session.loggedin
            });
        })
        .catch(err => console.log(err));
});

router
    .route("/add-products")
    .get((req, res) => {
        res.render("pages/add-products", {
            path: "/add-products",
            isLog: req.session.loggedin
        });
    })
    .post(async(req, res) => {
        // validation here
        if (!req.body.title ||
            !req.body.description ||
            !req.body.price ||
            !req.body.imageURL
        ) {
            return res.status(404).send("Kindly fill the form");
        }

        try {
            // setting the user id here
            req.body.userID = req.user;

            const prod = await Product.create(req.body);

            if (prod) {
                console.log("Product Created");
                res.redirect("/");
            }
        } catch (error) {
            res.redirect("/404");
            console.log(error);
        }
    });

router.get("/details/:id", (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render("pages/product-details", {
                product,
                isLog: req.session.loggedin
            });
        })
        .catch(err => console.log(err));
});

router.get("/admin", (req, res) => {
    Product.find()
        .then(products => {
            res.render("pages/admin-products", {
                product: products,
                path: "/admin",
                isLog: req.session.loggedin
            });
        })
        .catch(err => console.log(err));
});

router
    .route("/productUpdate/:id")
    .get(async(req, res) => {
        try {
            const prod = await Product.findById(req.params.id);

            if (!prod) {
                return res.status(404).send("No Product Found");
            }
            res.render("pages/edit-products", {
                prod
            });
        } catch (e) {
            console.log(e);
        }
    })
    .post(async(req, res) => {
        try {
            const prod = await Product.findById(req.params.id);

            if (!prod) {
                return res.status(404).send("No Product Found");
            }

            const updateProd = await Product.findByIdAndUpdate(
                req.params.id,
                req.body
            );
            res.redirect("/admin");
        } catch (e) {
            console.log(e);
        }
    });

router.get("/productDelete/:id", async(req, res) => {
    try {
        const prod = await Product.findById(req.params.id);

        if (!prod) {
            return res.status(404).send("No Product Found");
        }

        const deleteProd = await Product.findByIdAndRemove(req.params.id);
        res.redirect("/admin");
    } catch (e) {
        console.log(e);
    }
});

router.get("/cart", (req, res) => {
    req.user
        .populate("cart.items.productID")
        .execPopulate()
        .then(user => {
            res.render("pages/cart", {
                user: user.cart.items,
                path: "/cart",
                isLog: req.session.loggedin
            });
        })
        .catch(e => console.log(e));
});

router.post("/addtocart/:id", (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            return req.user.addCart(product);
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(e => console.log(e));
});

router.post("/cartDelete/:id", (req, res) => {
    req.user
        .removeCart(req.params.id)
        .then(result => res.redirect("/cart"))
        .catch(e => console.log(e));
});

router
    .route("/order")
    .get((req, res) => {
        Order.find()
            .then(orders => {
                res.render("pages/order", {
                    orders,
                    path: "/order",
                    isLog: req.session.loggedin
                });
            })
            .catch(e => console.log(e));
    })
    .post((req, res) => {
        req.user
            .populate("cart.items.productID")
            .execPopulate()
            .then(user => {
                const userData = user.cart.items.map(item => {
                    return {
                        product: {...item.productID._doc },
                        quantity: item.quantity
                    };
                });
                return Order.create({
                        user: {
                            name: req.user.name,
                            userID: req.user
                        },
                        products: userData
                    })
                    .then(result => {
                        return req.user.clearCart();
                    })
                    .then(() => res.redirect("/order"));
            })
            .catch(e => console.log(e));
    });

module.exports = router;