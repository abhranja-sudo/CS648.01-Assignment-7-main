require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;
const url = process.env.DB_URL
  || 'mongodb+srv://ar50645:ALCwruGOl9UcWfoe@cluster0.j3fmz.mongodb.net/assignment4?retryWrites=true&w=majority';

/**
 * Connects to the databse and sets the 'db' variable to the mongo client db.
 */
async function connectToDb() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

/**
 * Increments the current counter of the specific collection by 1.
 * @param {string} name Name of the collection for which the counter is needed
 * @returns Next id number in the sequence
 */
async function getNextSequence(name) {
  console.log(name)
  const result = await db
    .collection('counters')
    .findOneAndUpdate(
      { _id: name },
      { $inc: { current: 1 } },
      { returnOriginal: false , upsert: true},
    );

  console.log(result)
  return result.value.current;
}

function getDb() {
  return db;
}

module.exports = { connectToDb, getNextSequence, getDb };
