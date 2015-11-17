define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    /**
     * I wanted to come up with a general solution for this problem of having
     *   a bunch of pooled objects, and I also wanted to add some extra
     *   functionality.  I wanted to make it so an object could own any 
     *   objects that it creates and then just call one static method on this
     *   class to release all instances that it owns instead of having to
     *   keep track of instances itself and release them individually.  This
     *   is what I came up with.  There might be some precedence for this
     *   kind of thing already, but I don't have time to look it up.  I'm not
     *   even sure what I'd look for.  I'll probably put this in the common
     *   files if it turns out useful.
     */
    var PooledObject = function() {

    };

    /**
     * Instance functions/properties
     */
    _.extend(PooledObject.prototype, {

        /**
         * Initializes the PooledObject's properties with provided initial values
         */
        init: function() {},

        /**
         * Releases this instance to the object pool.
         */
        destroy: function() {
            this.constructor._pool.remove(this);
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(PooledObject, {

        /**
         * Initializes and returns a new PooledObject instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            if (!this._pool)
                this.initPool();
            var pooledObject = this._pool.create();
            pooledObject.init.apply(pooledObject, arguments);
            return pooledObject;
        },

        /**
         * Initializes and returns a new PooledObject instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.  The difference is that the first parameter
         *   is an owner object.  The new object will be added to a list of
         *   objects owned by that owner, so the owner can later release all
         *   objects that it owns.
         */
        createWithOwner: function(owner) {
            // See if we need to set up the infrastructure for owned objects
            if (!this._ownedObjects) {
                this._ownedObjects = [];
                this._ownerId = 0;
            }
            // Get an array of the args for this function minus the first one (owner)
            var constructorArgs = Array.prototype.slice.call(arguments, 1);
            // Create the object instance
            var pooledObject = this.create.apply(this, constructorArgs);
            // See if this object already has an owner id, and if it doesn't, create one
            if (owner.__ownerId === undefined)
                owner.__ownerId = this._ownerId++;
            // Create the array for this owner's objects if it doesn't yet exist
            if (this._ownedObjects[owner.__ownerId] === undefined)
                this._ownedObjects[owner.__ownerId] = [];
            // Add this new object to the object's owner array
            this._ownedObjects[owner.__ownerId].push(pooledObject);
            // Then return it!
            return pooledObject;
        },

        /**
         * Initializes the object pool.  
         */
        initPool: function() {
            this._pool = Pool(this.getPoolConfig());
        },

        /**
         * Returns the configuration to pass to the Pool constructor. This is meant
         *   to be overriden by child classes if necessary.
         */
        getPoolConfig: function() {
            var Constructor = this;
            return {
                init: function() {
                    return new Constructor();
                }
            };
        },

        /**
         * Destroys all objects owned by the given owner.
         */
        destroyAllOwnedBy: function(owner) {
            if (this._ownedObjects && owner.__ownerId !== undefined && this._ownedObjects[owner.__ownerId]) {
                var objects = this._ownedObjects[owner.__ownerId];
                for (var i = objects.length - 1; i >= 0; i--) {
                    objects[i].destroy();
                    objects.splice(i, 1);
                }
            }
        },

        /**
         * Modeled somewhat after Backbone's extend function, this is a convenience
         *   function for creating child classes of PooledObject.
         */
        extend: function(objectConstructor, prototypeProps, staticProps) {
            if (!_.isFunction(objectConstructor)) {
                staticProps = prototypeProps;
                prototypeProps = objectConstructor;
                objectConstructor = function() {};
            }

            var parent = this;
            var child = function() {
                objectConstructor.apply(this, arguments);
                parent.apply(this, arguments);
            };

            // Static functions/properties
            _.extend(child, parent, staticProps);
            delete child._pool;
            delete child._ownedObjects;
            delete child._ownerId;

            _.bindAll(child, 'create', 'createWithOwner', 'initPool', 'getPoolConfig', 'destroyAllOwned');

            // This piece is straight from Backbone.js. It "sets the prototype chain to inherit from parent".
            var Surrogate = function(){ this.constructor = child; };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            // Instance functions/properties
            _.extend(child.prototype, parent.prototype, prototypeProps);

            
            return child;
        }

    });


    return PooledObject;
});