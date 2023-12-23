const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true
    }).then((data) => {
        console.log(`Connected With the DB`);
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = connectDB;