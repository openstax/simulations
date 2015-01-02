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

    var Faucet = require('models/energy-source/faucet');
    var Sun    = require('models/energy-source/sun');
    var Teapot = require('models/energy-source/teapot');
    var Biker  = require('models/energy-source/biker');

    var ElectricalGenerator = require('models/energy-converter/electrical-generator');
    var IncandescentLightBulb = require('models/energy-user/incandescent-light-bulb');
    var CarouselAnimator = require('models/carousel-animator');

    var EnergySystemsElement = require('models/energy-systems-element');
    
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
            this.faucet = new Faucet();
            this.sun    = new Sun();
            this.teapot = new Teapot();
            this.biker  = new Biker();

            // Converters
            this.electricalGenerator = new ElectricalGenerator();

            // Users
            this.incandescentLightBulb = new IncandescentLightBulb();

            // Group lists
            this.sources = [
                this.faucet,
                this.sun,
                this.teapot,
                this.biker
            ];

            this.converters = [
                this.electricalGenerator,
                new EnergySystemsElement()
            ];

            this.users = [
                this.incandescentLightBulb,
                new EnergySystemsElement(),
                new EnergySystemsElement()
            ];

            // List of all models
            this.models = _.flatten([
                this.air,
                this.sources,
                this.converters,
                this.users
            ]);

            // Temporary until all the models are filled in
            _.each(this.models, function(model) { if (model.update === undefined) model.update = function(){return{type: 2, amount: 133, direction: -1.5};}; if (model.injectEnergyChunks === undefined) model.injectEnergyChunks = function(){}; });

            this.set('source',    this.faucet);
            this.set('converter', this.electricalGenerator);
            this.set('user',      this.incandescentLightBulb);

            this.faucet.set('waterPowerableElementInPlace', true);
            this.get('source').activate();
            this.get('converter').activate();
            this.get('user').activate();

            this.faucet.set('flowProportion', 0.4);

            // Animators
            this.sourceAnimator = new CarouselAnimator({
                elements: this.sources,
                activeElement: this.get('source'),
                activeElementPosition: EnergySystemsSimulation.ENERGY_SOURCE_POSITION
            });
            this.converterAnimator = new CarouselAnimator({
                elements: this.converters,
                activeElement: this.get('converter'),
                activeElementPosition: EnergySystemsSimulation.ENERGY_CONVERTER_POSITION
            });
            this.userAnimator = new CarouselAnimator({
                elements: this.users,
                activeElement: this.get('user'),
                activeElementPosition: EnergySystemsSimulation.ENERGY_USER_POSITION
            });

            var activateElement = function(activeElement) { 
                activeElement.activate(); 
            };

            this.listenTo(this.sourceAnimator,    'destination-reached', activateElement);
            this.listenTo(this.converterAnimator, 'destination-reached', activateElement);
            this.listenTo(this.userAnimator,      'destination-reached', activateElement);
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

        preloadEnergyChunks: function() {
            this.get('source').preloadEnergyChunks();
            this.get('converter').preloadEnergyChunks();
            this.get('user').preloadEnergyChunks();
        },

        /**
         * 
         */
        _update: function(time, deltaTime) {
            // For the time slider and anything else relying on time
            // this.set('time', time);

            this.sourceAnimator.update(time, deltaTime);
            this.converterAnimator.update(time, deltaTime);
            this.userAnimator.update(time, deltaTime);

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

        sourceChanged: function(simulation, source) {
            this.sourceAnimator.set('activeElement', source);
        },

        converterChanged: function(simulation, converter) {
            this.converterAnimator.set('activeElement', converter);
        },

        userChanged: function(simulation, user) {
            this.userAnimator.set('activeElement', user);
        }

    }, Constants.EnergySystemsSimulation);

    return EnergySystemsSimulation;
});
