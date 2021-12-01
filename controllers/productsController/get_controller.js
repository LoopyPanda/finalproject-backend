const axios = require("axios");
const db = require("../../db/client");
const abhiInstaData = require("../../db/abhi_insta_data.json");

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
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }
};

const get_insta_pictures = async (req, res, next) => {
    const getInstaData = async () => {
        const {
            data: {
                user: {
                    edge_owner_to_timeline_media: { edges },
                },
            },
        } = abhiInstaData;

        const data = edges
            .filter(({ node }) => !node.is_video)
            .map(({ node }) => {
                return {
                    bigPicture: node.display_url,
                    smallPicture: node.display_resources?.[0]?.src,
                };
            });

        //   const queryHash = "8c2a529969ee035a5063f2fc8602a0fd";
        //   const variables =
        //     "%7B%22id%22%3A%226356671502%22%2C%22first%22%3A12%2C%22after%22%3A%22QVFEVURuN1pQN0JMWWdFbjRNVWRRZnVTdURlVHdnd0xON2NXZGN5NjU2bkpjWnlLRDVaOGlyRkVJcGVlRDVlU01VOXhiUzFWOG5yd2tlcFgxOWpWWE5fcw%3D%3D%22%7D";
        //   const data = await axios.get(
        //     `https://www.instagram.com/graphql/query/?query_hash=${queryHash}`
        //   );

        return data;
    };
    const data = await getInstaData();
    res.json(data);
};
// SELECT * FROM "Category_has_products" WHERE category_id=$1
const get_picture_by_category = async (req, res, next) => {
    const { id } = req.params;
    // console.log(req.params)
    const getPicturesQueryByCategory = {
        text: `SELECT c.name As category_name,
        c.description As category_description,
        c.thumbnail As category_thumbnail,
        c.price As category_price,
        ARRAY_AGG(JSON_BUILD_OBJECT('stock', p.stock, 'name', p.name, 'description', p.description))
        FROM "Categories" c
        JOIN "Category_has_products" cp ON cp.category_id = c.category_id
        JOIN "Products" p ON cp.product_id = p.product_id
        GROUP BY c.name, c.description, c.thumbnail, c.price;
        `,
        values: [id],
    };
    try {
        const { rows: productRows } = await db.query(getPicturesQueryByCategory);

        if (!productRows.length)
            return res
                .status(404)
                .send("Oops !! Look like there no product of this Category");
        res.status(200).send(productRows);
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }

};

const get_category_picture = async (req, res, next) => {
    const { id } = req.params;
    // console.log(id)
    const getcategorypicture = {
        text: `SELECT * From "Categories" WHERE category_id=$1`,
        values: [id],
    };
    try {
        const { rows: productRows } = await db.query(getcategorypicture);

        if (!productRows.length)
            return res
                .status(404)
                .send("Oops !! Look like there no product of this Category");
        res.status(200).send(productRows);
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }

};

const get_random_picture = async (req, res, next) => {
    // const {id} = req.params;
    // console.log(id)
    const getrandompicture = {
        text: `SELECT url FROM "Images"`,
    };
    try {

        const { rows: productRows } = await db.query(getrandompicture);
        // console.log(productRows)

        function randomimage() {
            var imagesArr = [];
            for (var i = 0; i < 4; i++) {
                const random = productRows[Math.floor(Math.random() * 14)];
                imagesArr.push(random);
            }
            return imagesArr
        }
        // console.log(randomimage());
        const result = randomimage()
        
        if (!productRows.length)
            return res
                .status(404)
                .send("Oops !! Look like there no product of this Category");
        res.status(200).send(result);
    } catch (e) {
        console.log(e.message);
        res.status(500).send(e.message);
        next(e);
    }

};

module.exports = {
    get_one_product_by_id,
    get_insta_pictures,
    get_picture_by_category,
    get_category_picture,
    get_random_picture
};
