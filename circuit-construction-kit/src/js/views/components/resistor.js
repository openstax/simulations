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
    var ResistorView = RectangularComponentView.extend({

        imagePath:     Assets.Images.RESISTOR,
        maskImagePath: Assets.Images.RESISTOR_MASK,

        /**
         * Initializes the new ResistorView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

    });

    return ResistorView;
});