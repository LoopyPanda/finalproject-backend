const axios = require("axios");



const get_one_product_by_id = async (req, res, next) => {
    const { category, id } = req.params;

    try {
    
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }
};

module.exports = {
    get_one_product_by_id
};
