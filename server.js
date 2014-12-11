/* ================= REQUIRE MODULES ===================== */

var express       = require('express'),
    app           = express(),
    path          = require('path'),
    fs            = require('fs'),
    logger        = require('morgan'),
    mongoose      = require('mongoose'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    passport      = require('passport'),
    session       = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt        = require('bcrypt-nodejs'),
    http          = require('http'),
    https         = require('https');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

/* ===================== CONFIGURATION ==================== */

var app = express();

var privateKey   = fs.readFileSync('cert/server.key', 'utf8');
var certificate  = fs.readFileSync('cert/server.crt', 'utf8');
var credentials  = {key: privateKey, cert: certificate};

var httpServer   = http.createServer(app);
var httpsServer  = https.createServer(credentials, app);

// 8443 for development, 443 for production
var sslport = 8443;

/*
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for
 * plenty of time in most operating environments.
 */

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS : 30000
        }
    }
};

var conn = mongoose.connection;
//'mongodb://localhost:27017/swagwise'
mongoose.connect('mongodb://swaguser:swagwise@ds045679.mongolab.com:45679/geekwise');
conn.on('error', console.error.bind(console, 'connection error:'));
	conn.once('open', function() {
		// Wait for the database connection to establish, then start the app.
		httpServer.listen(server_port, server_ip_address, function() {
            console.log('Get your swagger on at http://localhost: %s', server_port);
        });
		httpsServer.listen(sslport, function() {
            console.log('Get your secure swagger on at https://localhost: %s', sslport);
        });
});

/* ================= REGISTER MODULES ===================== */

// log every request to the console
app.use(logger('dev'));
// have the ability to simulate DELETE and PUT
app.use(bodyParser.json());
// have the ability to simulate DELETE and PUT
app.use(bodyParser.urlencoded({ extended: true }));
// have the ability to parse cookies
app.use(cookieParser());
// set the static files location
app.use(express.static(path.join(__dirname, 'app')));
// Encryption key/salt
app.use(session({
    secret: 'blackwidow straw',
    saveUninitialized: true,
    resave: true }));
// Initializes passport
app.use(passport.initialize());
// Create a new passport session
app.use(passport.session());
// Flatten the user cookie object
app.use(function(req, res, next) {
    if (req.user) {
        res.cookie('user', JSON.stringify(req.user));
    }
    next();
});

/* ======================== MODELS ========================= */
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
    if(~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

/* ===================== PASSPORT ========================= */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var User = mongoose.model('User');

    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local', new LocalStrategy({ usernameField : 'email'}, function(email, password, done) {
    var User = mongoose.model('User');

    User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);

        function cb(err, isMatch) {
            if (err) return done(err);
            if (isMatch) return done(null, user);
            return done(null, false);
        }
        bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    });
}));

/* ======================== ROUTES ========================= */
require('./admin-routes.js')(app, passport);

require('./routes.js')(app);

// Expose the app
exports = module.exports = app;
