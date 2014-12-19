define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');
    var Pool    = require('object-pool');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    /**
     * This is needed by classes in both tabs.  It just provides some
     *   helper functions for changing a position vector in a way that
     *   leverages Backbone's event system.
     */
    var Positionable = Backbone.Model.extend({

        defaults: {
            position: null
        },
        
        initialize: function(attributes, options) {
            // Create vectors
            this.set('position', vectorPool.create().set(this.get('position')));
        },

        setX: function(x) {
            this.setPosition(x, this.get('position').y);
        },

        setY: function(y) {
            this.setPosition(this.get('position').x, y);
        },

        translate: function(x, y) {
            var oldPosition = this.get('position');
            var newPosition = vectorPool.create().set(this.get('position'));

            if (x instanceof Vector2)
                this.set('position', newPosition.add(x));
            else
                this.set('position', newPosition.add(x, y));
            
            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        },

        setPosition: function(x, y) {
            var oldPosition = this.get('position');
            
            if (x instanceof Vector2)
                this.set('position', vectorPool.create().set(x));
            else
                this.set('position', vectorPool.create().set(x, y));

            // Only remove it at the end or we might be given the same one
            vectorPool.remove(oldPosition);
        }

    });

    return Positionable;
});
