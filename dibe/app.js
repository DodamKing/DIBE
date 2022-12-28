var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
const cron = require('node-cron')
const ipfilter = require('express-ipfilter').IpFilter
const IpDeniedError = require('express-ipfilter').IpDeniedError
const geoip = require('geoip-country')
const helmet = require('helmet')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const songRouter = require('./routes/song');
const adminRouter = require('./routes/admin')
const passportConfig = require('./passport');
const { isLoggedIn } = require('./routes/middlewares');
const myModule = require('./public/javascripts/myModule');

require('dotenv').config()
require('./db/connect')()
var app = express();
passportConfig()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy : false }))
// app.use(logger('short'));
app.use(logger(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

app.use((req, res, next) => {
  const ip = req.ip
  const testIp = '207.97.227.239'
  const geo = geoip.lookup(ip)
  if (geo) {
    console.log('접속 시도 아이피:', ip, 'Country:', geo.country)
    if (geo.country !== 'KR') return res.send('Access Denied')
  }
  next()
})

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
app.use(flash())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/track', express.static(path.join('public/video')))
app.use('/img', express.static(path.join('public/images'))
)
app.use((req, res, next) => {
  // const MobileDetect = require('mobile-detect')
  // const md = new MobileDetect(req.headers['user-agent'])
	// if (md.mobile()) return res.render('mobile/temp')

  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated()
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/songs', songRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // console.log(req.ip, new Date().toLocaleString())
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

cron.schedule('0 12 * * *', async () => {
  await myModule.setTodayChart()
  console.log(new Date().toLocaleString(), 'chart setting done')
})

cron.schedule('5 12 * * *', async () => {
  console.log(new Date().toLocaleString(), 'url 크롤링 시작')
  // console.log(await myModule.setURLScheduler())
  await myModule.setURLScheduler()
  console.log(new Date().toLocaleString(), 'url 크롤링 종료')
})

cron.schedule('10 12 * * *', async () => {
  await myModule.downSongsFile()
  console.log(new Date().toLocaleString(), '음원 파일 로컬 다운로드')
})

cron.schedule('15 12 * * *', async () => {
  console.log(new Date().toLocaleString(), '가사 크롤링 시작')
  // console.log(await myModule.setRyrics())
  await myModule.setRyrics()
  console.log(new Date().toLocaleString(), '가사 크롤링 종료')
})

// 발매일, 장르 크롤링
cron.schedule('30 12 * * 2', async () => {
  await myModule.getSongsInfo()
})

cron.schedule('30 12 * * 1', async () => {
// cron.schedule('20 16 * * *', async () => {
  console.log(await myModule.reportWrongYtURL())
})

module.exports = app;
