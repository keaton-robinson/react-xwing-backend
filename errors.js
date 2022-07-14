/* eslint-disable no-undef */

const sendGridMail = require("@sendgrid/mail");
const twilioClient = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let serverClosed = false;

const errorLoggerMiddleware = (err, req, res, next) => {
	const errorMessage = `Request URL: ${req.originalUrl} \n${err.stack}`;
	sendAlertNotifications(errorMessage); //do not await this...want to move on to next middleware as fast as possible
	next(err); 
};

// eslint-disable-next-line no-unused-vars
const errorResponder = (err, req, res, next) => {
	res.header("Content-Type", "application/json");
	if(!err.statusCode) {
		err.statusCode = 500;
	}
	res.status(err.statusCode).json({success: false,  message: err.message, ...err});
};

const logError = async (error) => {
	return sendAlertNotifications(error.stack);
};

const sendAlertNotifications = async (alertMessage) => {
	if(process.env.SUPRESS_ALERT_NOTIFICATIONS == "true"){
		console.log("Would have sent alert notifications, but alerts are currently suppressed by environment variable");
	} else {

		try {
			console.log(`Sending alert messages: ${alertMessage}`);
			//send email notification
			sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
			const msg = {
				to: process.env.SENDGRID_ERROR_TO,
				from: process.env.SENDGRID_ERROR_FROM,
				subject: "XWING ERRORS - " + process.env.NODE_ENV,
				text: `XWING Errors - ${process.env.NODE_ENV}: ${alertMessage}`
			};

			const sendGridPromise =  sendGridMail.send(msg);
		
			//send text notification
			const twilioPromise = twilioClient.messages
				.create({
					body: `XWING Errors - ${process.env.NODE_ENV}:\n\n${alertMessage}`,
					from: process.env.TWILIO_PHONE_FROM,
					to: process.env.TWILIO_PHONE_TO
				});

			const sendGridPromiseResult = await sendGridPromise; 
			const twilioPromiseResult = await twilioPromise; 
			
			console.log(`Sendgrid email sent...SendGridPromiseResult: ${sendGridPromiseResult}`);
			console.log(`Twilio text sent...TwilioPromiseResult: ${twilioPromiseResult}`);
			return "Error messages sent successfully";

		} catch(error) {
			const msg = "Failed to write logs. Not going to try to recover from this.";
			console.error(msg);
			return msg;
		}
	}
};
  
const logErrorsAndShutdownServer = (error, server, mongoose) => {
	if(mongoose.connection.readyState != 0){
		mongoose.connection.close();
	}
	
	if(!serverClosed){	
		console.log("Starting a graceful shutdown");
		server.close(async () => {
			console.log("Graceful shutdown has happened...sending error log notifications");
			serverClosed = true;
			logErrorAndEndProcess(error);
		});
		
		//force close if the server hasn"t shut down in 3 seconds
		console.log("Scheduling a force shutdown just in case...");
		setTimeout(async () => {
			console.log("Entering forced shutdown callback check");
			if(!serverClosed){
				serverClosed = true;
				logErrorAndEndProcess(error);  // don't spam notifications in the event that this timeout happens between first notifications going out and process exiting
			} else {
				console.log("Server was already closed, so not force closing");
			}
		}, 3000);
	} else {
		console.error("An unhandled error was thrown from error handlers...do not keep trying to run the error handler. Just let the server close.");
	}
};

const logErrorAndEndProcess = (error) => {
	logError(error)
		.finally(()=>{
			console.log("Shutting down server after unhandled error or promise rejection");
			process.exit(1);
		});
};

module.exports = { errorLoggerMiddleware, logError, sendAlertNotifications, errorResponder, logErrorsAndShutdownServer };  
