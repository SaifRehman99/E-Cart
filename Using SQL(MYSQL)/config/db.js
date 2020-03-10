const Sequelize = require("sequelize");
const sequelize = new Sequelize("node_dev", "root", "", {
    dialect: "mysql",
    host: "localhost"
});

module.exports = sequelize;