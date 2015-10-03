define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var AbstractCoil = require('models/coil');

    /**
     * SourceCoil is the model of the source coil used in an electromagnet
     */
    var SourceCoil = AbstractCoil.extend({

        initialize: function(attributes, options) {
            AbstractCoil.prototype.initialize.apply(this, arguments);

            // Pack the loops close together
            this.set('loopSpacing', this.get('wireWidth'));

            this.on('change:wireWidth', this.wireWidthChanged);
        },

        /**
         * If the wire width is changed, also change the loop spacing so
         *   that the loops remain packed close together.
         */
        wireWidthChanged: function(coil, wireWidth) {
            this.set('loopSpacing', wireWidth);
        }

    });

    return SourceCoil;
});
