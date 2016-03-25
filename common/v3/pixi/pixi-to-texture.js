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

        displayObjectToTexture: function(displayObject, renderer) {
            wrapper.addChild(displayObject);

            graphics.clear();
            graphics.beginFill(0, 0);
            graphics.drawRect(0, 0, Math.ceil(wrapper.width), Math.ceil(wrapper.height));
            graphics.endFill();

            var bounds = wrapper.getBounds();
            graphics.x = bounds.x - (Math.ceil(wrapper.width) - wrapper.width) / 2;
            graphics.y = bounds.y - (Math.ceil(wrapper.height) - wrapper.height) / 2;

            var texture = stage.generateTexture(renderer);

            wrapper.removeChild(displayObject);

            return texture;
        },


    };


    return PixiToTexture;
});