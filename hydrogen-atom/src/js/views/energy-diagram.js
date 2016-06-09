define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var WavelengthColors   = require('common/colors/wavelength');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var Constants = require('constants');

    /**
     * 
     */
    var EnergyDiagramView = Backbone.View.extend({

        className: 'energy-diagram-view',

        initialize: function(options) {
            // Default values
            options = _.extend({
                width: 150,
                height: 290,
                paddingLeft:   26,
                paddingRight:  10,
                paddingTop:    10,
                paddingBottom: 10,

                numberOfStates: 0,

                levelFontSize: 10,
                levelColor: '#000',

                axisLabelFontSize: 14,
                axisColor: '#000',
                axisLineWidth: 2
            }, options);

            this.simulation = options.simulation;

            this.elementWidth = options.width;
            this.elementHeight = options.height;

            var resolution = this.getResolution();
            this.width  = options.width  * resolution;
            this.height = options.height * resolution;
            this.paddingLeft   = options.paddingLeft * resolution;
            this.paddingRight  = options.paddingRight * resolution;
            this.paddingTop    = options.paddingTop * resolution;
            this.paddingBottom = options.paddingBottom * resolution;
            
            var suffix = 'px Helvetica Neue';
            this.levelFont = options.levelFontSize * resolution + suffix;
            this.levelColor = options.levelColor;
            this.axisLabelFont = options.axisLabelFontSize * resolution + suffix;
            this.axisColor = options.axisColor;
            this.axisLineWidth = options.axisLineWidth * resolution;

            // Squiggle-drawing numbers
            this.minSquiggleLength        = EnergyDiagramView.MIN_SQUIGGLE_LENGTH;
            this.squiggleAmplitude        = EnergyDiagramView.SQUIGGLE_AMPLITUDE;
            this.squiggleLineWidth        = EnergyDiagramView.SQUIGGLE_LINE_WIDTH;
            this.squiggleArrowHeadWidth   = EnergyDiagramView.SQUIGGLE_ARROW_HEAD_WIDTH;
            this.squiggleArrowheadHeight  = EnergyDiagramView.SQUIGGLE_ARROW_HEAD_HEIGHT;
            this.uvSquigglePeriod         = EnergyDiagramView.UV_SQUIGGLE_PERIOD;
            this.minVisibleSquigglePeriod = EnergyDiagramView.MIN_VISIBLE_SQUIGGLE_PERIOD;
            this.maxVisibleSquigglePeriod = EnergyDiagramView.MAX_VISIBLE_SQUIGGLE_PERIOD;
            this.irSquigglePeriod         = EnergyDiagramView.IR_SQUIGGLE_PERIOD;

            // Calculate energies
            this._energies = this.calculateEnergies(options.numberOfStates);
        },

        initElectronImage: function() {
            var mvt = ModelViewTransform.createScaleMapping(22);
            var electronDisplayObject = ParticleGraphicsGenerator.generateElectron(mvt);
            var canvas = PixiToImage.displayObjectToCanvas(electronDisplayObject, 1);
            this.electronImage = canvas;
        },

        setWidth: function(width) {
            this.elementWidth = width;
            this.width  = width * this.getResolution();
        },

        setHeight: function(height) {
            this.elementHeight = height;
            this.height = height * this.getResolution();
        },

        setAtom: function(atom) {
            this.clearAtom();

            this.atom = atom;
        },

        clearAtom: function() {
            if (this.atom)
                this.stopListening(this.atom);
            this.atom = null;
        },

        /**
         * Renders the view
         */
        render: function() {
            this.canvas = document.createElement('canvas');

            this.$el.append(this.canvas);

            return this;
        },

        /**
         * Sizes the canvas and initializes the canvas context
         */
        postRender: function() {
            // Give the canvas its dimensions
            this.canvas.style.width = this.elementWidth + 'px';
            this.canvas.style.height = this.elementHeight + 'px';
            this.canvas.width = this.width;
            this.canvas.height = this.height;

            // Get the canvas context
            this.ctx = this.canvas.getContext('2d');

            // Create the electron image
            this.initElectronImage();

            this.draw();

            return this;
        },

        /**
         * Updates the graph
         */
        update: function(time, deltaTime, paused) {},

        /**
         * Draws the graph
         */
        draw: function() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            this.drawEmptyGraph();
            this.drawData();
        },

        drawEmptyGraph: function() {
            var ctx = this.ctx;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;
            var resolution = this.getResolution();

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, this.width, this.height);

            var headWidth  = 10 * resolution;
            var headLength = 12 * resolution;

            // Draw axis line
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, originY - height + headLength);

            ctx.lineWidth = this.axisLineWidth;
            ctx.strokeStyle = this.axisColor;
            ctx.stroke();

            // Draw arrow on axis line
            ctx.beginPath();
            ctx.moveTo(originX - headWidth / 2, originY - height + headLength);
            ctx.lineTo(originX, originY - height);
            ctx.lineTo(originX + headWidth / 2, originY - height + headLength);
            ctx.closePath();
            ctx.fillStyle = this.axisColor;
            ctx.fill();

            // Draw axis label
            ctx.fillStyle = this.axisColor;
            ctx.font = this.axisLabelFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Energy (eV)', -originY, originX - 3 * resolution);
            ctx.rotate(Math.PI / 2);
        },

        drawData: function() {},

        drawSquiggle: function(ctx, x1, y1, x2, y2, wavelength) {

        },

        drawElectron: function(ctx, x, y) {
            ctx.drawImage(this.electronImage, x - this.electronImage.width / 2, y - this.electronImage.height / 2);
        },

        show: function() {
            this.$el.show();
            this._hidden = false;
        },

        hide: function() {
            this.$el.hide();
            this._hidden = true;
        },

        getGraphWidth: function() {
            return this.width - this.paddingLeft - this.paddingRight;
        },

        getGraphHeight: function() {
            return this.height - this.paddingTop - this.paddingBottom;
        },

        getResolution: function() {
            return window.devicePixelRatio ? window.devicePixelRatio : 1;
        },

        /**
         * Gets the energy value for a specified state.
         */
        getEnergy: function(state) {
            return this._energies[state - 1];
        },
        
        /**
         * Calculates the energy values for a specified number of states.
         *   Optional distortion is applied to increase the space between
         *   energy values so that they don't overlap when displayed.
         */
        calculateEnergies: function(numberOfStates) {
            var i;

            // Calculate energies
            var E = [];
            for (i = 0; i < numberOfStates; i++) {
                var n = i + 1;
                E[i] = E1 / (n * n);
            }

            // Apply distortion
            if (EnergyDiagramView.DISTORTION_FACTOR > 0) {
                for (i = 1; i < numberOfStates - 1; i++ ) {
                    E[i] = E[i] * (1 + EnergyDiagramView.DISTORTION_FACTOR);
                }
            }

            return E;
        }

    }, Constants.EnergyDiagramView);


    return EnergyDiagramView;
});
