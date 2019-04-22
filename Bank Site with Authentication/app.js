let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let app = express();



// mongodb connection using mongoose
mongoose.connect("mongodb://localhost:27017/pace", { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
let db = mongoose.connection;

//mongo error handler
db.on('error', console.error.bind(console, 'connection error:'));
//use the middleware provided to use sessions for tracking logins
app.use(session({
  secret: 'pace bank', //used to sign the session id cookie
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

//another level of middleware to make the userid available to our templates
app.use(function (req,res,next){
  //the response obj has a property called locals, which all our views can have access to in Express.
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
let routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('PACE Bank Web App Listening On Port 3000');
});
