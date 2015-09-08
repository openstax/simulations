define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    /**
     * Clears a circle on a canvas context.
     *
     * From https://gist.github.com/getify/2926699
     */
    function clearCircle(ctx, x, y, radius) {
    	ctx.save();
    	ctx.beginPath();
    	ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    	ctx.clip();
    	ctx.clearRect(x-radius, y-radius, radius * 2, radius * 2);
    	ctx.restore();
    }

    var createReverseCircleMask = function(radius, width, height) {
    	var canvas = document.createElement('canvas');
    	canvas.width  = width;
    	canvas.height = height;

    	var ctx = canvas.getContext('2d');

    	ctx.fillStyle = '#000';
    	ctx.fillRect(0, 0, width, height);
    	clearCircle(ctx, width / 2, height / 2, radius);

    	var texture = PIXI.Texture.fromCanvas(canvas);
    	var sprite = new PIXI.Sprite(texture);
    	sprite.anchor.x = sprite.anchor.y = 0.5;

    	return sprite;
    };

    return createReverseCircleMask;
});