define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a resistor
     */
    var BatteryView = RectangularComponentView.extend({

        imagePath:     Assets.Images.BATTERY,
        maskImagePath: Assets.Images.BATTERY_MASK,

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

    });

    return BatteryView;
});