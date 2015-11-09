define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var Colors = require('common/colors/colors');

    var Constants = require('constants');
    var NORTH_COLOR = Colors.parseHex(Constants.NORTH_COLOR);
    var SOUTH_COLOR = Colors.parseHex(Constants.SOUTH_COLOR);

    var graphics = new PIXI.Graphics();
    var cache = {};

    var CompassNeedleTexture = {

        /**
         * Creates a new compass needle texture with the specified width and returns it.
         */
        create: function(width) {
            width = Math.round(width);

            // If we've already drawn a texture this size, return that instead
            if (cache[width] !== undefined)
                return cache[width];

            // Draw a new one
            var height = Math.round((15 / 55) * width);
            var halfHeight = height / 2;
            var halfWidth = width / 2;

            graphics.clear();

            graphics.beginFill(NORTH_COLOR, 1);
            graphics.moveTo(0, halfHeight);
            graphics.lineTo(halfWidth, 0);
            graphics.lineTo(0, -halfHeight);
            graphics.endFill();

            graphics.beginFill(SOUTH_COLOR, 1);
            graphics.moveTo(0, halfHeight);
            graphics.lineTo(-halfWidth, 0);
            graphics.lineTo(0, -halfHeight);
            graphics.endFill();

            var texture = graphics.generateTexture();
            cache[width] = texture;

            return texture;
        },

        /**
         * Removes the specified texture from the texture cache.  Returns true
         *   if the texture was found and removed from the cache.
         */
        remove: function(texture) {
            for (var key in cache) {
                if (cache[key] === texture) {
                    delete cache[key];
                    return true;
                }
            }

            return false;
        }

    };

    return CompassNeedleTexture;
});