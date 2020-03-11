const mongoose = require('mongoose');

const connect = async() => {

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log(`Connected to ${conn.connection.host}`);
    } catch (e) {
        console.log(e)
        console.log('Cant Connect to Database')

    }

}


module.exports = connect;