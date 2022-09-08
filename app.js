const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
require("dotenv").config();
//connect db
connectDB();

//middleware to get response in json format
//init middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Server running....')
})
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/articles',require('./routes/api/articles'));
app.use('/api/subscribe',require('./routes/api/subscribe'));

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})