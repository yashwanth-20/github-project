require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const session = require('express-session');

// Session configuration
app.use(session({
    secret: 'guruyash',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user
passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    cb(null, id);
});

// Passport GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "http://localhost:1000/auth/github/callback" // Use port 5000 (or your backend port)
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    cb(null, profile); // Here you can implement MongoDB logic to find or create a user in the DB
  }
));

// Middleware for authentication checking
const isAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Serve the React app (frontend)
app.use(express.static(path.join(__dirname, 'Frontend Project', 'dist','index.html')));

// Routes for React app pages
app.get('/', isAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend Project', 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/'); // If already logged in, redirect to home
  }
  res.sendFile(path.join(__dirname, 'Frontend Project', 'dist', 'index.html'));
});

// API to send user data
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Send user details to the frontend
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// GitHub Authentication
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err); // Handle error
    }
    req.session.destroy((err) => { // Destroy the session
      if (err) {
        return next(err);
      }
      res.redirect('/login'); // Redirect to login after session is cleared
    });
  });
});

// Catch-all route to serve React app for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend Project', 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
