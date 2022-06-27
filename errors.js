const errorLogger = (err, req, res, next) => {
  console.error('\x1b[31m', err) // adding some color to error messages
  next(err) 
}
  
const errorResponder = (err, req, res, next) => {
  res.header("Content-Type", 'application/json')
  if(!err.statusCode) {
    err.statusCode = 500;
  }
  res.status(err.statusCode).json({success: false,  message: err.message, ...err}) 
}

module.exports = { errorLogger, errorResponder };  
