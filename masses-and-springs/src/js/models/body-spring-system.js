define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var BodySpringSystem = Backbone.Model.extend({

        defaults: {
            period : 0, //period of system, zero until a mass is added
            b : 0,      //friction constant: F_drag = -b*v 
            velocity : 0,       //velocity of mass(body) always initialized to zero,
            deltaY : 0,
            maxY : 1.24
        },

        initialize: function(attributes, options) {
            this.spring = this.get('spring');
            this.deltaY = this.get('deltaY');   //displacement from equilibrium
            this.gravity = this.get('gravity');   // gravity
            this.b = this.get('b');
            this.velocity = this.get('velocity');
            this.period = this.get('period');
            this.maxY = this.get('maxY');
            // this.oldT = getTimer(); //each system needs to keep its own time
        },

        addBody: function(body) {

            if(this.spring.isSnagged()){
                console.log('This spring is already snagged!  Unsnag to hang this new mass.');
                return;
            }

            // attach body to system
            this.body = body;
            // Update children models body and spring with new state
            this.body.hangOn(this.spring);
            this.spring.hang(body);
            this.listenTo(this.body, 'change:spring', this.removeBody);

            this.period = Constants.SystemEquations.PERIOD(this.body.mass, this.spring.k);

            this.initializeEnergies();
            this.updateEnergies();
            // this.start();
        },

        removeBody: function(){

            if(!this.hasBody()){
                return;
            }

            this.body.unhang();
            this.spring.unhang();

            this.stopListening(this.body, 'change:spring');
            delete this.body;

            this.deltaY = 0;
            this.initializeEnergies();
        },

        hasBody: function(){
            return !_.isUndefined(this.body);
        },

        updateEnergies: function(solvedValues){

            solvedValues = _.extend({
                deltaDeltaY : 0,
                velocity2   : 0
            }, solvedValues);

            this.KE = Constants.SystemEquations.KINETIC_ENERGY(this.body.mass, this.velocity);
            this.PEelas = Constants.SystemEquations.ELASTIC_POTENTIAL_ENERGY(this.spring.k, this.deltaY);
            this.PEgrav = Constants.SystemEquations.GRAVITATIONAL_POTENTIAL_ENERGY(this.body.mass, this.gravity, this.maxY - this.spring.y2);
            this.Q += Constants.SystemEquations.DELTA_THERMAL(solvedValues.deltaDeltaY, this.body.mass, this.b, solvedValues.velocity2);

            this.Etot = Constants.SystemEquations.TOTAL_ENERGY(this.KE, this.PEelas, this.PEgrav, this.Q);
        },

        initializeEnergies: function(){
            this.KE = 0;    //all energy set to zero
            this.PEelas = 0;
            this.PEgrav = 0;
            this.Q = 0;
            this.Etot = this.KE + this.PEelas + this.PEgrav + this.Q;
        },

        resetEnergy : function(){
            if(this.spring.isSnagged()){
                this.updateEnergies();
            }else{
                this.initializeEnergies();
            }
        },

        evolve : function(dt){

            var solvedValues;

            if(!this.spring.isSnagged()){
                return;
            } else if(this.body.grabbed){

                this.velocity = 0;
                this.Q = 0;

                this.deltaY = _calculateRestingDeltaY();
                this.spring.updateY2(this.deltaY);

                this.updateEnergies();
            } else {

                if(dt > this.period / 15){
                    dt = this.period / 15;
                }

                solvedValues = this.stepForwardVelocityVerlet(dt);

                // weird, don't know if this needs to be fixed, but the order
                // of when the spring y2 and the body position updates affects
                // whether the spring and body look attached when animating...
                this.spring.updateY2(this.deltaY);
                this.body.set('top', this.spring.y2);

                this.updateEnergies(solvedValues);
            }

        },

        stepForwardVelocityVerlet: function(dt){

            var solvedValues = {};

            // Solve for initial acceleration based on system properties
            solvedValues.acceleration = Constants.SystemEquations.ACCELERATION(this.gravity, this.spring.k, this.body.mass, this.deltaY, this.b, this.velocity);

            // Solve for displacement and update delta of spring from resting length
            solvedValues.deltaDeltaY = Constants.SystemEquations.DISPLACEMENT(this.velocity, dt, solvedValues.acceleration);
            this.deltaY = this.deltaY + solvedValues.deltaDeltaY;

            // Solve for final velocity at the end of time-step and use this to calculate final acceleration
            solvedValues.velocity2 = Constants.SystemEquations.VELOCITY2(this.velocity, solvedValues.acceleration, dt);
            solvedValues.acceleration2 = Constants.SystemEquations.ACCELERATION(this.gravity, this.spring.k, this.body.mass, this.deltaY, this.b, solvedValues.velocity2);

            // Approximate velocity for time-step based on an average of initial and final solvedValues.acceleration
            solvedValues.averageAcceleration = (solvedValues.acceleration2 + solvedValues.acceleration) / 2;
            this.velocity = Constants.SystemEquations.VELOCITY2(this.velocity, solvedValues.averageAcceleration, dt);

            return solvedValues;
        },

        _calculateRestingDeltaY : function(){
            return this.body.y - this.spring.y1 - this.spring.restL;
        }

    });

    return BodySpringSystem;
});
