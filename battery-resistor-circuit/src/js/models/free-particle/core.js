define(function (require) {

    'use strict';

    var _    = require('underscore');
    var Pool = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var FreeParticle = require('models/free-particle');

    /**
     * 
     */
    var Core = FreeParticle.extend({

        defaults: _.extend({}, FreeParticle.prototype.defaults, {
            origin: null,
            scalarPosition: 1,
            propagator: null
        }),

        initialize: function(attributes, options) {
            FreeParticle.prototype.initialize.apply(this, arguments);

            this.set('origin', vectorPool.create().set(this.get('origin')));
        },

        setOrigin: function(x, y) {
            var oldOrigin = this.get('origin');
            
            if (x instanceof Vector2)
                this.set('origin', vectorPool.create().set(x));
            else
                this.set('origin', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldOrigin);
        },

        /**
         * We need to make sure we release the model's vectors
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all positionable
         *   objects when we're done with them.
         */
        destroy: function(options) {
            this.trigger('destroy', this, this.collection, options);
            vectorPool.remove(this.get('origin'));
        }

    });

    return Core;
});
