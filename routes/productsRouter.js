const express = require('express');
const productsRouter = express.Router();


// controllers imports
const {
  get_one_product_by_id
} = require("../controllers/productsController/get_controller")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = productsRouter;
