define(function (require, exports, module) {

    'use strict';

    // Libraries
    var _ = require('underscore');

    // Project dependiencies
    var FixedIntervalSimulation = require('common/simulation/simulation');

    // Constants
    var Constants = require('models/constants');

    /**
     * Minimum distance allowed between two objects.  This basically prevents
     *   floating point issues.
     */
    var MIN_INTER_ELEMENT_DISTANCE = 1E-9; // In meters

    /** 
     * Threshold of temperature difference between the bodies in a multi-body
     *   system below which energy can be exchanged with air.
     */
    var MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // In degrees K, empirically determined

    // Initial thermometer location, intended to be away from any model objects.
    var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

    var NUM_THERMOMETERS = 3;
    
    var BEAKER_WIDTH = 0.085; // In meters.
    var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;

    // Flag that can be turned on in order to print out some profiling info.
    var ENABLE_INTERNAL_PROFILING = false;

    /**
     * 
     */
    var EFCIntroSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

            energyChunksVisible: false

        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {
            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            // Burners
            this.leftBurner  = null;
            this.rightBurner = null;

            // Moveable thermal model objects
            this.brick     = null;
            this.ironBlock = null;
            this.beaker    = null;
            this.moveableThermalEnergyContainers = [];
            this.moveableThermalEnergyContainers.push(this.brick);
            this.moveableThermalEnergyContainers.push(this.ironBlock);
            this.moveableThermalEnergyContainers.push(this.beaker);

            // Thermometers
            this.thermometers = [];
            for (var i = 0; i < NUM_THERMOMETERS; i++) {
                //thermometers.push(new Thermometer)
            }

            // Air
            this.air = null;
        },

        /**
         *
         */
        applyOptions: function(options) {
            FixedIntervalSimulation.prototype.applyOptions.apply(this, [options]);

            
        },

        /**
         *
         */
        initComponents: function() {
            
        },

        /**
         *
         */
        reset: function() {
            FixedIntervalSimulation.prototype.reset.apply(this);

            this.air.reset();
            this.leftBurner.reset();
            this.rightBurner.reset();
            ironBlock.reset();
            brick.reset();
            beaker.reset();
            _.each(this.thermometers, function(thermometer){
                thermometer.reset();
            });
        },

        /**
         *
         */
        play: function() {
            // May need to save the current state here for the rewind button

            FixedIntervalSimulation.prototype.play.apply(this);
        },

        /**
         *
         */
        rewind: function() {
            // Apply the saved state
        },

        /**
         * 
         */
        _update: function(time, delta) {
            // For the time slider and anything else relying on time
            this.set('time', time);


        },

    });

    return EFCIntroSimulation;
});
