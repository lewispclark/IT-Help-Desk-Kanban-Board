const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const database = require('./database');
const indexRouter = require('./routes/index');
const ticketListRouter = require('./routes/ticket-list');
const archiveRouter = require('./routes/archive');
const faqRouter = require('./routes/faq');
const loginRouter = require('./routes/login');
const holidayRouter = require('./routes/holiday');
const ajaxCallableFunctionsRouter = require('./routes/ajax-callable-functions');
const hardwareRouter = require('./routes/hardware');
const softwareRouter = require('./routes/software');


const app = express();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT);
app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);
if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  name: 'sid',
  'resave': false,
  saveUninitialized: true,
}));

app.use('/ticket-list', ticketListRouter);
app.use('/ajax-callable-functions', ajaxCallableFunctionsRouter);
app.use('/archive', archiveRouter);
app.use('/faq', faqRouter);
app.use('/login', loginRouter);
app.use('/hardware', hardwareRouter);
app.use('/software', softwareRouter);
app.use('/holiday', holidayRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// For local testing
app.listen(5012)

// Sci-project hosting
// module.exports = app;
