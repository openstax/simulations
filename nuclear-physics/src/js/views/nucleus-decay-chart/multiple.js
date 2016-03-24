define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var NucleusDecayChart      = require('views/nucleus-decay-chart');
    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var MultipleNucleusDecayChart = NucleusDecayChart.extend({

        /**
         * Initializes the new MultipleNucleusDecayChart.
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            this.buttonWidth = 126;
            this.buttonHeight = 32;
            this.buttonRadius = 4;

            NucleusDecayChart.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation.atomicNuclei, 'add',    this.nucleusAdded);
            this.listenTo(this.simulation.atomicNuclei, 'remove', this.nucleusRemoved);
            this.listenTo(this.simulation.atomicNuclei, 'reset',  this.updatePieChart);
            this.listenTo(this.simulation, 'nucleus-change', this.nucleusChanged);
            this.listenTo(this.simulation, 'nuclei-reset',   this.nucleiReset);
        },

        initGraphics: function() {
            NucleusDecayChart.prototype.initGraphics.apply(this, arguments);

            this.initIsotopeCounts();
            this.initPieChart();

            this.updatePieChart();
        },

        initIsotopeCounts: function() {
            var x = this.padding + 40;
            this.isotope1CountContainer = new PIXI.Container();
            this.isotope2CountContainer = new PIXI.Container();
            this.isotope1CountContainer.x = x;
            this.isotope2CountContainer.x = x;
            this.isotope1CountContainer.y = this.yAxisIsotope1.y;
            this.isotope2CountContainer.y = this.yAxisIsotope2.y;

            var settings = {
                fill: NucleusDecayChart.DECAY_LABEL_COLOR,
                font: NucleusDecayChart.DECAY_LABEL_FONT
            };

            x += 10;

            this.isotope1Counter = new PIXI.Text('', settings);
            this.isotope1Counter.resolution = this.getResolution();
            this.isotope1Counter.x = x;
            this.isotope1Counter.y = this.yAxisIsotope1.y;
            this.isotope1Counter.anchor.x = 0;
            this.isotope1Counter.anchor.y = 0.5;

            this.isotope2Counter = new PIXI.Text('', settings);
            this.isotope2Counter.resolution = this.getResolution();
            this.isotope2Counter.x = x;
            this.isotope2Counter.y = this.yAxisIsotope2.y;
            this.isotope2Counter.anchor.x = 0;
            this.isotope2Counter.anchor.y = 0.5;

            this.displayObject.addChild(this.isotope1CountContainer);
            this.displayObject.addChild(this.isotope2CountContainer);
            this.displayObject.addChild(this.isotope1Counter);
            this.displayObject.addChild(this.isotope2Counter);
        },

        initPieChart: function() {
            this.pieChartGraphics = new PIXI.Graphics();
            this.pieChartGraphics.x = 114;
            this.pieChartGraphics.y = (this.isotope1Counter.y + this.isotope2Counter.y) / 2;

            this.displayObject.addChild(this.pieChartGraphics);
        },

        update: function(time, deltaTime, paused) {
            if (this._nucleusAdded) {
                
                this._nucleusAdded = false;
            }

            NucleusDecayChart.prototype.update.apply(this, arguments);
        },

        updatePieChart: function() {
            var graphics = this.pieChartGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);

            var nucleusType = this.simulation.get('nucleusType');
            var isotope1Color = Colors.parseHex(IsotopeSymbolGenerator.getColor(nucleusType));
            var isotope2Color = Colors.parseHex(IsotopeSymbolGenerator.getColor(AtomicNucleus.getPostDecayNucleusType(nucleusType)));
            var radius = 25;
            var numActive  = this.simulation.getNumActiveNuclei();
            var numDecayed = this.simulation.getNumDecayedNuclei();
            var decayedAngle = Math.PI * 2 * (numDecayed / (numActive + numDecayed));

            graphics.beginFill(isotope1Color, 1);
            graphics.drawCircle(0, 0, radius);
            graphics.endFill();

            if (numDecayed > 0) {
                if (numActive === 0)
                    graphics.lineStyle(0, 0, 0);

                graphics.beginFill(isotope2Color, 1);
                graphics.moveTo(0, 0);
                graphics.lineTo(radius, 0);
                graphics.arc(0, 0, radius, 0, decayedAngle);
                graphics.lineTo(0, 0);
                graphics.endFill();

                if (numActive > 0) {
                    graphics.moveTo(0, 0);
                    graphics.lineTo(radius, 0);     
                }

                graphics.lineStyle(1, 0x000000, 1);
                graphics.moveTo(0, 0);
                graphics.drawCircle(0, 0, radius);   
            }

            this.isotope1Counter.text = numActive;
            this.isotope2Counter.text = numDecayed;
        },

        updateIsotopes: function() {
            NucleusDecayChart.prototype.updateIsotopes.apply(this, arguments);

            var nucleusType = this.simulation.get('nucleusType');
            var decayedNucleusType = AtomicNucleus.getPostDecayNuclei(nucleusType)[0];

            var isotope1Text = IsotopeSymbolGenerator.generate(nucleusType,        NucleusDecayChart.ISOTOPE_FONT_SIZE, 1);
            var isotope2Text = IsotopeSymbolGenerator.generate(decayedNucleusType, NucleusDecayChart.ISOTOPE_FONT_SIZE, 1);

            this.isotope1CountContainer.removeChildren();
            this.isotope2CountContainer.removeChildren();

            this.isotope1CountContainer.addChild(isotope1Text);
            this.isotope2CountContainer.addChild(isotope2Text);
        },

        clearNuclei: function() {
            this.nucleiView.clear();
        },

        clearDecayedNuclei: function() {
            this.nucleiView.clearDecayed();
        },

        addAllNuclei: function() {
            for (var i = 0; i < this.simulation.atomicNuclei.length; i++)
                this.addNucleus(this.simulation.atomicNuclei.at(i));
        },

        nucleusAdded: function(nucleus) {
            this._nucleusAdded = true;
            this.addNucleus(nucleus);
            this.updatePieChart();
        },

        nucleusRemoved: function(nucleus) {
            this.nucleiView.removeNucleus(nucleus);
            this.updatePieChart();
        },

        nucleiReset: function() {
            this.clearNuclei();
            this.addAllNuclei();
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.clearNuclei();
            
            NucleusDecayChart.prototype.nucleusTypeChanged.apply(this, arguments);
        },

        nucleusChanged: function() {
            this.updatePieChart();
        }

    });


    return MultipleNucleusDecayChart;
});