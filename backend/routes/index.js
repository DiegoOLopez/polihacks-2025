// Importamos express
const express = require('express');

const exampleRouter = require('./example.router');
const classifyRoute = require('./classifyRoute');  
const chatRouter = require('./chat.router')

function routerAPI(app){
  const router = express.Router();

  app.use('/api/v1', router);

  router.use('/example', exampleRouter);
  router.use('/clasificar', classifyRoute);
  router.use('/chat', chatRouter)
}

module.exports = routerAPI;
