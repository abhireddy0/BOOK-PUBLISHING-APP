const mongoose = require('mongoose')

async function configureDB(){
    try {
         await mongoose.connect(process.env.MONGO_URI);
         console.log(' Connected to MongoDB: book-publish-app');
         console.log("MONGO_URI =", process.env.MONGO_URI);

         
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit if database won't connect
    }
}
module.exports = configureDB;