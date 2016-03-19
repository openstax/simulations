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

        },

        initClearChartButton: function() {
            var borderRadius = 4;
            var width = 120;
            var height = 32;
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
                font: '500 14px Helvetica Neue'
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

        clearChartHover: function() {
            this.clearChartButton.alpha = NucleusDecayChart.BUTTON_HOVER_ALPHA;
        },

        clearChartUnhover: function() {
            this.clearChartButton.alpha = 1;
        },

        update: function(time, deltaTime, paused) {
            if (this._nucleusAdded) {
                this.addNucleus(this.simulation.atomicNucleus);
                this._nucleusAdded = false;
            }

            NucleusDecayChart.prototype.update.apply(this, arguments);
        },

        nucleusAdded: function(nucleus) {
            this._nucleusAdded = true;
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.clearNuclei();
            
            NucleusDecayChart.prototype.nucleusTypeChanged.apply(this, arguments);
        },

        clearChartClicked: function() {
            this.clearNuclei();
        }

    });


    return SingleNucleusDecayChart;
});