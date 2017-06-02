const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
const cors         = require('cors');
const session      = require("express-session");
const MongoStore   = require('connect-mongo')(session);
const passport     = require('passport');

require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;

const index = require('./routes/index');
const event = require('./event/eventRoutes');
const user  = require('./user/userRoutes');

mongoose.connect(MONGO_URL).then(() => console.log("Connection to mongo successful"));

const app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//cors
const corsOptions = { credentials: true, origin: true};


app.use(session({
  secret: 'liberi-app',
  name: "liberi", //Imprescindible para encontrar la sesion
  resave: true,
  saveUninitialized: false,
  cookie : { maxAge: 1800000 },
  store: new MongoStore({mongooseConnection: mongoose.connection, ttl: 24 * 60 * 60})
}));
require('./config/passport')(passport);


// default value for title local
app.locals.title = 'liberi';

app.use(passport.initialize());
app.use(passport.session());

//cors
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


//Send objct user from req to res
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});


app.use('/', index);
app.use('/api/event', event);
app.use('/api/user', user);


//Angular integration
app.use(function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
