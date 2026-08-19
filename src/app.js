const dns = require("dns");

// Optional: Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");

// Load .env BEFORE importing files that use process.env
dotenv.config();

console.log("AWS REGION:", process.env.AWS_REGION);
console.log(
    "AWS KEY EXISTS:",
    !!process.env.AWS_ACCESS_KEY_ID
);

const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
    .then(() => {
        console.log("Database connection established.....");

        app.listen(process.env.PORT,() => {
            console.log("Server is Listening on port 7000");
        });
    })
    .catch((err) => {
        console.log("Database can not be connected!!!!");
        console.error(err);
    });