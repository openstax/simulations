define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a capacitor
     */
    var CapacitorView = RectangularComponentView.extend({

        imagePath:     Assets.Images.CAPACITOR,
        maskImagePath: Assets.Images.CAPACITOR_MASK,

        schematicImagePath:     Assets.Images.SCHEMATIC_CAPACITOR,
        schematicMaskImagePath: Assets.Images.SCHEMATIC_CAPACITOR_MASK,

        /**
         * Initializes the new CapacitorView.
         */
        initialize: function(options) {
            RectangularComponentView.prototype.initialize.apply(this, [options]);
        },

    });

    return CapacitorView;
});