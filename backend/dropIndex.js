const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

async function dropGroupIndex() {
    try {
        const dbUrl = process.env.MONGO_URL;
        console.log("Connecting to:", dbUrl ? "URL Found" : "URL Missing");
        await mongoose.connect(dbUrl);
        
        console.log("Connected. Dropping index...");
        const result = await mongoose.connection.collection('groups').dropIndex('inviteToken_1');
        console.log("Index dropped:", result);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

dropGroupIndex();
