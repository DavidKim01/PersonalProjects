//if the visitor is not logged in this wont do anything
//this middleware function will prevent users from trying to access the /login or /register forms when they are already logged in
function loggedOut(req, res, next){
    if (req.session && req.session.userId){ //if the user is already logged in
        return res.redirect('/accounts');
    }
    return next();
}

//middleware function to check if a user is logged in before going to the /accounts or /contact page
function requiresLogin(req, res, next){
    if (req.session && req.session.userId){//if they are logged in...
        return next(); //continue to serve them the accounts page
    } else {
        var err = new Error('Unauthorized Access! Please log in first.');
        err.status = 401;
        return next(err);
    }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;