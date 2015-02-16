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
            scaledMaxY : 1
        },

        initialize: function(attributes, options) {

            this.spring = this.get('spring');
            this.deltaY = this.get('deltaY');   //displacement from equilibrium
            this.gravity = this.get('gravity');   // gravity
            this.b = this.get('b');
            this.velocity = this.get('velocity');
            this.period = this.get('period');
            this.scaledMaxY = this.get('scaledMaxY');
            // this.i = this.get('i');         //Kludge: index labeling instance for use setInterval function

            // this.oldT = getTimer(); //each system needs to keep its own time


        },

        addBody: function(body) {

            if(this.spring.isSnagged()){
                console.log('This spring is already snagged!  Unsnag to hang this new mass.');
                return;
            }

            this.body = body;   //attach body to system
            this.period = Constants.SystemEquations.PERIOD(this.body.mass, this.spring.k);

            // Update children models body and spring with new state
            this.body.hangOn(this.spring);
            this.spring.hang(body);

            //begin evolution
            this.start();

            this.Q = 0; //heat
            this.updateEnergies();
            this.listenTo(this.body, 'change:spring', this.removeBody);
        },

        removeBody: function(){

            this.body.unhang();
            this.spring.unhang();
            this.stop();

            this.deltaY = 0;
            this.initializeEnergies();
        },

        updateEnergies: function(){
            this.KE = Constants.SystemEquations.KINETIC_ENERGY(this.body.mass, this.velocity);
            this.PEelas = Constants.SystemEquations.ELASTIC_POTENTIAL_ENERGY(this.spring.k, this.deltaY);
            this.PEgrav = Constants.SystemEquations.GRAVITATIONAL_POTENTIAL_ENERGY(this.body.mass, this.gravity, this.scaledMaxY - this.spring.y2);
            this.Etot = Constants.SystemEquations.TOTAL_ENERGY(this.KE, this.PEelas, this.PEgrav, this.Q);
        },

        initializeEnergies: function(){
            this.KE = 0;    //all energy set to zero
            this.PEelas = 0;
            this.PEgrav = 0;
            this.Q = 0;
            this.Etot = this.KE + this.PEelas + this.PEgrav + this.Q;
        },

        start : function(){
            // TODO THIS IS TEMPORARRRYYY.
            // and bad.
            // just for the satisfaction of something animating for now.
            var that = this;
            this.timeInt = setInterval(function(){
                that.evolve(100);
            }, 50);
        },

        stop : function(){

            clearInterval(this.timeInt);

        },

        resetEnergy : function(){
            if(this.spring.isSnagged()){
                this.updateEnergies();
            }else{
                this.initializeEnergies();
            }
        },

        evolve : function(dt){

            var acceleration, deltaDeltaY, velocity2, acceleration2, averageAcceleration;

            if(!this.spring.isSnagged()){
                this.deltaY = 0;
                return;
            }

            if(this.body.grabbed){
                this.deltaY = _calculateRestingDeltaY();
                this.spring.updateY2(this.deltaY);

                this.velocity = 0;
                this.Q = 0;

                this.updateEnergies();

                // this.oldT = getTime();
            }

            if(!this.body.grabbed){
                // The velocity verlet will be pulled out to the main simulation model.

                // newT = getTimer();
                // var dt = frameRate * (newT - this.oldT) / 1000;
                // this.oldT = newT;

                if(dt > this.period / 15){
                    dt = this.period / 15;
                }
                // Would like to better organize this logic at some point
                // Simple Euler-Cromer
                acceleration = Constants.SystemEquations.ACCELERATION(this.gravity, this.spring.k, this.body.mass, this.deltaY, this.b, this.velocity);
                deltaDeltaY = Constants.SystemEquations.DISPLACEMENT(this.velocity, dt, acceleration);
                this.deltaY = this.deltaY + deltaDeltaY;

                velocity2 = Constants.SystemEquations.VELOCITY2(this.velocity, acceleration, dt);
                acceleration2 = Constants.SystemEquations.ACCELERATION(this.gravity, this.spring.k, this.body.mass, this.deltaY, this.b, velocity2);

                averageAcceleration = (acceleration2 + acceleration) / 2;
                // Approximate new velocity based on an average of initial and final acceleration
                this.velocity = Constants.SystemEquations.VELOCITY2(this.velocity, averageAcceleration, dt);

                this.spring.updateY2(this.deltaY);
                // this.body.y = this.spring.y2;
                this.body.set('top', this.spring.y2);

                this.Q += Constants.SystemEquations.DELTA_THERMAL(deltaDeltaY, this.body.mass, this.b, velocity2);

                this.updateEnergies();
            }

        },

        _calculateRestingDeltaY : function(){
            return this.body.y - this.spring.y1 - this.spring.restL;
        }

    });

    return BodySpringSystem;
});
