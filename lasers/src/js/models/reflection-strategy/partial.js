define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ReflectionStrategy = require('./reflection-strategy');

    /**
     * A ReflectionStrategy that reflects a specified fraction of photons
     */
    var PartialReflectionStrategy = function(reflectivity) {
        ReflectionStrategy.apply(this, arguments);

        this.reflectivity = reflectivity;
    };

    _.extend(PartialReflectionStrategy.prototype, ReflectionStrategy.prototype, {

        reflects: function(photon) {
            var result = false;
            if (this.reflectivity === 0) {
                result = false;
            }
            else if (this.reflectivity === 1) {
                result = true;
            }
            else {
                var r = Math.random();
                if (r < this.reflectivity)
                    result = true;
            }
            return result;
        },

        getReflectivity: function() {
            return this.reflectivity;
        },

        /**
         * Sets the reflectivity. Valid values are 0 to 1.
         */
        setReflectivity: function(reflectivity) {
            if (reflectivity < 0 || reflectivity > 1)
                throw 'Reflectivity not between 0 and 1.0';
            
            this.reflectivity = reflectivity;
        }

    });


    return PartialReflectionStrategy;
});