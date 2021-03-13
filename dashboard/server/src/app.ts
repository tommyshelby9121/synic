import { config } from "dotenv";
config();
import express, { Application } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { connection } from "mongoose";
import passport from "passport";
const MongoStore = require("connect-mongo")(session);
import connectDB from "./database/connection";

// Init Express
const app:Application = express();

// Connect to MongoDB
connectDB().catch(err => console.error(`Error establishing database connection: ${err.message}`));

// Discord Strategy
require("./config/passport")(passport);

// Logging
if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
}

// Body Parser
app.use(express.urlencoded({
    extended: false,
}));
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Sessions
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET!,
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
       mongoConnection: connection,
    }),
}));

// Routes
import api from "./routes/api";
app.use("/api", api);

// Define Port
const port:string|number = process.env.PORT || 5500;

// Start Express Server
app.listen(port, () => console.log(`Server started in ${process.env.NODE_ENV} mode on port ${port}`));
