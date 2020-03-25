const router = require("express").Router();
const Product = require("../Models/products");
const Order = require("../Models/order");
const isAuth = require("../middleware/isAuth");
const fs = require("fs");
const path = require("path");
const PdfDocument = require("pdfkit");
const helper = require("../utils/delete");

// FOR PAGINATION
const DATA_LIMIT = 1;

router.get("/", async(req, res) => {
    // express session here for the visiting page
    if (req.session.page_views) {
        req.session.page_views++;
        console.log("You visited this page " + req.session.page_views + " times");
    } else {
        req.session.page_views = 1;
        console.log("Welcome to this page for the first time!");
    }
    //THIS IS STRING, ISLEA WE ADD + here
    //if page num undefined tou 1 ajayega
    const page = +req.query.page || 1;

    // getting all the documents here
    const total = await Product.countDocuments();

    Product.find()
        .skip((page - 1) * DATA_LIMIT)
        .limit(DATA_LIMIT)
        .then(products => {
            res.render("pages/index", {
                product: products,
                path: "/",
                total: total,
                DATA_LIMIT: DATA_LIMIT,
                currentPage: page,
                hasNextPage: DATA_LIMIT * page < total,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(total / DATA_LIMIT)
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
            !req.file ||
            !req.body.price
        ) {
            return res.status(404).send("Kindly fill the form");
        }

        try {
            // setting the user id here

            const prod = await Product.create({
                title: req.body.title,
                description: req.body.description,
                image: req.file.path,
                price: req.body.price,
                userID: req.user
            });

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

            // if previous ha tou
            if (prod.image) {
                helper.deleteFile(prod.image);
                prevImage = prod.image;
            }

            const updateProd = await Product.findByIdAndUpdate(
                req.params.id,

                {
                    title: req.body.title,
                    description: req.body.description,
                    image: prevImage ? prevImage : req.file.path,
                    price: req.body.price,
                    userID: req.user
                }
            );

            req.flash("success", "Product Updated!");

            res.redirect("/admin");
        } catch (e) {
            console.log(e);
        }
    });

//========================================================================for POST REQUETS HERE==============================================================//
// router.get("/productDelete/:id", isAuth, async(req, res) => {
//     try {
//         const prod = await Product.findById(req.params.id);

//         if (prod.userID.toString() != req.user._id.toString()) {
//             req.flash("error", "Not Authorized!");
//             return res.redirect("/login");
//         }

//         if (!prod) {
//             req.flash("error", "Not Authorized");
//             return res.redirect("/login");
//         }

//         // deleting the file too
//         helper.deleteFile(prod.image);

//         const deleteProd = await Product.findByIdAndRemove(req.params.id);
//         if (deleteProd) {
//             req.flash("success", "Product deleted!");
//             res.redirect("/admin");
//         }
//     } catch (e) {
//         console.log(e);
//     }
// });

//===========================================================================FOR CLIENT SIDE=========================================================================//
router.delete("/productDelete/:productID", isAuth, async(req, res) => {
    try {
        const prod = await Product.findById(req.params.productID);

        if (prod.userID.toString() != req.user._id.toString()) {
            req.flash("error", "Not Authorized!");
            return res.redirect("/login");
        }

        if (!prod) {
            req.flash("error", "Not Authorized");
            return res.redirect("/login");
        }

        const deleteProd = await Product.findByIdAndRemove(req.params.productID);
        if (deleteProd) {
            // deleting the file too
            helper.deleteFile(prod.image);
            req.flash("success", "Product deleted!");
            res.status(200).json({ message: "Success" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed" });
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

router.get("/order/:orderID", isAuth, (req, res, next) => {
    Order.findById(req.params.orderID)
        .then(order => {
            if (!order) {
                return next(new Error("No Order Found"));
            }
            if (order.user.userID.toString() !== req.user._id.toString()) {
                return next(new Error("Unauthorized"));
            }

            const orderID = req.params.orderID;
            const invoiceName = `Invoice-${orderID}.pdf`;
            const invoicePath = path.join("Data", "Invoices", invoiceName);

            //===============this is PRE-LOADING DATA, which is not good practice bcz it cause memory leak ====//
            //======================================================STEP1=====================================//
            // if large file tou time lagay
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err)
            //     }

            //     // setting the headers here
            //     res.setHeader('Content-Type', 'application/pdf');
            //     // this will how it display on the client side
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

            //     res.send(data);
            // })

            //=====================================================STEP2====================================//

            // // HERE IS STREAMING DATA, IN CHUNKS
            // const file = fs.createReadStream(invoicePath);
            // // read file in chunks
            // // setting the headers here
            // res.setHeader('Content-Type', 'application/pdf');
            // // this will how it display on the client side
            // res.setHeader('Content-Disposition', 'inline');

            // // forward the chunks(data)
            // //res is actually a writable stream
            // file.pipe(res);

            //==============================================STEP3========================================//

            // setting the pdf kit here to save the pdf and also style pdf
            const pdfDOC = new PdfDocument();
            // setting the headers here
            res.setHeader("Content-Type", "application/pdf");
            // this will how it display on the client side
            res.setHeader("Content-Disposition", "inline");

            // to download
            // res.setHeader("Content-Disposition", "attachment")

            //saving the read stream to save
            pdfDOC.pipe(fs.createWriteStream(invoicePath));
            pdfDOC.pipe(res);

            // creating text
            pdfDOC.fontSize(25).text("invoice", {
                underline: true
            });

            pdfDOC.text("-------------------------");
            // pdfDOC.text("Hello world");

            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDOC.text(
                    prod.product.title +
                    "-" +
                    prod.quantity +
                    "-" +
                    "x" +
                    "$" +
                    prod.product.price
                );
            });

            pdfDOC.text(`Total Price:$ ${totalPrice}`);
            pdfDOC.end();
        })
        .catch(error => {
            next(error);
        });
});

router.get("/checkout", isAuth, (req, res) => {
    req.user
        .populate("cart.items.productID")
        .execPopulate()
        .then(user => {
            let product = user.cart.items;
            let total = 0;
            product.forEach(p => {
                total += p.quantity * p.productID.price;
            });
            res.render("pages/checkout", {
                user: user.cart.items,
                path: "/checkout",
                totalPrice: total
            });
        })
        .catch(e => console.log(e));
});
module.exports = router;