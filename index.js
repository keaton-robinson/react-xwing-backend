/* eslint-disable no-undef */
require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/routes");
const { errorLoggerMiddleware, errorResponder, logError, sendAlertNotifications, logErrorsAndShutdownServer } = require("./errors");
const mongoose = require("mongoose");
// eslint-disable-next-line no-undef
const mongoString = process.env.DATABASE_URL || "mongodb://localhost/xwing";

mongoose.connect(mongoString, { heartbeatFrequencyMS: 3000 })
	.catch(err => {
		console.log("error on initial mongo connect");
		logError(err);
	});

mongoose.connection.on("connected", () => {
	const message = "Mongoose connection established at " + (new Date());
	sendAlertNotifications(message);
});

mongoose.connection.on("disconnected", () => { 
	// eslint-disable-next-line no-undef
	const message = "Mongoose connection lost at " + (new Date());
	sendAlertNotifications(message); 
});

mongoose.connection.on("error", (error) => {
	logError(error);
});

const app = express();
app.use(compression());
app.use(helmet());
app.use(cors()); //storing auth token in javascript accessible place instead of cookies. If I switch to cookies, I need to restrict the CORS to prevent CSRF.
app.use(express.json());
app.use("/", routes);
app.use(errorLoggerMiddleware);
app.use(errorResponder);

const server = https.createServer(
	{
		key: fs.readFileSync("./cert/key.pem"),
		cert: fs.readFileSync("./cert/cert.pem"),
	},
	app
);

// eslint-disable-next-line no-undef
process.on("uncaughtException", (error) => {
	logErrorsAndShutdownServer(error, server, mongoose);
});

// // eslint-disable-next-line no-unused-vars, no-undef
process.on("unhandledRejection", (reason) => {
	logErrorsAndShutdownServer(reason, server, mongoose);
});

// eslint-disable-next-line no-undef
server.listen(process.env.PORT, () => {
	// eslint-disable-next-line no-undef
	console.log(`Server Started at ${process.env.PORT}`);
});
