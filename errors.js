const errorLogger = (err, req, res, next) => {
	console.error(err); 
	next(err); 
};
  
// eslint-disable-next-line no-unused-vars
const errorResponder = (err, req, res, next) => {
	res.header('Content-Type', 'application/json');
	if(!err.statusCode) {
		err.statusCode = 500;
	}
	res.status(err.statusCode).json({success: false,  message: err.message, ...err});
};

module.exports = { errorLogger, errorResponder };  
