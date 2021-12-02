const express = require('express');
const productsRouter = express.Router();


// controllers imports
const {
  get_one_product_by_id,
  get_insta_pictures,
  get_picture_by_category,
  get_category_picture,
  get_random_picture
} = require("../controllers/productsController/get_controller")

/* GET home page. */
productsRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to the ABskla' });
});

productsRouter.get('/insta-pictures', get_insta_pictures);
productsRouter.get('/category-pictures', get_category_picture );
productsRouter.get('/picture-by-category/:id', get_picture_by_category );
productsRouter.get('/random-pictures',  get_random_picture );
productsRouter.get('/:id', get_one_product_by_id);


module.exports = productsRouter;
