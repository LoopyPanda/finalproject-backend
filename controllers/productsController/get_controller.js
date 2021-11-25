const axios = require("axios");
const db = require("../../db/client");

const get_one_product_by_id = async (req, res, next) => {
    const { id } = req.params;

    const getProductQuery = {
        text: `
        SELECT
            p.name,
            p.description,
            p.stock,
            ARRAY_AGG(JSON_BUILD_OBJECT('link', i.url)) AS pictures,
            ARRAY_AGG(JSON_BUILD_OBJECT('category_name', c.name, 'category_picture', c.thumbnail, 'category_description', c.description, 'category_price', c.price)) AS categories
        FROM
            "Products" p
        JOIN "Category_has_products" cp
            ON cp.product_id = p.product_id
        JOIN "Categories" c
            ON cp.category_id = c.category_id
        JOIN "Images" i
            ON i.product_id = p.product_id
        WHERE p.product_id=$1
        GROUP BY p.name, p.description, p.stock`,
        values: [id]
    }

    try {

        const {rows} = await db.query(getProductQuery)
        console.log(rows)
        if(!rows.length)
            return res.status(404).send("Oops !! Look like there no product of this ID");
    
        // console.log(result);
        res.status(200).send(rows[0]);

    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }
};

module.exports = {
    get_one_product_by_id
};
