const { config } = require('./../config/config');

const USER = encodeURIComponent(config.db_user);
const PASSWORD = encodeURIComponent(config.db_password);
// POSTGRES
const URI = `mysql://${USER}:${PASSWORD}@${config.db_host}:${config.db_port}/${config.db_name}`;
// MYSQL
//const URI = `mysql://${USER}:${PASSWORD}@${config.db_host}:${config.db_port}/${config.db_name}`;

module.exports = {
  development: {
    url: URI,
    dialect: 'mysql',
  },
  production: {
    url: URI,
    dialect: 'mysql',
  }
}
