define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Colors      = require('common/colors/colors');

    var RectangularComponentView = require('views/components/rectangular');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A view that represents a resistor
     */
    var GrabBagResistorView = RectangularComponentView.extend({

        /**
         * Initializes the new GrabBagResistorView.
         */
        initialize: function(options) {
            this.imagePath     = this.model.get('grabBagItem').imagePath;
            this.maskImagePath = this.model.get('grabBagItem').imageMaskPath;

            RectangularComponentView.prototype.initialize.apply(this, [options]);
        }

    }, Constants.GrabBagResistorView);

    return GrabBagResistorView;
});