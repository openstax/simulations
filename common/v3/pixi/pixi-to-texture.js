define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    /*
     * Canvas initialization
     */
    var stage = new PIXI.Container();
    var wrapper = new PIXI.Container();
    var graphics = new PIXI.Graphics();

    stage.addChild(wrapper);
    stage.addChild(graphics);

    /**
     * Static functions
     */
    var PixiToTexture = {

        displayObjectToTexture: function(displayObject, renderer, padding) {
            // var wrapper = this._wrapDisplayObject(displayObject, padding);
            // stage.addChild(wrapper);

            // var resolution = window.devicePixelRatio ? window.devicePixelRatio : 1;
            // var renderTexture = new PIXI.RenderTexture(
            //     renderer, 
            //     displayObject.width  + padding * 2,
            //     displayObject.height + padding * 2,
            //     null, 
            //     resolution
            // );

            // renderTexture.render(stage);

            // // Set the displayObject loose again
            // wrapper.removeChild(displayObject);
            // stage.removeChild(wrapper);

            // return renderTexture;


            // if (padding === undefined)
            //     padding = 0;

            // renderer.resize(
            //     displayObject.width  + padding * 2,
            //     displayObject.height + padding * 2
            // );

            // return displayObject.generateTexture(renderer);

            if (padding === undefined)
                padding = 0;

            // Wrap the display object in a container so we can 
            //   move it and fit it in the canvas.
            // var bounds = displayObject.getBounds();
            // var xShift = 0 - bounds.x * displayObject.scale.x + padding;
            // var yShift = 0 - bounds.y * displayObject.scale.y + padding;
            // wrapper.x = xShift;
            // wrapper.y = yShift;
            // wrapper.addChild(displayObject);
            // wrapper.x = padding;
            // wrapper.y = padding;
            wrapper.addChild(displayObject);

            graphics.clear();
            graphics.beginFill(0, 0);
            graphics.drawRect(0, 0, displayObject.width + padding * 2, displayObject.height + padding * 2);
            graphics.endFill();

            var texture = wrapper.generateTexture(renderer);

            wrapper.removeChild(displayObject);

            return texture;
        },


    };


    return PixiToTexture;
});