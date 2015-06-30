define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');

    var Charge = require('models/charge');
    var ReservoirObjectView = require('views/reservoir-object');

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
                height: 100,
                thickness: 4,
                depth: 16,

                labelText: 'E-Field Sensors',
                labelFont: 'bold 12pt Helvetica Neue',
                labelColor: '#444',

                outlineColor: '#f0f0f0',
                outlineAlpha: 0.8,
                fillColor: '#fafafa', // Only used if showDepth is false
                fillAlpha: 0.6,       // Only used if showDepth is false
                insideColor: '#f2f2f2',
                insideAlpha: 0.8,
                bottomColor: '#f0f0f0',
                bottomAlpha: 0.6,

                showDepth: false
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;

            this.width = options.width;
            this.height = options.height;
            this.thickness = options.thickness;
            this.depth = options.depth;

            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
            this.labelColor = options.labelColor;

            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineAlpha = options.outlineAlpha;
            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;
            this.insideColor  = Colors.parseHex(options.insideColor);
            this.insideShadowColor = Colors.parseHex(Colors.darkenHex(options.insideColor, 0.12));
            this.insideAlpha  = options.insideAlpha;
            this.bottomColor  = Colors.parseHex(options.bottomColor);
            this.bottomAlpha  = options.bottomAlpha;

            this.showDepth = options.showDepth;

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
            var d = this.depth;

            // Draw outline
            bg.beginFill(this.outlineColor, this.outlineAlpha);
            bg.drawRect(0, 0, w, m);             // Top piece
            bg.drawRect(0, h - m, w, m);         // Bottom piece
            bg.drawRect(0, m, m, h - m - m);     // Left piece
            bg.drawRect(w - m, m, m, h - m - m); // Right piece
            bg.endFill();

            if (this.showDepth) {
                // Draw inside walls of the box
                // Top side (will be a little darker to simulate shadow)
                bg.beginFill(this.insideShadowColor, this.insideAlpha);
                bg.moveTo(m, m);
                bg.lineTo(w - m, m);
                bg.lineTo(w - m - d, m + d);
                bg.lineTo(m + d, m + d);
                bg.endFill();

                // Side sides
                bg.beginFill(this.insideColor, this.insideAlpha);
                bg.moveTo(w - m, m);
                bg.lineTo(w - m, h - m);
                bg.lineTo(w - m - d, h - m - d);
                bg.lineTo(w - m - d, m + d);
                bg.endFill();
                bg.beginFill(this.insideColor, this.insideAlpha);
                bg.moveTo(m, m);
                bg.lineTo(m + d, m + d);
                bg.lineTo(m + d, h - m - d);
                bg.lineTo(m, h - m);
                bg.endFill();

                // Bottom side (will be a bit less transparent to simulate light hiting it)
                bg.beginFill(this.insideColor, this.insideAlpha * 1.3);
                bg.moveTo(m, h - m);
                bg.lineTo(m + d, h - m - d);
                bg.lineTo(w - m - d, h - m - d);
                bg.lineTo(w - m, h - m);
                bg.endFill();

                // Draw bottom of the box
                bg.beginFill(this.bottomColor, this.bottomAlpha);
                bg.drawRect(m + d, m + d, w - m * 2 - d * 2, h - m * 2 - d * 2);
                bg.endFill();
            }
            else {
                // Fill in the center
                bg.beginFill(this.fillColor, this.fillAlpha);
                bg.drawRect(m, m, w - m * 2, h - m * 2);
                bg.endFill();
            }

            bg.buttonMode = true;

            // Add it to the display object
            this.displayObject.addChild(bg);
            this.background = bg;
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
            label.anchor.y = 0.45;
            label.x = this.width / 2;
            label.y = this.height / 2;

            this.displayObject.addChild(label);
        },

        drawDummyObjects: function() {

        },

        createDummyObject: function() {
            var model = new Charge();
            var view = new ReservoirObjectView({
                model: model,
                mvt: this.mvt
            });
            return view;
        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the model.
         */
        createObject: function(object) {
            var model = new Charge();
            var view = new ReservoirObjectView({
                model: model,
                mvt: this.mvt
            });
            return view;
        },

        destroyObject: function(object) {
            object.destroy();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawDummyObjects();
        },

        dragStart: function(data) {
            this.dragging = true;

            this.dummyObject = this.createObject();
            this.dummyLayer.addChild(this.dummyObject.displayObject);
        },

        drag: function(data) {
            if (this.dragging) {
                this.dummyObject.setPosition(
                    data.global.x,
                    data.global.y
                );
            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            if (this.dummyObject) {
                this.dummyObject.removeFrom(this.dummyLayer);
                this.dummyObject.model.destroy();
                this.dummyObject = null;

                // if (not within the bounds of this reservoir)
                // Create a real object and add it to the sim
            }
        }

    });


    return ObjectReservoir;
});