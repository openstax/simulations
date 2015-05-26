define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    /*
     * Canvas initialization
     */
    var renderer = PIXI.autoDetectRenderer(200, 200, { transparent: true, antialias: true });
    var canvas = renderer.view;
    var stage = new PIXI.Stage(0x000000);

    /**
     * Static functions
     */
    var PixiToImage = {

        /**
         * Takes a Pixi DisplayObject, renders it to a canvas,
         *   and generates and returns an image data URI.
         */
        displayObjectToDataURI: function(displayObject) {
            // Resize the canvas to make sure it fits.
            renderer.resize(
                displayObject.width,
                displayObject.height
            );

            // Wrap the display object in a container so we can 
            //   move it and fit it in the canvas.
            var wrapper = new PIXI.DisplayObjectContainer();
            var bounds = displayObject.getBounds();
            var xShift = 0 - bounds.x;
            var yShift = 0 - bounds.y;
            wrapper.addChild(displayObject);
            wrapper.x = xShift;
            wrapper.y = yShift;
            stage.addChild(wrapper);

            // Render to the canvas
            renderer.render(stage);

            // Set the displayObject loose again
            wrapper.removeChild(displayObject);
            stage.removeChild(wrapper);

            // Return the image imprinted on the canvas
            return canvas.toDataURL('image/png');
        }

    };


    return PixiToImage;
});