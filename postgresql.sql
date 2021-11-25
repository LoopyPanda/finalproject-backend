CREATE TABLE "Categories" (
  "category_id" SERIAL,
  "name" VARCHAR(100),
  "description" TEXT,
  "thumbnail" VARCHAR(100),
  "price" NUMERIC,
  PRIMARY KEY ("category_id")
);

CREATE TABLE "Products" (
  "product_id" SERIAL,
  "stock" INTEGER,
  "picture" VARCHAR(100),
  "name" VARCHAR(100),
  "description" TEXT,
  PRIMARY KEY ("product_id")
);

CREATE TABLE "Images" (
  "image_id" SERIAL,
  "product_id" INT,
  "url" VARCHAR(100),
  PRIMARY KEY ("image_id"),
  CONSTRAINT "FK_Images.product_id"
    FOREIGN KEY ("product_id")
      REFERENCES "Products"("product_id")
);

CREATE TABLE "Category_has_products" (
  "product_id" INT,
  "category_id" INT,
  PRIMARY KEY ("product_id", "category_id"),
  CONSTRAINT "FK_Category_has_products.product_id"
    FOREIGN KEY ("product_id")
      REFERENCES "Products"("product_id"),
  CONSTRAINT "FK_Category_has_products.category_id"
    FOREIGN KEY ("category_id")
      REFERENCES "Categories"("category_id")
);

-- ARRAY_AGG(expression [ORDER BY [sort_expression {ASC | DESC}], [...])
-- The PostgreSQL ARRAY_AGG() function is an aggregate function that accepts a
-- set of values and returns an array in which each value in the set is assigned to an element of the array.

SELECT c.name As category_name,
c.description As category_description,
c.thumbnail As category_thumbnail,
c.price As category_price,
ARRAY_AGG(JSON_BUILD_OBJECT('stock', p.stock, 'picture', p.picture, 'name', p.name, 'description', p.description))
FROM "Categories" c
JOIN "Category_has_products" cp ON cp.category_id = c.category_id
JOIN "Products" p ON cp.product_id = p.product_id
GROUP BY c.name, c.description, c.thumbnail, c.price;

SELECT * FROM "Products" p JOIN "Images" i ON p.product_id = i.product_id;

SELECT
p.name,
p.description,
p.stock,
ARRAY_AGG(JSON_BUILD_OBJECT('category_name', c.name, 'category_picture', c.thumbnail, 'category_description', c.description, 'category_price', c.price)) AS categories
FROM "Products" p
JOIN "Category_has_products" cp
ON cp.product_id = p.product_id
JOIN "Categories" c
ON cp.category_id = c.category_id
WHERE p.product_id=1
GROUP BY p.name, p.description, p.stock;

-- give product to each categories
INSERT INTO Category_has_products(category_id, product_id)
VALUES (1, 2);

-- insert categories
INSERT INTO "Categories" (name, description, thumbnail, price)
VALUES ('postcards', 'Your favorite canvas/digital art printed on a postcard','http://lorempixel.com/400/200/', 200);


INSERT INTO "Images" (product_id, url)
VALUES (3 ,'https://bit.ly/3FMp8T0');

SELECT * FROM "Products" p JOIN "Images" i ON p.product_id = i.product_id;
SELECT * FROM "Images" p JOIN "Images" i ON p.product_id = i.product_id;