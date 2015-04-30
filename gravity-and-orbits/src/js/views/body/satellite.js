define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var BodyView = require('views/body');

    var Assets = require('assets');

    /**
     * A view that represents a satellite.
     */
    var SatelliteView = BodyView.extend({

        /**
         * The space station is way to small to see even in friendly
         *   mode, so we need to blow the sprite way up.
         */
        getBodyScale: function(radius) {
            return BodyView.prototype.getBodyScale.apply(this, arguments) * 1000;
        }

    });

    return SatelliteView;
});