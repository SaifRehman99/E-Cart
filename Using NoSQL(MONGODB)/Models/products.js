const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Enter Title"],
        minlength: 5,
        maxlength: 10
    },
    description: {
        type: String,
        required: [true, "Enter Description"],
        minlength: 10,
        maxlength: 100
    },
    image: {
        type: String,
        required: [true, "Enter Price"]
    },
    price: {
        type: Number,
        required: [true, "Enter Number"]
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    }
});

module.exports = mongoose.model("product", productSchema);