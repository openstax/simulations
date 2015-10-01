define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    /**
     * Creates a canvas and then calls the given drawing callback with its
     *   2D canvas context.  Any drawing that happens to the context needs
     *   to happen within that context.  It then creates a sprite out of
     *   that canvas and returns it with default anchors.
     */
    PIXI.Sprite.fromNewCanvasContext = function(width, height, contextDrawCallback) {
        var canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;

        contextDrawCallback(canvas.getContext('2d'));

        return new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
    };

    return PIXI;
});