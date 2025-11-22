const { Sequelize } = require('sequelize');
const { config } = require('./../config/config');
const setupModels = require('./../db/models');

const USER = encodeURIComponent(config.db_user);
const PASSWORD = encodeURIComponent(config.db_password);
const URI = `mysql://${USER}:${PASSWORD}@${config.db_host}:${config.db_port}/${config.db_name}`;

const sequelize = new Sequelize(URI, {
  dialect: 'mysql',
  logging: true,
});

setupModels(sequelize);

module.exports = sequelize;
