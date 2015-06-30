define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A visual representation of some kind of object supply.  The
     *   user creates new objects with this view.  Dragging from 
     *   the view creates a new object and places it in the scene,
     *   while dragging an existing object back onto this view
     *   destroys it.
     */
    var ObjectReservoir = PixiView.extend({

        events: {
            'touchstart      .background': 'dragStart',
            'mousedown       .background': 'dragStart',
            'touchmove       .background': 'drag',
            'mousemove       .background': 'drag',
            'touchend        .background': 'dragEnd',
            'mouseup         .background': 'dragEnd',
            'touchendoutside .background': 'dragEnd',
            'mouseupoutside  .background': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({
                width: 179,
                height: 110,
                thickness: 4,
                depth: 16,

                labelText: 'E-Field Sensors',

                outlineColor: '#f0f0f0',
                outlineAlpha: 0.8,
                insideColor: '#f2f2f2',
                insideAlpha: 0.8,
                bottomColor: '#f0f0f0',
                bottomAlpha: 0.5
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.width = options.width;
            this.height = options.height;
            this.thickness = options.thickness;
            this.depth = options.depth;

            this.labelText = options.labelText;

            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineAlpha = options.outlineAlpha;
            this.insideColor  = Colors.parseHex(options.insideColor);
            this.insideAlpha  = options.insideAlpha;
            this.bottomColor  = Colors.parseHex(options.bottomColor);
            this.bottomAlpha  = options.bottomAlpha;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBackground();
            this.initLabel();
            this.initDummyObjects();

            this.updateMVT(this.mvt);
        },

        initBackground: function() {
            var bg = new PIXI.Graphics();
            var w = this.width;
            var h = this.height;
            var m = this.thickness;

            // Draw outline
            bg.beginFill(this.outlineColor, this.outlineAlpha);
            bg.drawRect(0, 0, w, m);             // Top piece
            bg.drawRect(0, h - m, w, m);         // Bottom piece
            bg.drawRect(0, m, m, h - m - m);     // Left piece
            bg.drawRect(w - m, m, m, h - m - m); // Right piece
            bg.endFill();

            this.background = bg;
            this.displayObject.addChild(bg);
        },

        initDummyObjects: function() {

        },

        initLabel: function() {
            var textSettings = {
                font: this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.anchor.x = 0.5;
            label.anchor.y = 0.6;
            label.x = this.bodyLabelOffsetX;
            label.y = this.bodyLabelOffsetY;

            this.displayObject.addChild(label);
        },

        drawDummyObjects: function() {

        },

        createDummyObject: function() {

        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the model.
         */
        createObject: function(object) {

        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawDummyObjects();
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        }

    });


    return ObjectReservoir;
});