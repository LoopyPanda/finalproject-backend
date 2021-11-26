const axios = require("axios");
const db = require("../../db/client");

const get_one_product_by_id = async (req, res, next) => {
const { id } = req.params;

const getOneProductQuery = {
    text: `
            SELECT
            p.name,
            p.description,
            p.stock,
            JSON_AGG(JSON_BUILD_OBJECT('category_name', c.name, 'category_picture', c.thumbnail, 'category_description', c.description, 'category_price', c.price)) AS categories
            FROM
            "Products" p
            JOIN "Category_has_products" cp
            ON cp.product_id = p.product_id
            JOIN "Categories" c
            ON cp.category_id = c.category_id
            WHERE p.product_id=$1
            GROUP BY p.name, p.description, p.stock
            `,
    values: [id],
};

const getPicturesQuery = {
    text: `
            SELECT i.url
            FROM "Images" i
            WHERE i.product_id=$1
        `,
    values: [id],
};

try {
    const { rows: productRows } = await db.query(getOneProductQuery);

    if (!productRows.length)
    return res
        .status(404)
        .send("Oops !! Look like there no product of this ID");

    const { rows: pictureRows } = await db.query(getPicturesQuery);

    const result = {
    ...productRows["0"],
    pictures: pictureRows,
    };

    res.json(result);
}   catch (e) {
    console.log(e.message);
    res.status(500).send(e.message);
    next(e);
}
};

module.exports = {
get_one_product_by_id,
};
