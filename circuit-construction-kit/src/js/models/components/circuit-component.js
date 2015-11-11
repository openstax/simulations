define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Branch   = require('models/branch');
    var Junction = require('models/junction');

    var Constants = require('constants');

    /**
     * The base model for all circuit components
     */
    var CircuitComponent = Branch.extend({

        defaults: _.extend({}, Branch.prototype.defaults, {
            length: 1,
            height: 0
        }),

        initialize: function(attributes, options) {
            options = _.extend({
                startJunction: new Junction({
                    position: options.start
                }),
                endJunction: new Junction({
                    position: new Vector2(options.direction)
                        .normalize()
                        .scale(this.get('length'))
                        .add(options.start)
                })
            }, options);

            Branch.prototype.initialize.apply(this, [attributes, options]);
        },

        getLength: function() {
            return this.get('length');
        },

        getShape: function() {
            throw 'Not yet implemented.';
        }

    });

    return CircuitComponent;
});