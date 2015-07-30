
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');


    /**
     * A view that represents a movable target model
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
                    y: 30
                },
                width : 400,
                thickness : 2,
                buffer : 20,
                color : '#333',
                opacity : 0.75,
                dashWidth : 8,
                yOnly : true
            }, options);

            this.position = options.position;
            this.yOnly = options.yOnly;

            this.width = options.width;
            this.thickness = options.thickness;
            this.color = options.color;
            this.opacity = options.opacity;
            this.buffer = options.buffer;
            this.dashWidth = options.dashWidth;

            this.initGraphics();
        },

        render: function(){
            this.drawLine();
        },

        postRender: function(){
            this.updatePosition();
        },

        initGraphics: function() {
            this.referenceLine = new PIXI.Graphics();
            this.referenceLine.clear();

            this.displayObject.addChild(this.referenceLine);
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = this.yOnly? 'ns-resize': 'move';
        },

        drawLine: function(){
            this.drawDraggableZone();
            this.drawDashedLine();
        },

        drawDraggableZone: function(){
            this.referenceLine.hitArea = new PIXI.Rectangle(0, -1 * (this.buffer + this.thickness/2), this.width, 2 * this.buffer + this.thickness);
        },

        drawDashedLine: function(){

            var lineTo = 0;
            var dashWidth;

            this.referenceLine.lineStyle(this.thickness, Colors.parseHex(this.color), this.opacity);

            while(lineTo < this.width){

                dashWidth = Math.min(this.dashWidth, this.width - lineTo);

                this.referenceLine.moveTo(lineTo, 0);
                this.referenceLine.lineTo(lineTo + dashWidth, 0);

                lineTo += 2 * this.dashWidth;
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

            if(this.grabbed){
                var dx = event.data.global.x - this.dragOffset.x;
                var dy = event.data.global.y - this.dragOffset.y;

                if(!this.yOnly){
                    this.position.x = dx;                    
                }
                this.position.y = dy;
                this.updateOnNextFrame = true;
            }
        },

        updatePosition: function(){
            this.displayObject.x = this.position.x;
            this.displayObject.y = this.position.y;
        },

        update: function(time, delta, paused, timeScale) {

            // If there aren't any changes, don't do anything.
            if (!this.updateOnNextFrame)
                return;

            this.updateOnNextFrame = false;
            this.updatePosition();
        }

    });

    return ReferenceLine;
});
