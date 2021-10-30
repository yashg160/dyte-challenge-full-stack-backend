const Sequelize = require('sequelize');

const { databaseConfiguration } = require('../config/db.config');

const sequelize = new Sequelize(
  databaseConfiguration.DB,
  databaseConfiguration.USER,
  databaseConfiguration.PASS,
  {
    host: databaseConfiguration.HOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: false,
    },
  }
);

module.exports = sequelize;
