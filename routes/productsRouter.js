const express = require('express');
const productsRouter = express.Router();


// controllers imports
const {
  get_one_product_by_id,
  get_insta_pictures
} = require("../controllers/productsController/get_controller")

/* GET home page. */
productsRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to the ABskla' });
});

productsRouter.get('/insta-pictures', get_insta_pictures);
productsRouter.get('/:id', get_one_product_by_id);
// productsRouter.get('/products', get_products_by_categories);



module.exports = productsRouter;
