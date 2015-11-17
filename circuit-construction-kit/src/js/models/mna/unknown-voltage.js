define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PooledObject = require('common/pooled-object/pooled-object');

    /**
     * Represents an unknown current in the circuit equations.
     */
    var UnknownVoltage = PooledObject.extend({

        /**
         * Initializes the UnknownVoltage's properties with provided initial values
         */
        init: function(node) {
            this.node = node;
        },

        equals: function(obj) {
            if (this === obj) 
                return true;
            
            if (obj == null || this.prototype !== obj.prototype)
                return false;

            if (!this.node === obj.node)
                return false;

            return true;
        }

    });


    return UnknownVoltage;
});