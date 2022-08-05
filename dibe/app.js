var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const passport = require('passport')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const songRouter = require('./routes/song');
const adminRouter = require('./routes/admin')
const passportConfig = require('./passport')

require('dotenv').config()
require('./db/connect')()
var app = express();
passportConfig()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave : false,
  saveUninitialized : false,
  secret : process.env.COOKIE_SECRET,
  cookie : {
    httpOnly : true,
    secure : false,
  },
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/track', express.static(path.join('public/video')))
app.use('/e', express.static(path.join('e:/music_db')))
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/songs', songRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
