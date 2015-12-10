define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Branch   = require('models/branch');
    var Junction = require('models/junction');

    /**
     * The base model for all circuit components
     */
    var CircuitComponent = Branch.extend({

        defaults: _.extend({}, Branch.prototype.defaults, {
            length: 1,
            height: 0
        }),

        initialize: function(attributes, options) {
            if (options && options.start !== undefined && options.direction !== undefined) {
                if (!attributes.startJunction) {
                    this.set('startJunction', new Junction({
                        position: options.start
                    }));
                }
                if (!attributes.endJunction) {
                    this.set('endJunction', new Junction({
                        position: new Vector2(options.direction)
                            .normalize()
                            .scale(this.get('length'))
                            .add(options.start)
                    }));
                }
            }

            Branch.prototype.initialize.apply(this, [attributes, options]);
        },

        getLength: function() {
            return this.get('length');
        },

        getComponentLength: function() {
            return this.getLength();
        },

        getShape: function() {
            throw 'Not yet implemented.';
        }

    });

    return CircuitComponent;
});