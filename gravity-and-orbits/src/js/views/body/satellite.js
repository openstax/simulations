define(function(require) {

    'use strict';

    var BodyView = require('views/body');

    /**
     * A view that represents a satellite.
     */
    var SatelliteView = BodyView.extend({

        /**
         * The space station is way to small to see even in friendly
         *   mode, so we need to blow the sprite way up.
         */
        getBodyScale: function(radius) {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(radius * 2); // In pixels
            return ((targetSpriteWidth / this.body.width) / this.textureBodyWidthRatio) * 1000;
        }

    });

    return SatelliteView;
});