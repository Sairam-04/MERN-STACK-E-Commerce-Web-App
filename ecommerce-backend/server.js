const app = require("./app");
const dotenv = require("dotenv")
const connectDB = require("./database/db");

// Handling uncaught Exception
process.on("uncaughtException",err=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the Server due to uncaught exception`);
    process.exit(1);
})

// Config
dotenv.config({path:"ecommerce-backend/config/config.env"});

connectDB()
app.listen(process.env.PORT, ()=>{
    console.log(`Server is Running on ${process.env.PORT}`);
})

// Unhandled Promise Rejection Error
process.on("unhandledRejection", err=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting Down the Server due to Unhandled Promise Rejection");
    server.close(()=>{
        process.exit(1);
    })
})