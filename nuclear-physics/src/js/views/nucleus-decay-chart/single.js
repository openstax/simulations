define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var NucleusDecayChart = require('views/nucleus-decay-chart');

    var Constants = require('constants');
    var MILLISECONDS_PER_SECOND = 1000;
    var MILLISECONDS_PER_MINUTE = 60000;
    var MILLISECONDS_PER_HOUR = 3600000;
    var MILLISECONDS_PER_DAY = 86400000;
    var MILLISECONDS_PER_YEAR = 3.16e10;
    var MILLISECONDS_PER_MILLENIUM = 3.16e13;
    var MILLISECONDS_PER_MILLION_YEARS = 3.16e16;
    var MILLISECONDS_PER_BILLION_YEARS = 3.16e19;
    var MILLISECONDS_PER_TRILLION_YEARS = 3.16e22;
    var MILLISECONDS_PER_QUADRILLION_YEARS = 3.16e25;

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var SingleNucleusDecayChart = NucleusDecayChart.extend({

        events: _.extend({}, NucleusDecayChart.prototype.events, {
            'click     .clearChartButton' : 'clearChartClicked',
            'mouseover .clearChartButton' : 'clearChartHover',
            'mouseout  .clearChartButton' : 'clearChartUnhover'
        }),

        /**
         * Initializes the new SingleNucleusDecayChart.
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            this.buttonWidth = 126;
            this.buttonHeight = 32;
            this.buttonRadius = 4;

            NucleusDecayChart.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'nucleus-added', this.nucleusAdded);
            this.listenTo(this.simulation, 'nucleus-reset', this.nucleusAdded);

            this.nucleusAdded(this.simulation.atomicNucleus);
        },

        initGraphics: function() {
            NucleusDecayChart.prototype.initGraphics.apply(this, arguments);

            this.initDecayTime();
            this.initClearChartButton();
        },

        initDecayTime: function() {
            var x = this.padding;
            var y = this.padding;

            var label = new PIXI.Text('Decay Time:', {
                fill: NucleusDecayChart.DECAY_LABEL_COLOR,
                font: NucleusDecayChart.DECAY_LABEL_FONT
            });
            label.resolution = this.getResolution();
            label.x = x;
            label.y = y;

            var valueBackdrop = new PIXI.Graphics();
            valueBackdrop.beginFill(0xFFFFFF, 0.3);
            valueBackdrop.drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, this.buttonRadius);
            valueBackdrop.endFill();
            valueBackdrop.x = x;
            valueBackdrop.y = label.y + label.height + 8;
            var backdropPadding = 6;

            var value = new PIXI.Text('', {
                fill: NucleusDecayChart.DECAY_LABEL_COLOR,
                font: NucleusDecayChart.DECAY_VALUE_FONT
            });
            value.resolution = this.getResolution();
            value.anchor.x = 1;
            value.anchor.y = 0.5;
            value.x = valueBackdrop.width - backdropPadding;
            value.y = valueBackdrop.height / 2;
            valueBackdrop.addChild(value);

            this.decayTimeValueText = value;

            this.displayObject.addChild(label);
            this.displayObject.addChild(valueBackdrop);
        },

        initClearChartButton: function() {
            var borderRadius = this.buttonRadius;
            var width = this.buttonWidth;
            var height = this.buttonHeight;
            var x = this.padding;
            var y = this.height - this.padding;

            var btn = new PIXI.Graphics();
            btn.beginFill(Colors.parseHex(NucleusDecayChart.BUTTON_BG_COLOR), 1);
            btn.drawRoundedRect(0, 0, width, height, borderRadius);
            btn.endFill();
            btn.x = x;
            btn.y = y - btn.height;
            btn.buttonMode = true;

            var text = new PIXI.Text('Clear Chart', {
                fill: NucleusDecayChart.BUTTON_FG_COLOR,
                font: NucleusDecayChart.BUTTON_FONT
            });
            text.resolution = this.getResolution();
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.x = btn.width / 2;
            text.y = btn.height / 2;

            btn.addChild(text);

            this.clearChartButton = btn;
            this.displayObject.addChild(btn);
        },

        update: function(time, deltaTime, paused) {
            if (this._nucleusAdded) {
                this.addNucleus(this.simulation.atomicNucleus);
                this._nucleusAdded = false;
            }

            this.updateTime();

            NucleusDecayChart.prototype.update.apply(this, arguments);
        },

        updateTime: function() {
            if (!this.simulation.atomicNucleus || !this.simulation.atomicNucleus.isDecayActive())
                return;

            var milliseconds = this.simulation.atomicNucleus.getAdjustedActivatedTime();
            var text;

            if (milliseconds < MILLISECONDS_PER_SECOND) {
                // Milliseconds range.
                text = milliseconds.toFixed(0) + ' ms';
            }
            else if (milliseconds < MILLISECONDS_PER_MINUTE) {
                // Seconds range.
                text = (milliseconds / MILLISECONDS_PER_SECOND).toFixed(1) + ' secs';
            }
            else if (milliseconds < MILLISECONDS_PER_HOUR) {
                // Minutes range.
                text = (milliseconds / MILLISECONDS_PER_MINUTE).toFixed(1) + ' mins';
            }
            else if (milliseconds < MILLISECONDS_PER_DAY) {
                // Hours range.
                text = (milliseconds / MILLISECONDS_PER_HOUR).toFixed(1) + ' hrs';
            }
            else if (milliseconds < MILLISECONDS_PER_YEAR) {
                // Days range.
                text = (milliseconds / MILLISECONDS_PER_DAY).toFixed(0) + ' days';
            }
            else if (milliseconds < MILLISECONDS_PER_MILLENIUM) {
                // Years range.
                text = (milliseconds / MILLISECONDS_PER_YEAR).toFixed(0) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_MILLION_YEARS) {
                // Thousand years range (millenia).
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 3) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_BILLION_YEARS) {
                // Million years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 6) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_TRILLION_YEARS) {
                // Billion years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 9) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_QUADRILLION_YEARS) {
                // Trillion years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 12) + ' yrs';
            }
            else {
                text = '\u221e'; // Infinity.
            }

            this.decayTimeValueText.text = text;
        },

        toScientificNotation: function(number, exponent, mantissaDecimals) {
            if (!mantissaDecimals)
                mantissaDecimals = 3;
            // Find tha mantissa
            var mantissa = number / Math.pow(10, exponent);
            // Render unicode characters representing the exponential digits
            var exponentString = ' ';
            var chars = exponent.toString();
            for (var i = 0; i < chars.length; i++) {
                var digit = parseInt(chars.charAt(i));
                if (digit == '2' || digit == '3')
                    exponentString += String.fromCharCode(parseInt('00B' + digit, 16));
                else
                    exponentString += String.fromCharCode(parseInt('207' + digit, 16));
            }
            // Put it all together
            return mantissa.toFixed(mantissaDecimals) + ' x 10' + exponentString;
        },

        clearNuclei: function() {
            this.nucleiView.clear();
            this.decayTimeValueText.text = '';
        },

        clearDecayedNuclei: function() {
            this.nucleiView.clearDecayed();
            this.decayTimeValueText.text = '';
        },

        nucleusAdded: function(nucleus) {
            this._nucleusAdded = true;
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.clearNuclei();
            
            NucleusDecayChart.prototype.nucleusTypeChanged.apply(this, arguments);
        },

        clearChartClicked: function() {
            this.clearDecayedNuclei();
        },

        clearChartHover: function() {
            this.clearChartButton.alpha = NucleusDecayChart.BUTTON_HOVER_ALPHA;
        },

        clearChartUnhover: function() {
            this.clearChartButton.alpha = 1;
        }

    });


    return SingleNucleusDecayChart;
});