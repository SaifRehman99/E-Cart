const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const orderItem = sequelize.define("orderItem", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
});

module.exports = orderItem;