define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Pool     = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });


    /**
     * 
     */
    var ElectricForceLaw = Backbone.Model.extend({

        defaults: {
            field: null
        },

        /**
         * Initializes new ElectricForceLaw object.
         */
        initialize: function(attributes, options) {
            this.set('field', vectorPool.create().set(this.get('field')));
        },

        translateField: function(x, y) {
            var oldField = this.get('field');
            var newField = vectorPool.create().set(this.get('field'));

            if (x instanceof Vector2)
                this.set('field', newField.add(x));
            else
                this.set('field', newField.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldField);
        },

        setField: function(x, y) {
            var oldField = this.get('field');
            
            if (x instanceof Vector2)
                this.set('field', vectorPool.create().set(x));
            else
                this.set('field', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldField);
        },

        /**
         * We need to make sure we release the model's vectors
         *   back into the vector pool or we get memory leaks,
         *   so destroy must be called on all ElectricForceLaw objects.
         */
        destroy: function(options) {
            this.trigger('destroy', this, this.collection, options);
            vectorPool.remove(this.get('field'));
        }

    });

    return ElectricForceLaw;
});
