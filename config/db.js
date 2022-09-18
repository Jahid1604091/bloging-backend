const mongoose = require('mongoose');
// const db = `mongodb://localhost:27017/blogDB`;
const db = `mongodb+srv://fruits:ilovedad62358@cluster0.eohva.mongodb.net/blogDB`;
const connectDB = async () => {
    try {
       const conn =  await mongoose.connect(db, 
        { useNewUrlParser: true, useUnifiedTopology: true,  });
        console.log('Mongo db connected on ' + conn.connection.host);
    } catch (error) {
        console.log(`error in connecting db : ${error.message}`);

        //exit process
        process.exit(1)
    }
}

module.exports = connectDB;