const { getDb, getNextSequence } = require('./db.js');

/**
 * Fetches a single product as per the ID, from the database.
 * @returns Single product details
 */
async function get(_, { id }) {
  const db = getDb();
  const product = await db.collection('products').findOne({ id });
  return product;
}

/**
 * Fetches all products from database.
 * @returns List of products
 */
async function list() {
  const db = getDb();
  const products = await db.collection('products').find({}).toArray();
  return products;
}

/**
 * Adds the new product to the databse. Accepts an object with Product as the second parameter.
 * @returns Currently added product
 */
async function add(_, { product }) {
  const db = getDb();
  console.log('Product',product)

  // eslint-disable-next-line no-param-reassign
  product.id = await getNextSequence('products');

  const result = await db.collection('products').insertOne(product);
  console.log('Product',product)
  const currentlyAddedProduct = await db
    .collection('products')
    .findOne({ _id: result.insertedId });
  return currentlyAddedProduct;
}

/**
 * Updates a specific product with the changes.
 * @returns Updated product
 */
async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.name || changes.category || changes.price || changes.imageUrl) {
    const product = await db.collection('products').findOne({ id });
    Object.assign(product, changes);
  }
  await db.collection('products').updateOne({ id }, { $set: changes });
  const savedProduct = await db.collection('products').findOne({ id });
  return savedProduct;
}

/**
 * Removes a specific product.
 * @returns boolean If the product was deleted or not
 */
async function remove(_, { id }) {
  const db = getDb();
  const product = await db.collection('products').findOne({ id });
  if (!product) return false;

  product.deleted = new Date();
  let result = await db.collection('deleted_products').insertOne(product);
  if (result.insertedId) {
    result = await db.collection('products').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

/**
 * Returns the count of the products.
 * @returns count {number} Total count of the products.
 */
async function getCount() {
  let count = 0;
  const db = getDb();
  const products = await db.collection('products')
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]).toArray();

  if (products.length > 0) {
    count = products[0].total;
  }
  return count;
}

module.exports = {
  get, list, add, update, delete: remove, count: getCount,
};
