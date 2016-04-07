define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');
    var TimeFormatter = require('models/time-formatter');

    var NucleusDecayChart = require('views/nucleus-decay-chart');

    var Constants = require('constants');


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
                this.nucleiView.replaceNucleus(this.simulation.atomicNucleus);
                this._nucleusAdded = false;
            }

            this.updateTime();

            NucleusDecayChart.prototype.update.apply(this, arguments);
        },

        updateTime: function() {
            if (!this.simulation.atomicNucleus || !this.simulation.atomicNucleus.isDecayActive())
                return;

            var milliseconds = this.simulation.atomicNucleus.getAdjustedActivatedTime();
            var text = TimeFormatter.formatTimeWithScientificNotation(milliseconds);

            this.decayTimeValueText.text = text;
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