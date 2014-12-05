module.exports = function(app) {

    // Require mongoose dependency
    var mongoose = require('mongoose');

    /* Add the dependency to Stripe */
    var stripe   = require('stripe')('sk_test_MPZw5Of5EjrfHaAM789HgPUc');

	// Create a new instance of the Express 4 router
	var router = require('express').Router();

	var User = mongoose.model('User');

	/* ======================= MIDDLEWARE ====================== */

	function checkRole(role) {
		return function(req, res, next) {

			// if (req.user.isAdmin = true)
			if (req.user && req.user[role]) {
				next();
			} else {
				res.send(401, 'Unauthorized');
			}
		}
	}

    /* ======================= REST ROUTES ====================== */

	router.route('/*')
		.all(checkRole('isAdmin'));

    // Products API route
    router.route('/products')
        .get(function(req, res) {

		    var filter = {};

		    if (req.query.isFeatured) {
			    filter.isFeatured = isBoolean(req.query.isFeatured) ? req.query.isFeatured : true;
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

                res.send(product); // return the product in JSON format
            });
        });

	router.route('/users')
		.get(function(req, res) {

			User.find(req.query, function(err, users) {

				if (err) res.send(err);

				res.send(users);

			});
		})
		.post(function(req, res) {

			/*var user = new User(req.body);

			user.save(function(err, user) {

				if(err) res.send(err);

				res.send(user);
			});
			*/

			User.create(req.body, function(err, user) {

				if(err) res.send(err);

				res.send(user);
			});

		});

	router.route('/users/:id')
		.get(function(req, res) {

			User.findOne({_id: req.params.id}, function(err, user) {

				if(err) res.send(err);

				res.send(user);
			});
		})
		.post(function(req, res) {

			/*
			User.findOne({id: req.params.id}, function(err, user) {

				if (err) res.send(err);

				if(req.body.firstName) user.firstName = req.body.firstName;

				if(req.body.lastName) user.lastName = req.body.lastName;

				if(req.body.email) user.email = req.body.email;

				if(typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;

				if(typeof req.body.isAdmin === 'boolean') user.isAdmin = req.body.isAdmin;

				user.save(function(err, user) {
					if(err) res.send(err);

					res.send(user);
				});
			});
			*/

			User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
				if(err) res.send(err);

				res.send(user);
			});
		})
		.delete(function(req, res) {

			/*
			User.findOne({id: req.params.id}, function(err, user) {
				if(err) res.send(err);

				user.remove(function(err, response) {
					if(err) res.send(err);

					res.send(response);
				});
			});
			*/

			User.findByIdAndRemove(req.params.id, function(err, response) {
				if(err) res.send(err);

				res.send(response);
			});
		});

	app.use('/api/admin', router);
};
