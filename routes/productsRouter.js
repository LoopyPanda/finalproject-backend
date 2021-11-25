const express = require('express');
const productsRouter = express.Router();


// controllers imports
const {
  get_one_product_by_id
} = require("../controllers/productsController/get_controller")

/* GET home page. */
productsRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to the ABskla' });
});

productsRouter.get('/product/:id', get_one_product_by_id);

module.exports = productsRouter;
