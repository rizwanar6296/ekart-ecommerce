const swal = require('sweetalert')
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const db =require('./config/connections')
const app = express();
const hbs =require('express-handlebars')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
const { ifEquals, indexing, statusColor, wishlistHeartIcon, calculateDiscount, checkGreater, productCategoryDiscount, parser, brandFilterCheckBox, addedToCartCheck } = require('./hbsHelpers')
const razorpay=require('razorpay');
const helpers = require('handlebars-helpers');
const userHelpers = require('./helpers/user-helpers');
const { parse } = require('path');



const expressHelpers=hbs.create({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials',
      helpers:{
        ifEquals:ifEquals,
        indexing:indexing,
        statusColor:statusColor,
        wishlistHeartIcon:wishlistHeartIcon,
        calculateDiscount:calculateDiscount,
        checkGreater:checkGreater,
        productCategoryDiscount:productCategoryDiscount,
        parser:parser,
        brandFilterCheckBox:brandFilterCheckBox,
        addedToCartCheck:addedToCartCheck
      }
})


app.engine('hbs', expressHelpers.engine)



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// app.engine('hbs', hbs.engine({
//   extname: 'hbs',
//   defaultLayout: 'layout',
//   layoutsDir: __dirname + '/views/layouts/',
//   partialsDir: __dirname + '/views/partials'
// }))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge:600000, httpOnly:true}
}))
app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next()
})
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.connect((err)=>{
  if(err) {
    console.log('connection erro     '+err)
}else console.log('db connected successfully')
}),


app.use('/', userRouter);
app.use('/admin',adminRouter)

// app.use('*', function(req, res){
//   res.status(404).send('what');
// });
app.get('/admin/*',(req,res)=>{
  res.render('admin/star',{layout:false})
})
app.get('/*',(req,res)=>{
  res.render('user/star',{layout:false})
})
// app.get('*', function(req, res){
//   res.status(404).send('what???');
// });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// if(!req.xhr&&req.method!='POST'&&req.url!='/login'){
//   req.session.url = req.url
//   }

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
