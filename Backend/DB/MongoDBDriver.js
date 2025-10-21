const { MongoClient } = require('mongodb');
const uri = "your_mongo_connection_string";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('your_database');
        const users = database.collection('users');

        // Finding all documents in the users collection
        const cursor = users.find();
        const results = await cursor.toArray();
        console.log(results);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
