define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/extensions');
    var AppView        = require('common/v3/app/app');
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var NucleusDecayChart = PixiView.extend({

        height: 120,
        paddingLeft: 200, // Number of pixels on the left before the chart starts

        events: {
            
        },

        /**
         * Initializes the new NucleusDecayChart.
         */
        initialize: function(options) {
            this.simulation = options.simulation;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            if (AppView.windowIsShort()) {
                this.displayObject.x = 12;
                this.displayObject.y = 12;
            }
            else {
                this.displayObject.x = 20;
                this.displayObject.y = 20;
            }

            this.initMVT();
            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initHalfLifeBar();
        },

        initMVT: function() {
            // Creates an MVT that will scale the nucleus graphics
        },

        initPanel: function() {
            // Calculate the width from the space left between the other panels
            if (AppView.windowIsShort())
                this.width = $('.scene-view').width() - $('.sim-controls-left').outerWidth() - $('.sim-controls-right').outerWidth() - 12 * 4;
            else
                this.width = $('.scene-view').width() - $('.sim-controls-left').outerWidth() - 20 * 3;

            // Draw the shadow
            var outline = new PiecewiseCurve()
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
            shadow.alpha = 0.25;
            this.displayObject.addChild(shadow);

            // Figure out the background color
            // var rgba = Colors.parseRgba($('.sim-controls').css('background-color'));
            // var hex = Colors.rgbToHexInteger(rgba.r, rgba.g, rgba.b);
            var hex = 0xFF9797;
            var alpha = 1;//rgba.a;

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(hex, alpha);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initXAxis: function() {

        },

        initYAxis: function() {

        },

        initHalfLifeBar: function() {

        }

    });


    return NucleusDecayChart;
});