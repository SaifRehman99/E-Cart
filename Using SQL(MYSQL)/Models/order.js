const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const Order = sequelize.define("order", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Order;