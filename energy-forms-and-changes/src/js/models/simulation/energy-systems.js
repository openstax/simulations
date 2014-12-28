define(function (require, exports, module) {

    'use strict';

    // Libraries
    var _ = require('underscore');
    var Backbone = require('backbone');

    // Common dependencies
    var Vector2                 = require('common/math/vector2');
    var Rectangle               = require('common/math/rectangle');
    var PiecewiseCurve          = require('common/math/piecewise-curve');
    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    
    // Project dependiencies
    var Air = require('models/air');
    var FaucetAndWater = require('models/energy-source/faucet-and-water');
    var ElectricalGenerator = require('models/energy-converter/electrical-generator');
    var IncandescentLightBulb = require('models/energy-user/incandescent-light-bulb');
    
    // Constants
    var Constants = require('constants');

    /**
     * 
     */
    var EnergySystemsSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {
            source: null,
            converter: null,
            user: null
        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {
            options = options || {};
            options.framesPerSecond = Constants.FRAMES_PER_SECOND;

            FixedIntervalSimulation.prototype.initialize.apply(this, arguments);

            this.initComponents();

            this.on('change:source',    this.sourceChanged);
            this.on('change:converter', this.converterChanged);
            this.on('change:user',      this.userChanged);
        },

        /**
         *
         */
        initComponents: function() {
            // Air
            this.air = new Air();

            // Sources
            this.faucetAndWater = new FaucetAndWater();

            // Converters
            this.electricalGenerator = new ElectricalGenerator();

            // Users
            this.incandescentLightBulb = new IncandescentLightBulb();

            // Group lists
            this.sources = [
                this.faucetAndWater,
                new Backbone.Model(),
                new Backbone.Model(),
                new Backbone.Model()
            ];

            this.converters = [
                this.electricalGenerator,
                new Backbone.Model()
            ];

            this.users = [
                this.incandescentLightBulb,
                new Backbone.Model(),
                new Backbone.Model()
            ];

            // List of all models
            this.models = _.flatten([
                this.air,
                this.sources,
                this.converters,
                this.users
            ]);

            // Temporary until all the models are filled in
            _.each(this.models, function(model) { if (model.update === undefined) model.update = function(){}; if (model.injectEnergyChunks === undefined) model.injectEnergyChunks = function(){}; });

            this.set('source',    this.faucetAndWater);
            this.set('converter', this.electricalGenerator);
            this.set('user',      this.incandescentLightBulb);

            this.faucetAndWater.set('waterPowerableElementInPlace', true);
            this.get('source').activate();
            this.get('converter').activate();
            this.get('user').activate();

            this.faucetAndWater.set('flowProportion', 0.4);
        },

        /**
         *
         */
        reset: function() {
            FixedIntervalSimulation.prototype.reset.apply(this);

            this.air.reset();
            this.beaker.reset();
            _.each(this.thermometers, function(thermometer){
                thermometer.reset();
            });
        },

        /**
         * 
         */
        _update: function(time, deltaTime) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            // Update the active elements to produce, convert, and use energy.
            var energyFromSource    = this.get('source').update(time, deltaTime);
            var energyFromConverter = this.get('converter').update(time, deltaTime, energyFromSource);
                                      this.get('user').update(time, deltaTime, energyFromConverter);

            // Transfer energy chunks between elements
            var sourceOutput = this.get('source').extractOutgoingEnergyChunks();
            this.get('converter').injectEnergyChunks(sourceOutput); 
            var converterOutput = this.get('converter').extractOutgoingEnergyChunks();
            this.get('user').injectEnergyChunks(converterOutput);

            //console.log('source output: ' + sourceOutput.length + ', converter output: ' + converterOutput.length +', bulb output: ' + this.get('user').radiatedEnergyChunkMovers.length);
        },

        userChanged: function(simulation, user) {

        },

        converterChanged: function(simulation, converter) {

        },

        userChanged: function(simulation, user) {

        },

        animateActiveElement: function(element) {
            // The way the original sim works is that every element
            //   is positioned down a line, so it shifts all the
            //   elements up or down to show the active one when it
            //   is selected.  I don't know if I'll do it that way
            //   or not.  If I do do it that way, I determine the
            //   element's position in its type array in the *Changed
            //   function and then pass in the array and the position
            //   to this function to animate all the elements in such
            //   a way as to put the newly activated one in the spot
            //   specified by EnergySystemsSimulation.ENERGY_*_POSITION
        }

    }, Constants.EnergySystemsSimulation);

    return EnergySystemsSimulation;
});
