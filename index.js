require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const { errorLogger, errorResponder } = require('./errors');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, { heartbeatFrequencyMS: 3000 })
.catch(err => {
    console.log("error on initial mongo connect");
    if(err) {
        throw err;
    }
});
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.on('disconnected', () => { console.log("Lost connection mid flight, need to do something about this.") });

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(cors()); //planning to store auth token in javascript accessible place instead of cookies. If I switch to cookies, I need to restrict the CORS to prevent CSRF.
app.use(express.json());
app.use('/', routes);
app.use(errorLogger);
app.use(errorResponder);

const server = https.createServer(
  {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/cert.pem"),
  },
  app
)

server.listen(process.env.PORT, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})