const axios = require("axios");
const db = require("../../db/client");
const fetch = require('node-fetch')

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
// https://www.instagram.com/graphql/query/?query_hash=8c2a529969ee035a5063f2fc8602a0fd&variables=%7B%22id%22%3A%226356671502%22%2C%22first%22%3A12%2C%22after%22%3A%22QVFEVURuN1pQN0JMWWdFbjRNVWRRZnVTdURlVHdnd0xON2NXZGN5NjU2bkpjWnlLRDVaOGlyRkVJcGVlRDVlU01VOXhiUzFWOG5yd2tlcFgxOWpWWE5fcw%3D%3D%22%7D
const get_insta_pictures = async (req, res, next) => {
    const response = await fetch("https://www.instagram.com/graphql/query/?query_hash=8c2a529969ee035a5063f2fc8602a0fd&variables=%7B%22id%22%3A%226356671502%22%2C%22first%22%3A12%2C%22after%22%3A%22QVFEVURuN1pQN0JMWWdFbjRNVWRRZnVTdURlVHdnd0xON2NXZGN5NjU2bkpjWnlLRDVaOGlyRkVJcGVlRDVlU01VOXhiUzFWOG5yd2tlcFgxOWpWWE5fcw%3D%3D%22%7D", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "fr,en-US;q=0.9,en;q=0.8,es;q=0.7,la;q=0.6,it;q=0.5,pt;q=0.4",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": process.env.INSTA_COOKIE
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
        });
        
        const instaData = await response.json()


        const processInstaData = async (payload) => {
        const {
            data: {
                user: {
                    edge_owner_to_timeline_media: { edges },
                },
            },
        } = payload;

        const data = edges
            .filter(({ node }) => !node.is_video)
            .map(({ node }) => {
                return {
                    bigPicture: node.display_url,
                    smallPicture: node.display_resources?.[0]?.src,
                };
            });

        return data;
    };

    const data = await processInstaData(instaData);
    res.json(data);
};
// SELECT * FROM "Category_has_products" WHERE category_id=$1
//  JOIN "Products" p ON cp.product_id = p.product_id
const get_picture_by_category = async (req, res, next) => {
    const { id } = req.params;
    console.log(id)
    const getPicturesByCategory = {
        text: `SELECT 
        c.name As category_name,
        c.price As category_price,
        ARRAY_AGG(JSON_BUILD_OBJECT('url', i.url, 'product_id', i.product_id)) AS urls
        FROM "Categories" c
        JOIN "Category_has_products" cp ON cp.category_id = c.category_id
        JOIN "Images" i ON cp.product_id = i.product_id
        WHERE c.category_id= $1
        GROUP BY c.name,c.price
        `,
        values: [id],
    };
    try {
        const { rows: productRows } = await db.query(getPicturesByCategory);
        console.log(productRows)
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

    // console.log(id)
    const getcategorypicture = {
        text: `SELECT * From "Categories"`,
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

    const getrandompicture = {
        text: `
        SELECT i.product_id AS id,
        ARRAY_AGG(JSON_BUILD_OBJECT('url', i.url)) as pictures
        FROM "Images" i
        GROUP BY i.product_id
        `,
    };
    try {

        const { rows: productRows } = await db.query(getrandompicture);

        if (!productRows.length)
            return res


                .status(404)
                .send("Oops !! Look like there no product of this Category");

        const randomImage = () => {
            const imagesArr = [];
            for (let i = 0; i < 4; i++) {
                const random = productRows[Math.floor(Math.random() * productRows.length)];
                imagesArr.push(random);
            }
            return imagesArr
        }

        const randomImages = randomImage()

        const result = randomImages.map(item => {
            return {
                id: item.id,
                url: item.pictures[Math.floor(Math.random() * item.pictures.length)].url
            }
        });

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
