define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');
    var DecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var DecayRatesChartView = DecayProportionChartView.extend({

        /**
         * Initializes the new DecayRatesChartView.
         */
        initialize: function(options) {
            options = _.extend({
                height: 210,
                paddingLeft: 180, // Number of pixels on the left before the chart starts
                paddingBottom: 45,
                paddingRight: 15,
                paddingTop: 45,
                padding: 15,

                pieChartRadius: 25,
                lineMode: false
            }, options);

            this.pieChartRadius = options.pieChartRadius;

            DecayProportionChartView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'change:active',      this.activeChanged);
            this.listenTo(this.simulation, 'change:nucleusType', this.nucleusTypeChanged);
            this.listenTo(this.simulation, 'nuclei-reset',       this.nucleiReset);
            this.nucleusTypeChanged(this.simulation, this.simulation.get('nucleusType'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DecayProportionChartView.prototype.initGraphics.apply(this, arguments);

            this.initPieChart();
        },

        initPieChart: function() {
            var radius = this.pieChartRadius;

            this.pieChartGraphics = new PIXI.Graphics();
            this.pieChartGraphics.x = 58;
            this.pieChartGraphics.y = this.graphOriginY - this.graphHeight / 2;

            this.isotope1Container = new PIXI.Container();
            this.isotope2Container = new PIXI.Container();
            this.isotope1Container.x = this.isotope2Container.x = this.pieChartGraphics.x;
            this.isotope1Container.y = this.pieChartGraphics.y - radius - 16;
            this.isotope2Container.y = this.pieChartGraphics.y + radius + 16;
            
            var settings = {
                fill: DecayRatesChartView.DECAY_LABEL_COLOR,
                font: DecayRatesChartView.DECAY_LABEL_FONT
            };
            var x = this.pieChartGraphics.x + 6;

            this.isotope1Counter = new PIXI.Text('', settings);
            this.isotope1Counter.resolution = this.getResolution();
            this.isotope1Counter.x = x;
            this.isotope1Counter.y = this.isotope1Container.y;
            this.isotope1Counter.anchor.x = 0;
            this.isotope1Counter.anchor.y = 0.35;

            this.isotope2Counter = new PIXI.Text('', settings);
            this.isotope2Counter.resolution = this.getResolution();
            this.isotope2Counter.x = x;
            this.isotope2Counter.y = this.isotope2Container.y;
            this.isotope2Counter.anchor.x = 0;
            this.isotope2Counter.anchor.y = 0.35;

            this.displayObject.addChild(this.pieChartGraphics);
            this.displayObject.addChild(this.isotope1Container);
            this.displayObject.addChild(this.isotope2Container);
            this.displayObject.addChild(this.isotope1Counter);
            this.displayObject.addChild(this.isotope2Counter);
        },

        drawCurrentGraphData: function() {
            var time = this.simulation.getAdjustedTime();
            var numAtoms = this.simulation.getTotalNumNuclei();
            var numActive = this.simulation.getNumActiveNuclei();
            var activePercent = numActive / numAtoms;
            var decayedPercent = 1 - activePercent;

            this.drawDataPoint(time, activePercent,  this.isotope1Color);
            this.drawDataPoint(time, decayedPercent, this.isotope2Color);
        },

        update: function(time, deltaTime, paused) {
            this.updatePieChart();

            if (this._lastNucleusCount !== this.simulation.getTotalNumNuclei())
                this.clearData();
            
            if (this.simulation.getTotalNumNuclei() > 0 && this.simulation.get('active'))
                this.drawCurrentGraphData();

            this._lastNucleusCount = this.simulation.getTotalNumNuclei();  
        },

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.get('nucleusType');
            var halfLife = HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);
            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        updateIsotopes: function() {
            var nucleusType = this.simulation.get('nucleusType');
            var decayedNucleusType = AtomicNucleus.getPostDecayNuclei(nucleusType)[0];

            var isotope1Text = IsotopeSymbolGenerator.generateWithElementColor(nucleusType,        DecayRatesChartView.ISOTOPE_FONT_SIZE, 1);
            var isotope2Text = IsotopeSymbolGenerator.generateWithElementColor(decayedNucleusType, DecayRatesChartView.ISOTOPE_FONT_SIZE, 1);
            
            this.isotope1Container.removeChildren();
            this.isotope2Container.removeChildren();

            this.isotope1Container.addChild(isotope1Text);
            this.isotope2Container.addChild(isotope2Text);

            this.isotope1Color = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(nucleusType));
            this.isotope2Color = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(decayedNucleusType));
        },

        updatePieChart: function() {
            var graphics = this.pieChartGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);

            var nucleusType = this.simulation.get('nucleusType');

            var isotope1Color = this.isotope1Color;
            var isotope2Color = this.isotope2Color;
            
            var radius = this.pieChartRadius;
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

        getSampleNucleus: function() {
            return this.simulation.createNucleus();
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.updateTimeSpan();
            this.updateIsotopes();
        },

        activeChanged: function(simulation, active) {
            if (active)
                this.dataGraphics.clear();
        },

        nucleiReset: function() {
            this.dataGraphics.clear();
        }

    });


    return DecayRatesChartView;
});