define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var PositionableObject = require('common/models/positionable-object');
    var Vector2            = require('common/math/vector2');

    var Constants = require('constants');

    var silent = { silent: true };

    /**
     * A junction in the circuit connecting two branches (like the nodes in a graph).
     */
    var Junction = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            selected: false,
            // Voltage relative to reference node. To be used in computing
            //   potential drops, to avoid graph traversal.
            voltage: 0
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            
        },

        translateSilent: function(x, y) {
            this.translate(x, y, silent);
        },

        getDistance: function(junction) {
            return this.get('position').distance(junction.get('position'));
        },

        getShape: function() {
            //return createCircle( CCKModel.JUNCTION_RADIUS * 1.1 );
            throw 'Not implemented.';
        }

    });

    return Junction;
});