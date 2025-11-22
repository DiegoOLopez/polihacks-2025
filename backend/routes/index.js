// Importamos express
const express = require('express');

const exampleRouter = require('./example.router');
const classifyRoute = require('./classifyRoute');  // <<-- IMPORTANTE

function routerAPI(app){
  const router = express.Router();

  app.use('/api/v1', router);

  router.use('/example', exampleRouter);
  router.use('/clasificar', classifyRoute); // <<-- IMPORTANTE
}

module.exports = routerAPI;
