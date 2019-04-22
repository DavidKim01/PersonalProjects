let express = require('express');
let router = express.Router();

//require the mongoose user.js model/schema
let User = require('../models/user');
let mid = require('../middleware');

//GET /accounts
router.get('/accounts', mid.requiresLogin, function(req,res,next){
  if(! req.session.userId){
    let err = new Error("Please log in first to view your accounts and balances.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
    .exec(function (error, user){
      if (error){
        return next(error);
      } else {
        return res.render('accounts', {title: 'Accounts', firstname: user.firstname, lastname:user.lastname,
          accountSavings: user.accountSavings, savingsAmount: user.savingsAmount, accountChecking: user.accountChecking, checkingAmount: user.checkingAmount,
          accountMoneyMarket: user.accountMoneyMarket, moneyMarketAmount: user.moneyMarketAmount, accountCd: user.accountCd, cdAmount: user.cdAmount,
          accountIraCd: user.accountIraCd, iraAmount:user.iraAmount});
      }
    });
})

// Get /logout
router.get('/logout', function(req,res,next){
  if(req.session){ //if a session exists...
    req.session.destroy(function (err) { //this indicates what the app will do after it destroys the session)
      if(err){
        return next(err);
      } else {
        return res.redirect('/'); //redirect the now logged out user back to the homepage
      }

    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, function (req, res, next){
  return res.render('login', {title: 'Log In'});
});

// GET for approval
router.get('/approved', mid.requiresLogin, function (req, res, next){
  if(! req.session.userId){
    let err = new Error("Please log in first to apply for an account.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
    .exec(function (error, user){
      if (error){
        return next(error);
      } else {
        return res.render('approved', {title: 'Congratulations!', firstname: user.firstname, lastname:user.lastname});
      }
    });
});

// POST /login
router.post('/login', function (req, res, next){
  if(req.body.email && req.body.password){
    User.authenticate(req.body.email, req.body.password, function(error, user){
      if (error || !user) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/accounts');
      }
    });
  } else {
    let err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
})

//mid.requiresLogin middleware add later
//GET the register/signup page 
router.get('/apply',mid.requiresLogin, function(req, res, next){
  return res.render('apply', { title : 'Application' });
});

router.post('/apply', function(req, res, next){
  //makes all the fields required
  console.log('User: ' + req.session.userId + ' submitting POST request.');
  if (req.body.address1 &&
    req.body.inputCity &&
    req.body.inputZip &&
    req.body.inputState){
      let minError = 'Insufficient Amount. Minimum balance not met.';
      let appliedData = {
        address1: req.body.address1,
        address2: req.body.address2,
        inputCity: req.body.inputCity,
        inputState: req.body.inputState,
        inputZip: req.body.inputZip
      };

      if(req.body.savingsAmount){
        if(Number(req.body.savingsAmount)<=500){
          let err = new Error(minError);
          err.status = 400;
          return next(err);
        }
        appliedData.savingsAmount = req.body.savingsAmount;
        appliedData.accountSavings = "Savings Account:"
      }
      else if(req.body.checkingAmount){
        if(Number(req.body.checkingAmount)<=250){
          let err = new Error(minError);
          err.status = 400;
          return next(err);
        }
        appliedData.checkingAmount = req.body.checkingAmount;
        appliedData.accountChecking = "Checking Account:"
      }
      else if(req.body.moneyMarketAmount){
        if(Number(req.body.moneyMarketAmount)<=750){
          let err = new Error(minError);
          err.status = 400;
          return next(err);
        }
        appliedData.moneyMarketAmount = req.body.moneyMarketAmount;
        appliedData.accountMoneyMarket = "Money Market Account:"
      }
      else if(req.body.cdAmount){
        if(Number(req.body.moneyMarketAmount)<=200){
          let err = new Error(minError);
          err.status = 400;
          return next(err);
        }
        appliedData.cdAmount = req.body.cdAmount;
        appliedData.accountCd = "CD Account:"
      }
      else if(req.body.iraAmount){
        if(Number(req.body.iraAmount)<=200){
          let err = new Error(minError);
          err.status = 400;
          return next(err);
        }
        appliedData.iraAmount = req.body.iraAmount;
        appliedData.accountIraCd = "IRA CD Account:"
      }
      //create an object with the form input to be saved in the db


      //use schema's 'create' method to insert the document into mongo
      User.updateOne({_id: req.session.userId}, appliedData, function(error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/approved');//refactor to "accounts"
        }
      });

    } else {
      let err = new Error('All fields required. Please go back and fill in the required forms.');
      err.status = 400;
      return next(err);
    }
});

//GET the register/signup page
router.get('/register', mid.loggedOut, function(req, res, next){
  return res.render('register', { title : 'Sign Up' });
});

//POST to get user register information
router.post('/register', function(req, res, next){
  console.log('registering: ' + req.session.userId);
  //makes all the fields required
  if (req.body.email &&
    req.body.firstname &&
    req.body.lastname &&
    req.body.password &&
    req.body.confirmPassword){
      
      //confirm user typed the same password twice
      if(req.body.password != req.body.confirmPassword){
        let err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      //create an object with the form input to be saved in the db
      let userData = {
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
      };

      //use schema's 'create' method to insert the document into mongo
      User.create(userData, function(error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id; //registered users are automatically signed in
          return res.redirect('/apply');//refactor to "accounts"
        }
      });

    } else {
      let err = new Error('All fields required. Please go back and fill in the required forms.');
      err.status = 400;
      return next(err);
    }
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

  

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
//img(src='/images/pacebank_logo.png', alt='avatar', width='200',height='91')