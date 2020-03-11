const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Enter Name']

    },
    email: {

        type: String,
        required: [true, 'Enter Email'],
        unique: true

    },
    cart: {
        items: [{
            productID: { type: mongoose.Types.ObjectId, ref: 'product', required: true },
            quantity: { type: Number, required: true }
        }]

    }


})


// to add cart
userSchema.methods.addCart = function(product) {

    // checking for the product in user cart
    // array h islea findIndex method use here
    const cartProduct = this.cart.items.findIndex(prodI => {
        return prodI.productID.toString() === product.id.toString();
    });
    let newQuantity = 1;

    // getting the cart data
    const updateCartItems = [...this.cart.items];


    // if already their on cart
    // if no item tou cartProduct return -1 and else will run
    if (cartProduct >= 0) {
        newQuantity = this.cart.items[cartProduct].quantity + 1;
        updateCartItems[cartProduct].quantity = newQuantity;
    }
    // else add the new product in cart
    else {
        updateCartItems.push({
            productID: product._id,
            quantity: newQuantity
        });
    }

    const updatedCart = {
        items: updateCartItems
    }

    this.cart = updatedCart;
    this.save();
}


// remove from cart
userSchema.methods.removeCart = function(pid) {

    // create new array excluding the product id match
    // 12345 !== 12345 (false, thats why that item will not return)
    const removeProduct = this.cart.items.filter(item => {
        return item.productID.toString() !== pid.toString()
    })

    this.cart.items = removeProduct;
    return this.save()
}

// clearing the cart
userSchema.methods.clearCart = function() {
    this.cart = { items: [] }
    return this.save()
}

module.exports = mongoose.model('user', userSchema)