define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PooledObject = require('./pooled-object2');


    /**
     * A vanilla replacement of the Backbone Model designed to be used with
     *   a built-in object pool
     */
    var PooledModel = PooledObject.extend({

        init: function() {
            this.attributes = {};
        },

        /**
         * Called on the instance after 'create' is called to set initial values
         */
        onCreate: function(attributes, options) {
            attributes = _.defaults({}, attributes, _.result(this, 'defaults'));
            this.set(attributes, options);
        },

        set: function(key, val, options) {
            var attrs;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } 
            else {
                attrs = {};
                attrs[key] = val;
            }

            for (var key in attrs)
                this.attributes[key] = attrs[key];

            return this;
        },

        get: function(key) {
            return this.attributes[key];
        },

        destroy: function() {
            PooledObject.prototype.destroy.apply(this, arguments);

            // Make sure the collection knows we destroyed it
            if (this.collections) {
                for (var i = this.collections.length - 1; i >= 0; i--)
                    this.collections[i].alertDestroyed(this);
            }
        }

    });


    return PooledModel;
});