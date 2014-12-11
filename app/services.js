(function(angular) {
    "use strict";

    var app = angular.module('Swagwise');

    app.factory('API', function($resource) {

        return {

            swag: $resource('/api/products/:id'),

            checkout: $resource('/api/checkout'),

            login: $resource('/api/login'),

            logout: $resource('/api/logout'),

            register: $resource('/api/register'),

	        user: $resource('/api/admin/users/:id', {id:'@id'})

        };

    });

    app.factory('Auth', function(API, $rootScope, $cookieStore) {

        $rootScope.currentUser = $cookieStore.get('user');

        return {

            login: function(user, success, error) {
                return API.login.save(user)
                    .$promise
                    .then(
                        function(data) {
                            $rootScope.currentUser = data;

                            success();
                        },
                        error
                    );
            },

            signup: function(user, success, error) {
                return API.register.save(user).$promise.then(success, error);
            },

            logout: function(success) {
                return API.logout.get()
                    .$promise
                    .then(function() {

                        $rootScope.currentUser = null;
                        $cookieStore.remove('user');

                        success();
                    });
            }
        };

    });

    app.factory('SwagService', function(API) {

        return API.swag;

    });

    // Inject in $cookieStore, SwagService and app config
    app.factory('CartService', function($state, $cookieStore, API) {

        // Private items object
        var items = {};

        // Angular factories return service objects
        return {

            getItems: function() {
                // Initialize itemsCookie variable
                var itemsCookie;
                // Check if items object has been populated
                if(!items.length) {
                    // Populate items object from cookie
                    itemsCookie = $cookieStore.get('items');
                    // Check if cookie exists
                    if(itemsCookie) {
                        // Loop through cookie and get the item by it's id
                        angular.forEach(itemsCookie, function(quantity, id) {
                            // Add each item to the items object and set it's quantity
                            API.swag.get({id: id}, function(product) {
                                // Update the quantity to the quantity saved in the cookie
                                product.quantity = parseInt(quantity);
                                // Add the product to the cart items object using the guid as the key
                                items[product.id] = product;
                            });
                        });

                    }
                }

                // Return the items object
                return items;
            },

            addItem: function(item) {
                // TODO if we have time, add ability to specify quantity when adding item
                // Checks if item already exists
                if (items[item.id]) {
                    // If it exists, updates the quantity
                    items[item.id].quantity = parseInt(items[item.id].quantity) + 1;
                } else {
                    // If it doesn't exist, adds quantity property with value of 1 then
                    item.quantity = 1;
                    // Add the item onto the items collection
                    items[item.id] = item;
                }

                // Update cookie
                this.updateItemsCookie();
            },

            removeItem: function(id) {
                // Removes an item from the items object
                delete items[id];
                // Update cookie
                this.updateItemsCookie();
            },

            emptyCart: function() {
                // Re-initialize items object to an empty object
                items = {};
                // Remove items cookie using $cookieStore
                $cookieStore.remove('items');
            },

            getItemCount: function() {
                // Initialize total counter
                var total = 0;
                // var items = this.getItems();
                // Loop through items and increment the total by the item quantity
                angular.forEach(items, function(item) {
                    total += parseInt(item.quantity) || 1;
                });
                // Returns number of items, including item quantity
                return total;
            },

            getCartSubtotal: function() {
                // Initialize the total counter
                var total = 0;
                //var items = this.getItems();
                // Loop through the items and multiply the quantity by the item price and increment the total
                angular.forEach(items, function(item) {
                    var price = item.specialPrice? parseFloat(item.specialPrice) : parseFloat(item.price);
                    var quantity = parseInt(item.quantity);
                    total += price * quantity;
                });
                // Return the item quantity times item price for each item in the array
                return total;
            },

            getCartTotal: function() {
                return this.getCartSubtotal();
            },

            checkout: function(card) {
                // Get the user
                var user = $cookieStore.get('user');

                // Set up the data
                var data = {
                    amount: this.getCartTotal(),
                    customer_id: user ? user.customer_id : null
                };

                // Merge card and data
                angular.extend(data, card);

                // Checkout with API
                API.checkout.save(data)
                    .$promise
                    .then(
                    function(response) {
                        $state.go('receipt', response);
                    }
                );
            },

            updateItemsCookie: function() {
                // Initialize an object to be saved as the cookie
                var itemsCookie = {};
                // Loop through the items in the cart
                angular.forEach(items, function(item, key) {
                    // Add each item to the items cookie,
                    // using the id as the key and the quantity as the value
                    itemsCookie[key] = item.quantity;
                });
                // Use the $cookieStore service to persist the itemsCookie object to the cookie named 'items'
                $cookieStore.put('items', itemsCookie);
            }

        };

    });

})(window.angular);
