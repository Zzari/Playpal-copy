require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cp = require('cookie-parser');
const passport = require('./authentication/passport');
const mongoose = require('mongoose');
const router = require('./db/crudRoutes');
const MongoStore = require('connect-mongo');
const app = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(cp());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://playpal-stsweng.vercel.app',
  credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      autoRemove: 'interval',
      autoRemoveInterval: 1440, // Interval time unit is Minutes; 1440 minutes = 24 Hours 
      dbName: 'test',
      collectionName: 'sessions'}),
    saveUninitialized: false,
    cookie: {
    secure: process.env.NODE_ENV === 'development' ? false : true,
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
    maxAge: 24 * 60 *60 * 1000 
  }
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(passport.authenticate('session'));
app.use('/crud', router);

app.get('/', (req, res) => {
  res.json({ message: 'PlayPal API is running' });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect( (process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : 'https://playpal-stsweng.vercel.app');

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save(() => {
        return res.redirect( (process.env.NODE_ENV === 'development') ? 'http://localhost:3000/home' : 'https://playpal-stsweng.vercel.app/home');
      });
    });
  })(req, res, next);
});


/*app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/home' : 'https://playpal-frontend.vercel.app/home',
        failureRedirect: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://playpal-frontend.vercel.app'
    }),
);*/

app.get('/auth/success', (req, res) => {
    res.json({ user: req.user });
});

app.get("/auth/me", (req, res) => {
    const currUser = req.user; 
    if (!currUser) {
        return res.status(200).json({ user: null }); //return null for now
    }
    const isDLSUEmail = currUser.email.endsWith('@dlsu.edu.ph');

    if (!isDLSUEmail) {
        return res.status(403).json({ 
            error: "Only DLSU emails are allowed",
            isDLSUEmail: false 
        });
    }

    res.json({ 
        user: {
            email: currUser.email,
            fullName: currUser.fullName,
            givenName: currUser.givenName,
            familyName: currUser.familyName,
            pfp: currUser.pfp,
            bio: currUser.bio,
            favSports: currUser.favSports
        },
        isDLSUEmail: true
    });
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

app.get('/home', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

//MongoDB Connection with retry (just in case it fails)
const connectWithRetry = (retries = 5, delay = 10000) => {
  mongoose.connect(process.env.MONGODB_URI, {
    //dbName: 'PlayPal',
    dbName: 'test' //for sample data
  }).then(() => {
    console.log('DB Connection Established');
  }).catch((error) => {
    console.log(`DB Connection Failed (${retries} retries left):`, error);
    if (retries > 0) {
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.log('All retries fin. Could not connect to MongoDB.');
    }
  });
};
connectWithRetry();


  //PORT 8080 by default for now
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;
