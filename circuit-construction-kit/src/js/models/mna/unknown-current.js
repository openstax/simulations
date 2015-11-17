define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PooledObject = require('common/pooled-object/pooled-object');

    /**
     * Represents an unknown current in the circuit equations.
     */
    var UnknownCurrent = PooledObject.extend({

        /**
         * Initializes the UnknownCurrent's properties with provided initial values
         */
        init: function(element) {
            this.element = element;
        },

        equals: function(obj) {
            if (this === obj) 
                return true;
            
            if (obj == null || this.prototype !== obj.prototype)
                return false;

            if (!this.element === obj.element)
                return false;

            return true;
        }

    });


    return UnknownCurrent;
});