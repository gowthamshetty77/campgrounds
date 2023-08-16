if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}



// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require('connect-mongo')(session);

const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/yc');

// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://127.0.0.1:27017/yc';
mongoose.connect(dbUrl);

// mongoose.connect('mongodb://127.0.0.1:27017/iu');
// mongoose.connect('mongodb://127.0.0.1:27017/ve');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
      replaceWith: '_',
    })
  );

  const store = new MongoDBStore({
    url: dbUrl,
    secret : 'thisshouldbebettersecret',
    touchAfter: 24 * 60 * 60
  });

  store.on("error", function(e){
    console.log("SESSION STORE ERROR", e );
  })

const sessionConfig = {
    store,
    name: 'session',
    secret : 'thisshouldbebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnr3hnenc/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());               //In to the Session
passport.deserializeUser(User.deserializeUser());           //Out of the Session

app.use((req,res,next) => {
    // console.log(req.session);
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req,res) => {
    const user = new User({ email : 'bmw@gmail.com', username: 'bmw'});
    const newUser = await User.register(user, 'bmw');
    res.send(newUser);
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home');
});



app.all('*', (req, res, next) => {
    // res.send('404!!!!!!!!!!!!!!!');
    next(new ExpressError('page not found', 404));
})

// app.use((err, req, res, next) => {
//     const {statusCode = 500, message = 'something went wrong'} = err;
//     res.status(statusCode).send(message);
//     // res.send('Oh boy, something went wrong!!!!!!!!!!!');
// })

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'oh no, something went wrong!!'
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});