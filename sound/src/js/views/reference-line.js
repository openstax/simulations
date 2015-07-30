
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/v3/colors/colors');
    // var Vector2  = require('common/v3/math/vector2');
    var Rectangle = require('common/v3/math/rectangle');


    /**
     * A view that draws a vertical line for the user to use as visual
     *   reference for measurements.
     */
    var ReferenceLine = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
        },

        initialize: function(options) {
            options = _.extend({
                position: {
                    x: 30,
                    y: 0
                },
                height: 400,
                thickness: 2,
                buffer: 12,
                color: '#333',
                opacity: 0.75,
                dashLength: 8
            }, options);

            this.displayObject.x = options.position.x;
            this.displayObject.y = options.position.y;

            this.height = options.height;
            this.thickness = options.thickness;
            this.color = options.color;
            this.opacity = options.opacity;
            this.buffer = options.buffer;
            this.dashLength = options.dashLength;

            this.initGraphics();
        },

        initGraphics: function() {
            this.referenceLine = new PIXI.Graphics();
            this.referenceLine.clear();

            this.displayObject.addChild(this.referenceLine);
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'ew-resize';

            this.drawLine();
            this.drawDraggableZone();
        },

        drawLine: function(){
            this.drawDraggableZone();
            this.drawDashedLine();
        },

        drawDraggableZone: function(){
            this.referenceLine.hitArea = new PIXI.Rectangle(-1 * (this.buffer + this.thickness/2), 0, 2 * this.buffer + this.thickness, this.height);
        },

        drawDashedLine: function(){
            var lineTo = 0;
            var dashLength;

            this.referenceLine.lineStyle(this.thickness, Colors.parseHex(this.color), this.opacity);

            while (lineTo < this.height){
                dashLength = Math.min(this.dashLength, this.height - lineTo);

                this.referenceLine.moveTo(0, lineTo);
                this.referenceLine.lineTo(0, lineTo + dashLength);

                lineTo += 2 * this.dashLength;
            }
        },

        dragStart: function(event){
            this.dragOffset = event.data.getLocalPosition(this.displayObject);
            this.grabbed = true;
        },

        dragEnd: function(event){
            this.grabbed = false;
        },

        drag: function(event){
            if (this.grabbed) {
                this.displayObject.x = event.data.global.x - this.dragOffset.x;                
            }
        }

    });

    return ReferenceLine;
});
