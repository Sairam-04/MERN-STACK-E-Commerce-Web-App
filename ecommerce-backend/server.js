const app = require("./app");
const dotenv = require("dotenv")
const connectDB = require("./database/db");
dotenv.config({path:"ecommerce-backend/config/config.env"});

connectDB()
app.listen(process.env.PORT, ()=>{
    console.log(`Server is Running on ${process.env.PORT}`);
})