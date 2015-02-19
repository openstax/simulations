define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');


    var Springs  = require('collections/springs');
    var Bodies  = require('collections/bodies');
    var Systems  = require('collections/body-spring-systems');

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

            this.initSystems();

        },

        initSprings: function(){
            this.springs = new Springs(Initials.Springs);
        },

        initBodies: function(){
            this.bodies = new Bodies(Initials.Bodies);
        },

        initSystems: function(){
            var springs = this.springs.map(function(spring){
                return {
                    spring: spring,
                    // TODO should update and read from UI input.  temporary defaults
                    gravity : _.find(Constants.SimSettings.GRAVITY, {isDefault: true}).value,
                    b: 0.66
                };
            });

            this.systems = new Systems(springs);
        },

        _update: function(time, deltaTime) {
            this.systems.each(function(system){
                system.evolve(deltaTime);
            });

            // would like to make it so that models that need to evolve are being checked
            // on update
            this.bodies.chain().where({resting: false}).each(function(body){
                body.evolve(deltaTime);
            });
        }

    });

    return MassesAndSpringsSimulation;
});
