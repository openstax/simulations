define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');


    var Spring  = require('models/spring');
    var Body  = require('models/body');

    /**
     * Constants
     */
    var Constants = require('constants');

    // Plain object holding initial information about the stage objects
    // i.e. Springs, Pegs, Bodies, etc.
    // 
    // I wanted to isolate that data into it's own file.
    var Initials = require('initials');


    /**
     * Wraps the update function in 
     */
    var MassesAndSpringsSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.initComponents();
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {

            this.initSprings();
            this.initBodies();

        },

        initSprings: function(){

            this.springs = _.map(Initials.Springs, function(spring){
                return new Spring(spring);
            });

        },

        initBodies: function(){

            this.bodies = _.map(Initials.Bodies, function(body){
                return new Body(body);
            });

        },

        _update: function(time, deltaTime) {
            
        }

    });

    return MassesAndSpringsSimulation;
});
