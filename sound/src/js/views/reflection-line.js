
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/v3/colors/colors');
    var Vector2  = require('common/v3/math/vector2');
    var Rectangle = require('common/v3/math/rectangle');

    var Constants = require('constants');
    var DEG_TO_RAD = Math.PI / 180;

    /**
     * A view that draws a line of reflection
     */
    var ReflectionLine = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                position: {
                    x: 200,
                    y: 400
                },
                length: 400,
                thickness: 6,
                color: '#21366b',
                angle: 45
            }, options);

            this.displayObject.x = options.position.x;
            this.displayObject.y = options.position.y;

            this.length = options.length;
            this.thickness = options.thickness;
            this.color = Colors.parseHex(options.color);

            this._midpoint = new Vector2();

            this.initGraphics();

            // Set default angle
            this.setAngle(options.angle);
        },

        initGraphics: function() {
            this.line = new PIXI.Graphics();

            this.displayObject.addChild(this.line);

            this.drawLine();
        },

        drawLine: function(){
            this.line.clear();

            // Draw a line going horizontally to the right.
            this.line.lineStyle(this.thickness, this.color, 1);
            this.line.moveTo(0, 0);
            this.line.lineTo(this.length, 0);
        },

        setX: function(x) {
            this.displayObject.x = x;
        },

        setAngle: function(degrees) {
            this.displayObject.rotation = -degrees * DEG_TO_RAD;
        },

        getMidPoint: function() {
            return this._midpoint.set(
                this.displayObject.x + Math.cos(this.displayObject.rotation) * this.length / 2,
                this.displayObject.y + Math.sin(this.displayObject.rotation) * this.length / 2
            );
        },

        getAngle: function() {
            return this.displayObject.rotation;
        },

        paintLeftSideMask: function(graphics, minX, stageWidth, stageHeight) {
            var topPointX = this.displayObject.x + Math.cos(this.displayObject.rotation) * this.length;
            var topPointY = this.displayObject.y + Math.sin(this.displayObject.rotation) * this.length;
            // graphics.clear();
            // graphics.beginFill(0x000000, 1);
            // graphics.moveTo(minX, 0);
            // graphics.lineTo(minX, stageHeight);
            // graphics.lineTo(this.displayObject.x, this.displayObject.y);
            // graphics.lineTo(topPointX, topPointY);
            // graphics.lineTo(topPointX, -20);
            // graphics.endFill();
        }

    });

    return ReflectionLine;
});
