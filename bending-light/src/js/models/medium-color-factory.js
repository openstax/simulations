define(function (require) {

    'use strict';

    var Functions = require('common/math/functions');

    var Constants = require('constants');
    var MediumPropertiesPresets = require('medium-properties-presets');

    // Precompute to improve readability below
    var waterIndexForRed   = MediumPropertiesPresets.WATER.getIndexOfRefractionForRedLight();
    var glassIndexForRed   = MediumPropertiesPresets.GLASS.getIndexOfRefractionForRedLight();
    var diamondIndexForRed = MediumPropertiesPresets.DIAMOND.getIndexOfRefractionForRedLight();

    // Create linear functions
    var getWaterRatio   = Functions.createLinearFunction(1.0, waterIndexForRed, 0, 1);
    var getGlassRatio   = Functions.createLinearFunction(waterIndexForRed, glassIndexForRed, 0, 1);
    var getDiamondRatio = Functions.createLinearFunction(glassIndexForRed, diamondIndexForRed, 0, 1);

    // Base color values
    var AIR_COLOR     = { r: 255, g: 255, b: 255, a: 1 };
    var WATER_COLOR   = { r: 198, g: 226, b: 246, a: 1 };
    var GLASS_COLOR   = { r: 171, g: 169, b: 212, a: 1 };
    var DIAMOND_COLOR = { r:  78, g:  79, b: 164, a: 1 };

    /**
     * Make sure light doesn't go outside of the 0..255 bounds
     */
    function clamp(value) {
        if (value < 0)
            return 0;
        else if (value > 255)
            return 255;
        else
            return value;
    }

    /**
     * Blend colors a and b with the specified amount of "b" to use between 0 and 1
     */
    function colorBlend(a, b, ratio) {
        return {
            r: clamp(parseInt((a.r) * (1 - ratio) + (b.r) * ratio)),
            g: clamp(parseInt((a.g) * (1 - ratio) + (b.g) * ratio)),
            b: clamp(parseInt((a.b) * (1 - ratio) + (b.b) * ratio)),
            a: clamp(parseInt((a.a) * (1 - ratio) + (b.a) * ratio))
        };
    }

    var MediumColorFactory = {

        /**
         * Maps index of refraction to color using linear functions
         */
        getRgbaColor: function(indexForRed) {
            // Find out what region the index of refraction lies in, and linearly interpolate between adjacent medium colors
            if (indexForRed < waterIndexForRed) {
                var ratio = getWaterRatio(indexForRed);
                return colorBlend( AIR_COLOR, WATER_COLOR, ratio );
            }
            else {
                if ( indexForRed < glassIndexForRed ) {
                    var ratio = getGlassRatio(indexForRed);
                    return colorBlend(WATER_COLOR, GLASS_COLOR, ratio);
                }
                else {
                    if ( indexForRed < diamondIndexForRed ) {
                        var ratio = getDiamondRatio(indexForRed);
                        return colorBlend(GLASS_COLOR, DIAMOND_COLOR, ratio);
                    }
                    else {
                        return DIAMOND_COLOR;
                    }
                }
            }
        }

    };

    return MediumColorFactory;
});