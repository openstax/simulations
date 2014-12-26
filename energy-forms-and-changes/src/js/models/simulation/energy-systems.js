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

            this.set('source', this.faucetAndWater);
            this.set('converter', this.electricalGenerator);
            this.set('user', this.incandescentLightBulb);

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
        }

    }, Constants.EnergySystemsSimulation);

    return EnergySystemsSimulation;
});
