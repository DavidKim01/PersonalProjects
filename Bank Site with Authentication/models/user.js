//schema for storing user authentication information
let mongoose = require('mongoose');
//use the bycrpt module
let bcrypt = require('bcrypt');
//createing new mongoose schema object
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: false
    },
    address1: {
        type: String,
        required: false
    },
    address2: {
        type: String,
        required: false
    },
    inputCity: {
        type: String,
        required: false
    },
    inputState: {
        type: String,
        required: false
    },
    inputZip: {
        type: String,
        required: false
    },
    savingsAmount: {
        type: String,
        required: false
    },
    checkingAmount: {
        type: String,
        required: false
    },
    moneyMarketAmount: {
        type: String,
        required: false
    },
    cdAmount: {
        type: String,
        required: false
    },
    iraAmount: {
        type: String,
        required: false
    },
    accountSavings: {
        type: String,
        required: false
    },
    accountChecking: {
        type: String,
        required: false
    },
    accountMoneyMarket: {
        type: String,
        required: false
    },
    accountCd: {
        type: String,
        required: false
    },
    accountIraCd: {
        type: String,
        required: false
    }
});
//authenticate input against database documents. the mongoose statics object lets you add methods directly to the model
//this will allow other files that require the model to be able to call this method, like our routes file at index.js
UserSchema.statics.authenticate = function (email, password, callback) {
    //the callback function will either log the user in or give them an unauthorized/please log in error
    //now query mongoose to find a user with the specified email address passed in

    User.findOne({email: email})
        .exec(function (error, user){//exec will then perform the search and provide a callback to process the results
            if (error) {
                return callback(error);
            } else if (!user ) //also returns an error if the user was not found
            {
                let err = Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (error, result) {
                if(result == true){
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        }) ;
}


//presavehook: this is run everytime, right before saving a record to mongo
//hash the pw before saving it to our db
UserSchema.pre('save', function(next){
    //before saving, this anonymouse function is run...
    let user = this; //user hold the user object and its data
    bcrypt.hash(user.password, 10, function (err, hash){
        //this callback function is run once the hash is generated
        //10 specifies how many times to run the encryption algorithm on the password
        //the higher the number the slower the process but the greater the security
        //This is a good amount to ensure security without adversely affecting server performance
        if (err) {
            //if there is an error, the error will be passed along to 
            //the error handler in the app.js file
            return next(err);
        }
        //if there is no error we can assign the new hashed value to the pw property of the user object
        //overwriting the plaintext pw with the new secure hash
        user.password = hash;
        //in express next() calls the next function in the middleware stack
        //in this case, mongoose will now save the data to mongo
        next();
    });
})
let User = mongoose.model('User', UserSchema);
module.exports = User;


