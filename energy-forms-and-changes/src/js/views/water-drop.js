define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var Colors = require('common/colors/colors');

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
            graphics.beginFill(Colors.parseHex(Constants.WATER_FILL_COLOR), 1); //Constants.WATER_FILL_COLOR
            graphics.drawEllipse(0, 0, width / 2, height / 2);
            graphics.endFill();
            this.displayObject.addChild(graphics);
        },

        updatePosition: function(model, position) {
            var globalPoint = this.mvt.modelToViewDelta(position);
            this.displayObject.x = globalPoint.x;
            this.displayObject.y = globalPoint.y;
        },

    });

    return WaterDropView;
});