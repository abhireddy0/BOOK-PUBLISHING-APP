const mongoose = require('mongoose')

async function configureDB(){
    try {
         await mongoose.connect(process.env.MONGO_URI);
         console.log(' Connected to MongoDB: book-publish-app');
         
    } catch (err) {
    console.log(' Error connecting to MongoDB:', err.message );
     
        
    }
}
module.exports = configureDB;