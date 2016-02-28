define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var BoxlikeBody = require('common/mechanics/models/boxlike-body');

    /**
     * 
     */
    var Tube = BoxlikeBody.extend({

        defaults: _.extend({}, BoxlikeBody.prototype.defaults, {
            origin: new Vector2(),
            width: 0,
            height: 0
        }),

        /**
         * 
         */
        initialize: function(attributes, options) {
            this.set({
                position: this.get('origin'),
                corner1: this.get('origin'),
                corner2: new Vector2(
                    this.get('origin').x + this.get('width'), 
                    this.get('origin').y + this.get('height')
                )
            };

            BoxlikeBody.prototype.initialize.apply(this, [attributes, options]);

            // Set the initial bounds
            this.getBounds();

            this.on('change:height', this.heightChanged);
        },

        heightChanged: function(tube, height) {
            // Reposition the walls of the cavity
            var yMiddle = this.get('origin').y + this.previous('height') / 2;
            this.get('origin').set(
                this.get('origin').x, 
                yMiddle - height / 2
            );
            this.setBounds(this.getMinX(), this.get('origin').y - height / 2, this.get('width'), height);
            this.getBounds();
        }

    });

    return Tube;
});