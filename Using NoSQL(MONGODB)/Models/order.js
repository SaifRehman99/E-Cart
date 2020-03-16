const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],

    user: {
        email: {
            type: String,
            required: true
        },
        userID: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "user"
        }
    }
});

module.exports = mongoose.model("order", orderSchema);