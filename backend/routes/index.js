// Importamos express
const express = require('express');

const exampleRouter = require('./example.router')

function routerAPI(app){
  const router = express.Router();

  app.use('/api/v1', router);

  router.use('/example', exampleRouter)
}


module.exports = routerAPI;
