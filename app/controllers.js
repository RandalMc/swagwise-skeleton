(function(angular) {
    "use strict";

    angular.module('Swagwise')

	    .controller('AppController', function($scope, $state, $timeout, Auth) {

	        function successCallback() {

	            $state.go('login');

	            $scope.alert = {
	                type: 'success',
	                message: 'You have been logged out.'
	            };

	            $timeout(function() {
	                $scope.alert = undefined;

	            }, 3000);
	        }

	        $scope.logout = function() {
	            Auth.logout(successCallback);
	        }

	    })

	    .controller('SignupController', function($scope, $state, $timeout, Auth) {

	        function successCallback() {
	            $scope.alert = {
	                type: 'success',
	                message: 'Your account has been created.'
	            };

	            $timeout(function() {

	                $state.go('login');

	                $scope.alert = undefined;

	            }, 3000);
	        }

	        function errorCallback() {
	            $scope.alert = {
	                type: 'danger',
	                message: 'There was an error creating your account. Please try again.'
	            };

	            $timeout(function() {
	                $scope.alert = undefined;

	            }, 3000);
	        }

	        $scope.signup = function() {

	            Auth.signup({
	                email   : $scope.email,
	                password: $scope.password
	            }, successCallback, errorCallback);
	        };
	    })

	    .controller('LoginController', function($scope, $state, $timeout, Auth) {

	        function successCallback() {
	            $scope.alert = {
	                type: 'success',
	                message: 'You have successfully logged in.'
	            };

	            $timeout(function() {

	                $state.go('home');

	                $scope.alert = undefined;

	            }, 3000);
	        }

	        function errorCallback() {
	            $scope.alert = {
	                type: 'danger',
	                message: 'Invalid username and/or password'
	            };

	            $timeout(function() {
	                $scope.alert = undefined;

	            }, 3000);
	        }

	        $scope.login = function() {

	            Auth.login({
	                email: $scope.email,
	                password: $scope.password
	            }, successCallback, errorCallback);

	        };

	    })

	    .controller('HomeController', function($scope, SwagService) {

	        $scope.featuredProducts = SwagService.query({isFeatured: true});
	    })

	    .controller('SwagController', function($scope, SwagService, filterFilter) {

	        var items = SwagService.query();

	        $scope.swagSearch = '';

	        $scope.swag = items;

	        $scope.$watch('swagSearch', function(newValue, oldValue) {
	            if(newValue) {
	                // Filter swag
	                $scope.swag = filterFilter(items, {title: newValue});

	            }else {
	                // Reset swag
	                $scope.swag = items;
	            }
	        });

	    })

	    .controller('ProductDetailController', function($scope, $stateParams, SwagService) {

	        var product_id = $stateParams.id;

	        $scope.imageInterval = 3000;

	        $scope.item = SwagService.get({id: product_id}, function(item) {
	           $scope.relatedSwag = [];

	           angular.forEach(item.tags, function(tag) {
	               SwagService.query({tags: tag}, function(response) {
	                   angular.forEach(response, function(product) {
	                       if(item.id !== product.id) {
	                           $scope.relatedSwag.push(product);
	                       }
	                   });

	               });
	           });

	        });

	    })

	    // Inject in the CartService
	    .controller('CartController', function($scope, $state, CartService) {

	        // Set the items on the scope to the items in the CartService using the getItems method
	        $scope.items = CartService.getItems();

	        $scope.updateItem = function(item) {
	            if(typeof item.quantity === 'number') {
	                CartService.updateItemsCookie();
	            }
	        };

	        $scope.addItem = function(item) {
	            // Pass the item into the addItem method of the CartService
	            CartService.addItem(item);
	        };

	        $scope.getItemPrice = function(item) {
	            return item.specialPrice || item.price;
	        };

	        $scope.getItemSubtotal = function(item) {
	            return $scope.getItemPrice(item) * item.quantity;
	        };

	        $scope.getItemCount = function() {
	            // Return the item count from the CartService
	            return CartService.getItemCount();
	        };

	        $scope.getCartSubtotal = function() {
	            // Return the subtotal using the getCartSubtotal method of the CartService
	            return CartService.getCartSubtotal();
	        };

	        $scope.getCartTotal = function() {
	            // Return the cart total using the getCartTotal method of the CartService
	            return CartService.getCartTotal();
	        };

	        $scope.removeItem = function(id) {
	            // Pass the item id into the removeItem method of the CartService
	            CartService.removeItem(id);
	        };

	        $scope.emptyCart = function() {
	            // Invoke the emptyCart method of the CartService
	            CartService.emptyCart();
	            // Update the items on the scope
	            $scope.items = CartService.getItems();
	        };

	        $scope.checkout = function() {
	            $state.go('checkout');
	        };

	    })

	    .controller('CheckoutController', function($scope, CartService) {

	        // Add a card object to the scope
	        $scope.card = {};

	        // Add a checkout function
	        $scope.checkout = function() {
	            // Checkout using CartService
	            CartService.checkout($scope.card);

	        };

	    })

	    .controller('ReceiptController', function($scope, $stateParams, CartService) {

	        var items = CartService.getItems();

	        $scope.order = $stateParams;

	        $scope.items = angular.copy(items);

	        CartService.emptyCart();
	    })

		.controller('UsersController', function($scope, API){

			$scope.users = API.user.query();

		});


})(window.angular);
