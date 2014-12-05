module.exports = function(app) {

    // Require mongoose dependency
    var mongoose = require('mongoose');

    /* Add the dependency to passport after the mongoose require decleration */
    var passport = require('passport');

    /* Add the dependency to Stripe */
    var stripe   = require('stripe')('sk_test_MPZw5Of5EjrfHaAM789HgPUc');

	// Create a new instance of the Express 4 router
	var router = require('express').Router();

    /* ======================= REST ROUTES ====================== */
    // Handle API calls

    // Swag API route
    router.route('/products')
        .get(function(req, res) {

		    var filter = {
			    isActive: true
		    };

		    if (req.query.isFeatured) {
			    filter.isFeatured = (typeof req.query.isFeatured == 'boolean') ? req.query.isFeatured : true;
		    }

            // use mongoose to get all products in the database
            mongoose.model('Product').find(filter, function(err, swag) {

                //http://localhost:9001/api/swag/?isActive=false&foo=bar&ninja=false
                // req.query = {isFeatured: true, foo: bar, ninja: false}

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.send(swag); // return products in JSON format
            });
        });

    router.route('/products/:id')
        .get(function(req, res) {
            // use mongoose to get a product in the database by id
            mongoose.model('Product').findOne({id: req.params.id}, function(err, product) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

	            if(product.isActive) {
		            res.send(product); // return the product in JSON format
	            } else {
		            res.send({
			            status: 400,
			            message: 'The requested product is no longer available'
		            });
	            }

            });
        });

    /* Add the following routes after the products routes */
    // logout API route
    router.route('/logout')
	    .get(function(req, res, next) {
	        req.logout();
	        res.send(200);
        });

    // login API route
    router.route('/login')
	    .post(passport.authenticate('local'), function(req, res) {
		    if (req.isAuthenticated()) {
			    res.cookie('user', JSON.stringify(req.user));
			    res.send(req.user);
		    }
        });

    // signup API route
    router.route('/register')
	    .post(function(req, res, next) {
	        var User = mongoose.model('User');
	        var email = req.body.email;

	        // Create a customer
	        stripe.customers.create({

	            email: email

	        }, function(err, customer){

	            if(err) return next(err);

	            var user = new User({
	                email: email,
	                password: req.body.password,
	                customer_id: customer.id
	            });

	            user.save(function(err) {
	                if (err) return next(err);

	                res.send(200);
	            });

	        });
	    });

    /* ========================= CHECK OUT ROUTES ======================= */

    router.route('/checkout')
        .post(function(req, res, next) {

            var charge = {
                amount: parseInt(req.body.amount) * 100,
                currency: "usd",
                card: {
                    number: parseInt(req.body.number),
                    exp_month: parseInt(req.body.month),
                    exp_year: parseInt(req.body.year),
                    name: req.body.name,
                    cvc: parseInt(req.body.cvv),
                    customer: req.body.customer_id || null
                }
            };

            stripe.charges.create(charge, function(err, order) {

                if(err) return next(err);

                res.send(order);

            });

        });

	app.use('/api', router);

    /* ========================= FRONT-END ROUTES ======================= */
    // route to handle all angular requests
    app.route('*')
        .all(function(req, res) {
        res.sendfile('./app/index.html'); // load our public/index.html file
    });

};
