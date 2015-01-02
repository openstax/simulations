define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PositionableView = require('views/positionable');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var WaterDropView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            PositionableView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            var width  = this.mvt.modelToViewDeltaX(this.model.get('width'));
            var height = -this.mvt.modelToViewDeltaY(this.model.get('height'));
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0x4466FF, 1); //Constants.WATER_FILL_COLOR
            graphics.drawRect(-width / 2, -height / 2, width, height);
            graphics.endFill();
            this.displayObject.addChild(graphics);
        }

    });

    return WaterDropView;
});