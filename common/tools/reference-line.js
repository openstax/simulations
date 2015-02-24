
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
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',
        },

        initialize: function(options) {
            options = _.extend({
                position: {
                    x: 30,
                    y: 30
                },
                width : 400,
                thickness : 2,
                buffer : 15,
                color : '#333',
                opacity : 0.75,
                dashWidth : 10,
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
            this.body = new PIXI.Graphics();
            this.displayObject.addChild(this.body);
            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = this.yOnly? 'ns-resize': 'move';
        },

        drawLine: function(){
            this.drawDraggableZone();
            this.drawDashedLine();
        },

        drawDraggableZone: function(){
            this.body.beginFill(Colors.parseHex(this.color), 0);
            this.body.drawRect(0, -1 * (this.buffer + this.thickness/2), this.width, 2 * this.buffer + this.thickness);
            this.body.endFill();
        },

        drawDashedLine: function(){

            var lineTo = 0;
            this.body.lineStyle(this.thickness, Colors.parseHex(this.color), this.opacity);

            while(lineTo + this.dashWidth < this.width){
                this.body.moveTo(lineTo, 0);
                this.body.lineTo(lineTo + this.dashWidth, 0);

                lineTo += 2 * this.dashWidth;
            }
        },

        dragStart: function(data){
            this.dragOffset = data.getLocalPosition(this.displayObject);
            this.grabbed = true;
        },

        dragEnd: function(data){
            this.grabbed = false;
        },

        drag: function(data){

            if(this.grabbed){
                var dx = data.global.x - this.dragOffset.x;
                var dy = data.global.y - this.dragOffset.y;

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
