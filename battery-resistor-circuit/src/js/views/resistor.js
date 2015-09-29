define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView     = require('common/v3/pixi/view');
    var Colors       = require('common/colors/colors');
    var NumberSeries = require('common/math/number-series');
    var clamp        = require('common/math/clamp');

    var CoresView = require('views/cores');

    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var ResistorView = PixiView.extend({

        /**
         * Initializes the new ResistorView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.modelLeftX  = this.simulation.resistorLeft;
            this.modelRightX = this.simulation.resistorRight;
            this.modelY      = this.simulation.resistorY;
            this.maxPower = ResistorView.MAX_POWER;

            this.outlineColor = Colors.parseHex(ResistorView.OUTLINE_COLOR);
            this._rgba = {};

            this.initGraphics();

            this.listenTo(this.simulation, 'change:voltage change:coreCount', this.update);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.background = new PIXI.Graphics();
            this.outline = new PIXI.Graphics();

            this.graphicsLayer = new PIXI.Container();
            this.graphicsLayer.addChild(this.background);
            this.graphicsLayer.addChild(this.outline);
            this.displayObject.addChild(this.graphicsLayer);

            this.initSpectrum();
            this.initCores();

            this.updateMVT(this.mvt);
        },

        initSpectrum: function() {
            // Get the spectrum image and draw it to a hidden canvas so we can
            //   pull pixel data from it to determine the resistor's color.
            var spectrumTexture = Assets.Texture(Assets.Images.SPECTRUM);
            var spectrumImage = spectrumTexture.baseTexture.source;
            var canvas = document.createElement('canvas');
            canvas.width  = spectrumTexture.width;
            canvas.height = spectrumTexture.height;
            this.spectrumContext = canvas.getContext('2d');
            this.spectrumContext.drawImage(spectrumImage, 0, 0, spectrumTexture.width, spectrumTexture.height);
            this.spectrumWidth = spectrumTexture.width;

            this.ratioSamples = new NumberSeries(ResistorView.NUM_RATIO_SAMPLES);
            this.numSame = 0;
        },

        initCores: function() {
            this.coresView = new CoresView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.displayObject.addChild(this.coresView.displayObject);
        },

        drawBackground: function() {
            var graphics = this.background;
            graphics.clear();
            graphics.beginFill(this.color, 1);
            graphics.drawRect(0, -this.height / 2, this.width, this.height);
            graphics.endFill();

            var cw = ResistorView.CHANNEL_WIDTH;
            graphics.beginFill(this.channelColor, 1);
            graphics.drawRect(0, -cw / 2, this.width, cw);
            graphics.endFill();
        },

        drawOutline: function() {
            var cw = ResistorView.CHANNEL_WIDTH;
            var m  = ResistorView.OUTLINE_WIDTH / 2;

            var graphics = this.outline;
            graphics.clear();

            graphics.lineStyle(ResistorView.OUTLINE_WIDTH, this.outlineColor, 1);
            graphics.moveTo(m,              -cw / 2);
            graphics.lineTo(m,              -this.height / 2 + m);
            graphics.lineTo(this.width - m, -this.height / 2 + m);
            graphics.lineTo(this.width - m, -cw / 2);

            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;

            graphics.moveTo(m,              cw / 2);
            graphics.lineTo(m,              this.height / 2 - m);
            graphics.lineTo(this.width - m, this.height / 2 - m);
            graphics.lineTo(this.width - m, cw / 2);

            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
        },

        /**
         * Returns the resistor color for the given power ratio.
         */
        getColor: function(ratio) {
            // Make sure the ratio stays between 0 and 1
            ratio = clamp(0, ratio, 1);
            
            // Use a normalized ratio instead of the raw ratio
            this.ratioSamples.add(ratio);
            ratio = this.ratioSamples.average();

            var x = clamp(0, parseInt(this.spectrumWidth * ratio), this.spectrumWidth - 1);
            
            var color = this.spectrumContext.getImageData(x, 0, 1, 1).data;
            this._rgba.r = color[0];
            this._rgba.g = color[1];
            this._rgba.b = color[2];
            //var hexInt = Colors.rgbToHexInteger(color[0], color[1], color[2]);

            var average = ratio;
            if (this.lastAverage === average)
                this.numSame++;
            else
                this.numSame = 0;
            this.lastAverage = average;

            this.trigger('powerChanged', average);

            return this._rgba;
        },

        isChanging: function() {
            return this.numSame < this.ratioSamples.length();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateDimensions();
            this.updateColor();

            this.drawBackground();
            this.drawOutline();

            this.coresView.updateMVT(mvt);
        },

        updateDimensions: function() {
            this.width  = Math.round(this.mvt.modelToViewDeltaX(this.modelRightX - this.modelLeftX));
            this.height = Math.round(this.mvt.modelToViewDeltaY(ResistorView.MODEL_HEIGHT));
            this.graphicsLayer.x = Math.round(this.mvt.modelToViewX(this.modelLeftX));
            this.graphicsLayer.y = Math.round(this.mvt.modelToViewY(this.modelY));
        },

        updateColor: function() {
            var r = this.simulation.get('coreCount');
            var v = this.simulation.get('voltage');
            var power = v * v / r;
            var powerRatio = power / this.maxPower;
            var rgba = this.getColor(powerRatio);
            this.color = Colors.rgbToHexInteger(rgba.r, rgba.g, rgba.b);
            this.channelColor = Colors.rgbToHexInteger(Colors.darkenRgba(rgba, 0.15));
        },

        update: function() {
            this.updateColor();
            this.drawBackground();
        }

    }, Constants.ResistorView);


    return ResistorView;
});