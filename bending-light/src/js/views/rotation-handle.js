define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var RotationHandle = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
            'mouseover       .displayObject': 'hover',
            'mouseout        .displayObject': 'unhover'
        },

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                radius:  6,
                length: 16,
                lineWidth: 2
            }, options);

            this.radius = options.radius;
            this.length = options.length;
            this.lineWidth = options.lineWidth;

            this.idleColor  = Colors.parseHex('#81E4AA');
            this.idleAlpha  = 0.4;
            this.hoverColor = this.idleColor;
            this.hoverAlpha = 1;
            this.fillAlpha = 0.7;

            this.initGraphics();
        },

        initGraphics: function() {
            this.idleHandle  = this.createRotationHandle(this.idleColor,  this.idleAlpha);
            this.hoverHandle = this.createRotationHandle(this.hoverColor, this.hoverAlpha);

            this.unhover();

            this.displayObject.addChild(this.idleHandle);
            this.displayObject.addChild(this.hoverHandle);
        },

        createRotationHandle: function(color, alpha) {
            var handle = new PIXI.Graphics();

            handle.lineStyle(this.lineWidth, color, alpha);
            handle.moveTo(0, 0);
            handle.lineTo(this.length - this.radius, 0);
            handle.drawCircle(this.length, 0, this.radius);

            handle.beginFill(color, this.fillAlpha * alpha);
            handle.drawCircle(this.length, 0, this.radius);
            handle.endFill();

            return handle;
        },

        dragStart: function(event) {
            this.dragging = true;
        },

        dragEnd: function(event) {
            this.dragging = false;
            if (!this.hovering)
                this.unhover();
        },

        hover: function() {
            this.hovering = true;
            this.hoverHandle.visible = true;
            this.idleHandle.visible = false;
        },
        
        unhover: function() {
            this.hovering = false;
            if (!this.dragging) {
                this.idleHandle.visible = true;
                this.hoverHandle.visible = false;
            }
        },

    });

    return RotationHandle;
});