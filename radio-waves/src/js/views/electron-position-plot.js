define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    /**
     * A view that represents an electron-position plot
     */
    var ElectronPositionPlot = PixiView.extend({

        width: 260,
        height: 140,
        margin: 15,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        /**
         * Initializes the new ElectronPositionPlot.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.electron = options.electron;
            this.titleText = options.title;

            this.panelColor = Colors.parseHex('#fff');

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initTitle();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var halfWidth = this.width / 2;

            // Draw the shadow
            var outline = new PiecewiseCurve();

            outline
                .moveTo(0, 0)
                .lineTo(this.width, 0)
                .lineTo(this.width, this.height)
                .lineTo(0, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.3;
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.panelColor, 0.78);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initTitle: function() {
            var m = this.margin;

            var settings = {
                font: '14px Helvetica Neue',
                fill: '#888'
            };

            var title = new PIXI.Text(this.titleText, settings);
            title.x = Math.round((this.width - title.width) / 2);
            title.y = 8;

            this.displayObject.addChild(title);

            // Y-Offsets for lines
            var y1 = 6;
            var y2 = 10;
            // Padding between words and line
            var p = m;

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0xC1C1C1, 1);

            // Lines on left side
            graphics.moveTo(title.x - p, title.y + y1);
            graphics.lineTo(m,           title.y + y1);
            graphics.moveTo(title.x - p, title.y + y2);
            graphics.lineTo(m,           title.y + y2);

            // Lines on right side
            graphics.moveTo(title.x + title.width + p, title.y + y1);
            graphics.lineTo(this.width - m,            title.y + y1);
            graphics.moveTo(title.x + title.width + p, title.y + y2);
            graphics.lineTo(this.width - m,            title.y + y2);

            this.displayObject.addChild(graphics);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return ElectronPositionPlot;
});