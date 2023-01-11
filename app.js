var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')

var app = express();
//var fileUpload=require('express-fileupload')
var db=require('./config/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials',
  helpers: {
    isEqual: (status, value, options) => {
      if (status == value) {
        return options.fn(this)
      }
      return options.inverse(this)
    },
    math: function (lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
      }[operator];
    }
  }
}
))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(fileUpload())
db.connect((err)=>{
  if(err)console.log(`connection error due to ${err}`)
  else console.log('database connected sucessfully')
})
app.use(session({
  secret:'key',
  resave: true,
  saveUninitialized: true,
  cookie:{maxAge:60000000000}
}))

app.use('/', userRouter);
app.use('/admin', adminRouter);
// app.get("*",(req,res)=>{
//   console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
//   res.render('user/eror')})

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
