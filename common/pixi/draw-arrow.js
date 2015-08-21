define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('../math/vector2');

    /**
     * Draws an arrow shape.
     */
    PIXI.Graphics.prototype.drawArrow = function(originX, originY, targetX, targetY, tailWidth, headWidth, headLength) {
        var i;

        // Set up all our necessary variables if they aren't already defined on
        //   on this graphics object.
        if (this._arrowPoints === undefined) {
            this._arrowPoints = [];
            for (var i = 0; i < 7; i++)
                this._arrowPoints.push(new Vector2());

            this._originVector = new Vector2();
            this._targetVector = new Vector2();
            this._direction    = new Vector2();
        }

        var points = this._arrowPoints;

        var origin = this._originVector.set(originX, originY);
        var target = this._targetVector.set(targetX, targetY);

        var angle  = this._direction.set(target).sub(origin).angle();
        var scale  = false;
        var length = origin.distance(target);

        // Define all the points as if it were pointing to the right
        if (length < headLength) {
            // We're going to find out what the scale should be to be
            //   able to render it correctly, blow up the length to
            //   draw it big, and then scale it back down.
            scale = length / (headLength + 4);
            length /= scale;

            console.log(scale, length, headLength)
        }
        
        points[0].set(length - headLength,  tailWidth / 2);
        points[1].set(0,                    tailWidth / 2);
        points[2].set(0,                   -tailWidth / 2);
        points[3].set(length - headLength, -tailWidth / 2);
        points[4].set(length - headLength, -headWidth / 2);
        points[5].set(length,               0);
        points[6].set(length - headLength,  headWidth / 2);

        // Rotate all the points so it points in the right direction
        for (i = 0; i < points.length; i++)
            points[i].rotate(angle);

        // Scale it down to the right size if we blew it up 
        if (scale !== false) {
            for (i = 0; i < points.length; i++)
                points[i].scale(scale);
        }

        // Translate all the points so it starts in the right place
        for (i = 0; i < points.length; i++)
            points[i].add(origin);

        // Draw the points
        this.moveTo(points[0].x, points[0].y);
        this.lineTo(points[1].x, points[1].y);
        this.lineTo(points[2].x, points[2].y);
        this.lineTo(points[3].x, points[3].y);
        this.lineTo(points[4].x, points[4].y);
        this.lineTo(points[5].x, points[5].y);
        this.lineTo(points[6].x, points[6].y);
        this.lineTo(points[0].x, points[0].y);
    };

    return PIXI;
});