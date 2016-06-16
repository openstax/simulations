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
                width: 170,
                height: 290,
                paddingLeft:   22,
                paddingRight:  10,
                paddingTop:    10,
                paddingBottom: 2,

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
            this.minSquiggleLength        = EnergyDiagramView.MIN_SQUIGGLE_LENGTH * resolution;
            this.squiggleAmplitude        = EnergyDiagramView.SQUIGGLE_AMPLITUDE * resolution;
            this.squiggleLineWidth        = EnergyDiagramView.SQUIGGLE_LINE_WIDTH * resolution;
            this.squiggleArrowHeadWidth   = EnergyDiagramView.SQUIGGLE_ARROW_HEAD_WIDTH * resolution;
            this.squiggleArrowHeadHeight  = EnergyDiagramView.SQUIGGLE_ARROW_HEAD_HEIGHT * resolution;
            this.uvSquigglePeriod         = EnergyDiagramView.UV_SQUIGGLE_PERIOD * resolution;
            this.minVisibleSquigglePeriod = EnergyDiagramView.MIN_VISIBLE_SQUIGGLE_PERIOD * resolution;
            this.maxVisibleSquigglePeriod = EnergyDiagramView.MAX_VISIBLE_SQUIGGLE_PERIOD * resolution;
            this.irSquigglePeriod         = EnergyDiagramView.IR_SQUIGGLE_PERIOD * resolution;

            // State-line drawing numbers
            this.stateLineLength = EnergyDiagramView.STATE_LINE_LENGTH * resolution;
            this.stateLineWidth = EnergyDiagramView.STATE_LINE_WIDTH * resolution;
            this.stateLabelFont = 'bold ' + EnergyDiagramView.STATE_LABEL_FONT_SIZE * resolution + suffix;

            // Calculate energies
            this._energies = this.calculateEnergies(options.numberOfStates);
        },

        initElectronImage: function() {
            var mvt = ModelViewTransform.createScaleMapping(22);
            var electronDisplayObject = ParticleGraphicsGenerator.generateElectron(mvt);
            var uri = PixiToImage.displayObjectToDataURI(electronDisplayObject, 1);
            this.electronImage = new Image();
            this.electronImage.src = uri;
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

            this.draw();
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

            if (this.atom)
                this.drawData();
        },

        drawEmptyGraph: function() {
            var ctx = this.ctx;
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;
            var resolution = this.getResolution();

            var headWidth  = 10 * resolution;
            var headLength = 12 * resolution;

            // Draw axis line
            ctx.beginPath();
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
            // Distance between the 2 points
            var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            var phi = Math.atan2(y2 - y1, x2 - x1);
            var period = this.wavelengthToPeriod(wavelength);
            
            
            // Save the context's state before transforming
            ctx.save();
            // And transform so we can paint as though the squiggle is starting
            //   on the origin and going to the right.
            ctx.translate(x1, y1);
            ctx.rotate(phi);

            // Color that corresponds to the wavelength
            var color;
            if (wavelength < WavelengthColors.MIN_WAVELENGTH)
                color = Constants.UV_COLOR;
            else if (wavelength > WavelengthColors.MAX_WAVELENGTH)
                color = Constants.IR_COLOR;
            else
                color = WavelengthColors.nmToHex(wavelength);

            /*
             * The arrow head is drawn only if the distance between the points is 
             * large enough to fit both the arrow head and a minimum amount of squiggle.
             * If the distance isn't sufficient, then our squiggle will have no arrow head.
             */
            var hasArrow = (distance > this.squiggleArrowHeadHeight + this.minSquiggleLength);
            if (hasArrow) {
                ctx.beginPath();
                ctx.moveTo(distance, 0);
                ctx.lineTo(distance - this.squiggleArrowHeadHeight,  this.squiggleArrowHeadWidth / 2);
                ctx.lineTo(distance - this.squiggleArrowHeadHeight, -this.squiggleArrowHeadWidth / 2);
                ctx.closePath();

                ctx.fillStyle = color;
                ctx.fill();
            }

            /*
             * The squiggle is a sinusoidal line, with period and amplitude.
             * If the 2 points are too close together, the sinusoidal nature of 
             * the line won't be intelligible, so we simply draw a straight line.
             */
            ctx.beginPath();
            if (distance >= this.minSquiggleLength) {
                ctx.moveTo(0, 0);

                var maxX = (hasArrow) ? (distance - this.squiggleArrowHeadHeight) : distance;
                for (var x = 0; x < maxX; x++) {
                    var angle = (x % period) * (2 * Math.PI / period);
                    var y = this.squiggleAmplitude * Math.sin(angle);
                    ctx.lineTo(x, y);
                }
            }
            else {
                // Use a straight line if the points are too close together
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }

            ctx.lineWidth = this.squiggleLineWidth;
            ctx.strokeStyle = color;
            ctx.stroke();

            // Reset the context's transform
            ctx.restore();
        },

        drawElectron: function(ctx, x, y) {
            ctx.drawImage(this.electronImage, x - this.electronImage.width / 2, y - this.electronImage.height / 2);
        },

        drawStateLine: function(ctx, x, y) {
            ctx.beginPath();
            ctx.moveTo(x, y)
            ctx.lineTo(x + this.stateLineLength, y);
            ctx.closePath();

            ctx.lineWidth = this.stateLineWidth;
            ctx.strokeStyle = EnergyDiagramView.STATE_LINE_COLOR;
            ctx.stroke();
        },

        drawStateLabel: function(ctx, x, y, state) {
            ctx.fillStyle = EnergyDiagramView.STATE_LINE_COLOR;
            ctx.font = this.stateLabelFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('n=' + state, x, y);
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
                E[i] = EnergyDiagramView.E1 / (n * n);
            }

            // Apply distortion
            if (EnergyDiagramView.DISTORTION_FACTOR > 0) {
                for (i = 1; i < numberOfStates - 1; i++ ) {
                    E[i] = E[i] * (1 + EnergyDiagramView.DISTORTION_FACTOR);
                }
            }

            return E;
        },

        /*
         * Convert wavelength to squiggle period.
         * All UV has the same period.
         * All IR has the same period.
         * Visible wavelengths have a calculated period.
         */
        wavelengthToPeriod: function(wavelength) {
            if (wavelength < WavelengthColors.MIN_WAVELENGTH) {
                return this.uvSquigglePeriod;
            }
            else if (wavelength > WavelengthColors.MAX_WAVELENGTH) {
                return this.irSquigglePeriod;
            }
            else {
                var wavelengthRange = WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH;
                var periodRange = this.maxVisibleSquigglePeriod - this.minVisibleSquigglePeriod;
                var factor = (wavelength - WavelengthColors.MIN_WAVELENGTH) / wavelengthRange;
                return this.minVisibleSquigglePeriod + (factor * periodRange);
            }
        }

    }, Constants.EnergyDiagramView);


    return EnergyDiagramView;
});
