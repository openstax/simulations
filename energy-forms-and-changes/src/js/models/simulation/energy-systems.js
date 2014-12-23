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

            this.faucetAndWater = new FaucetAndWater();

            this.sources = [
                this.faucetAndWater,
                new Backbone.Model(),
                new Backbone.Model(),
                new Backbone.Model()
            ];

            this.converters = [
                new Backbone.Model(),
                new Backbone.Model()
            ];

            this.users = [
                new Backbone.Model(),
                new Backbone.Model(),
                new Backbone.Model()
            ];

            this.models = _.flatten([
                this.air,
                this.sources,
                this.converters,
                this.users
            ]);

            // Temporary until all the models are filled in
            _.each(this.models, function(model) { if (model.update === undefined) model.update = function(){}; });

            this.set('source', this.faucetAndWater);
            this.set('converter', this.converters[0]);
            this.set('user', this.users[0]);

            this.get('source').activate();

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

            

            for (var i = 0; i < this.models.length; i++)
                this.models[i].update(time, deltaTime);
        }

    }, Constants.EnergySystemsSimulation);

    return EnergySystemsSimulation;
});
