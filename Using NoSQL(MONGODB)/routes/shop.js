const router = require("express").Router();
const Product = require("../Models/products");
const Order = require("../Models/order");
const isAuth = require("../middleware/isAuth");

router.get("/", (req, res) => {
    Product.find()
        .then(products => {
            res.render("pages/index", {
                product: products,
                path: "/"
            });
        })
        .catch(err => console.log(err));
});

router
    .route("/add-products")
    .get(isAuth, (req, res) => {
        res.render("pages/add-products", {
            path: "/add-products"
        });
    })
    .post(isAuth, async(req, res) => {
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
                req.flash("success", "Product Created!");
                res.redirect("/");
            }
        } catch (error) {
            res.redirect("/404");
            console.log(error);
        }
    });

router.get("/details/:id", isAuth, (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render("pages/product-details", {
                product
            });
        })
        .catch(err => console.log(err));
});

router.get("/admin", isAuth, (req, res) => {
    // only logged user can view edit his product
    Product.find({ userID: req.user._id })
        .then(products => {
            res.render("pages/admin-products", {
                product: products,
                path: "/admin"
            });
        })
        .catch(err => console.log(err));
});

router
    .route("/productUpdate/:id", isAuth)
    .get(async(req, res) => {
        try {
            const prod = await Product.findById(req.params.id);
            if (prod.userID.toString() !== req.user._id.toString()) {
                req.flash("error", "Not Authorized!");
                return res.redirect("/login");
            }

            if (!prod) {
                req.flash("error", "Not authorized!");
                return res.redirect("/login");
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
            if (prod.userID.toString() != req.user._id.toString()) {
                req.flash("error", "Not Authorized!");
                return res.redirect("/login");
            }

            if (!prod) {
                return res.status(404).send("No Product Found");
            }

            const updateProd = await Product.findByIdAndUpdate(
                req.params.id,
                req.body
            );

            req.flash("success", "Product Updated!");

            res.redirect("/admin");
        } catch (e) {
            console.log(e);
        }
    });

router.get("/productDelete/:id", isAuth, async(req, res) => {
    try {
        const prod = await Product.findById(req.params.id);

        if (prod.userID.toString() != req.user._id.toString()) {
            req.flash("error", "Not Authorized!");
            return res.redirect("/login");
        }

        if (!prod) {
            req.flash("error", "Not Authorized");
            return res.redirect("/login");
        }

        const deleteProd = await Product.findByIdAndRemove(req.params.id);
        if (deleteProd) {
            req.flash("success", "Product deleted!");
            res.redirect("/admin");
        }
    } catch (e) {
        console.log(e);
    }
});

router.get("/cart", isAuth, (req, res) => {
    req.user
        .populate("cart.items.productID")
        .execPopulate()
        .then(user => {
            console.log(user);
            res.render("pages/cart", {
                user: user.cart.items,
                path: "/cart"
            });
        })
        .catch(e => console.log(e));
});

router.post("/addtocart/:id", isAuth, (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            return req.user.addCart(product);
        })
        .then(result => {
            req.flash("success", "Product Added to cart!");
            res.redirect("/cart");
        })

    .catch(e => console.log(e));
});

router.post("/cartDelete/:id", isAuth, (req, res) => {
    req.user
        .removeCart(req.params.id)
        .then(result => {
            req.flash("success", "Product Deleted!");

            res.redirect("/cart");
        })
        .catch(e => console.log(e));
});

router
    .route("/order", isAuth)
    .get((req, res) => {
        Order.find()
            .then(orders => {
                res.render("pages/order", {
                    orders,
                    path: "/order"
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
                            email: req.user.email,
                            userID: req.user
                        },
                        products: userData
                    })
                    .then(result => {
                        return req.user.clearCart();
                    })
                    .then(() => {
                        req.flash("success", "Product Ordered!!");

                        res.redirect("/order");
                    });
            })
            .catch(e => console.log(e));
    });

module.exports = router;