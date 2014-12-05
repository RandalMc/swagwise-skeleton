(function(angular) {
    "use strict";

    var app = angular.module('Swagwise');

    app.config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider
            .otherwise('/');

	    /*
	    $routeProvider
	        .where('home', {
	            controller: '',
	            template: ''
	        })
	     */

        $stateProvider
            .state('home', {
                url: '/',
                controller: 'HomeController',
                templateUrl: 'views/home.html'
            })
            .state('swag', {
                url: '/swag',
                controller: 'SwagController',
                templateUrl: 'views/swag.html'
            })
            .state('product', {
                url: '/product/:id',
                controller: 'ProductDetailController',
                templateUrl: 'views/detail.html'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html'
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'views/contact.html'
            })
            .state('cart', {
                url: '/cart',
                controller: 'CartController',
                templateUrl: 'views/cart.html'
            })
            .state('checkout', {
                url: '/checkout',
                controller: 'CheckoutController',
                templateUrl: 'views/checkout.html'
            })
            .state('receipt', {
                url: '/receipt',
                controller: 'ReceiptController',
                templateUrl: 'views/receipt.html'
            })
            .state('login', {
                url: '/login',
                controller: 'LoginController',
                templateUrl: 'views/login.html'
            })
            .state('signup', {
                url: '/signup',
                controller: 'SignupController',
                templateUrl: 'views/signup.html'
            })
	        .state('users', {
		        url: '/users',
		        controller: 'UsersController',
		        templateUrl: 'views/admin/users.html'
	        })

    });

})(window.angular);
