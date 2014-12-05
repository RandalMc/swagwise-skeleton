// Require mongoose dependency
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    customer_id: String,
	isAdmin: Boolean,
	isActive: Boolean
});

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(){}, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});
