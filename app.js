if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
console.log(process.env.SECRET)

const express = require ('express');
const { default: mongoose } = require('mongoose');
const path = require('path');
const ejsMate= require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require ('method-override');
const catchAsync = require('./utils/catchAsync');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Review = require('./models/review');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
 // process.env.DB_URL;
const secret = process.env.SECRET || "thisshouldbeabettersecret!"; 

const userRoute = require('./routes/user');
const campgroundRoute = require('./routes/campground');
const reviewRoute = require('./routes/review');

// const MongoDBStore = require('connect-mongo')(session);
const MongoStore = require("connect-mongo");

//'mongodb://127.0.0.1:27017/yelp-camp'

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const app =express();
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')));

const store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    touchAfter: 24 * 60 * 60,
})

store.on('error', function(e){
    console.log('session store error', e);
})


const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };
  
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.session);
    res.locals.currentUser= req.user;
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
})

app.use('/', userRoute);
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);

app.get('/', (req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next( new ExpressError('page not found', 404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message)  message='something went wrong';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=>{
    console.log("listening on port 3000");
})