// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Initialize Express
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'yourSecretKey', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect('mongodb+srv://nardosyosef:nardi123nardi123@cluster0.f3po9zf.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a user schema and model
const User = mongoose.model('User', {
  username: String,
  password: String,
});

// Configure Passport
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return done(err);
      if (result) return done(null, user);
      return done(null, false, { message: 'Incorrect password.' });
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Register and login routes
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    const user = new User({
      username: username,
      password: hash,
    });
    user.save((err) => {
      if (err) {
        console.error(err);
        res.redirect('/register');
      } else {
        res.redirect('/login');
      }
    });
  });
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

// Example routes
app.get('/', (req, res) => {
  res.send('Welcome to the application.');
});

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Dashboard: You are logged in.');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.send('Login page.');
});

app.get('/register', (req, res) => {
  res.send('Register page.');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
