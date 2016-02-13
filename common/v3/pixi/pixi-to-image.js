define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    /*
     * Canvas initialization
     */
    var renderer = PIXI.autoDetectRenderer(200, 200, { transparent: true, antialias: true });
    var canvas = renderer.view;
    var stage = new PIXI.Container();

    /**
     * Static functions
     */
    var PixiToImage = {

        /**
         * Takes a Pixi DisplayObject, renders it to a canvas,
         *   and generates and returns an image data URI.
         */
        displayObjectToDataURI: function(displayObject, padding) {
            var wrapper = this._wrapDisplayObject(displayObject, padding);
            stage.addChild(wrapper);

            // Render to the canvas
            renderer.render(stage);

            // Set the displayObject loose again
            wrapper.removeChild(displayObject);
            stage.removeChild(wrapper);

            // Return the image imprinted on the canvas
            return canvas.toDataURL('image/png');
        },

        displayObjectToTexture: function(displayObject, padding) {
            // var wrapper = this._wrapDisplayObject(displayObject, padding);
            // stage.addChild(wrapper);

            // var resolution = window.devicePixelRatio ? window.devicePixelRatio : 1;
            // var renderTexture = new PIXI.RenderTexture(renderer, renderer.width, renderer.height, null, resolution);

            // renderTexture.render(stage);

            // // Set the displayObject loose again
            // wrapper.removeChild(displayObject);
            // stage.removeChild(wrapper);

            // return renderTexture;
            if (padding === undefined)
                padding = 0;

            renderer.resize(
                displayObject.width  + padding * 2,
                displayObject.height + padding * 2
            );

            return displayObject.generateTexture(renderer);
        },

        _wrapDisplayObject: function(displayObject, padding) {
            if (padding === undefined)
                padding = 0;
            
            // Resize the canvas to make sure it fits.
            renderer.resize(
                displayObject.width + padding * 2,
                displayObject.height + padding * 2
            );

            // Wrap the display object in a container so we can 
            //   move it and fit it in the canvas.
            var wrapper = new PIXI.Container();
            var bounds = displayObject.getBounds();
            var xShift = 0 - bounds.x * displayObject.scale.x + padding;
            var yShift = 0 - bounds.y * displayObject.scale.y + padding;
            wrapper.addChild(displayObject);
            wrapper.x = xShift;
            wrapper.y = yShift;
            
            return wrapper;
        }

    };


    return PixiToImage;
});