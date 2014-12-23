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

            this.on('change:source',    this.sourceChanged);
            this.on('change:converter', this.converterChanged);
            this.on('change:user',      this.userChanged);

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
        },

        sourceChanged: function(simulation, source) {
            this.activeElementChanged('source');
        },

        converterChanged: function(simulation, converter) {
            this.activeElementChanged('converter');
        },

        userChanged: function(simulation, user) {
            this.activeElementChanged('user');
        },

        /**
         * Checks to make sure they existed first because the UI may have
         *   reason (i.e., waiting for an animation to complete) to set
         *   the active element to null temporarily in order to deactivate
         *   the currently active one.
         */
        activeElementChanged: function(elementKey) {
            if (this.previous(elementKey))
                this.previous(elementKey).deactivate();
            if (this.get(elementKey))
                this.get(elementKey).activate();
        }

    }, Constants.EnergySystemsSimulation);

    return EnergySystemsSimulation;
});
