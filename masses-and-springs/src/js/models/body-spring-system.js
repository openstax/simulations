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

            this.initializeEnergies();

            this.on('change:gravity', this.updateGravity);
            this.on('change:b', this.updateFriction);
        },

        addBody: function(body) {

            if(this.spring.isSnagged()){
                console.log('This spring is already snagged!  Unsnag to hang this new mass.');
                return;
            }

            // attach body to system
            this.set('body', body);
            this.body = body;
            // Update children models body and spring with new state
            this.body.hangOn(this.spring);
            this.spring.hang(body);
            this.listenTo(this.body, 'change:spring', this.removeBody);

            this.period = Constants.SystemEquations.PERIOD(this.body.mass, this.spring.k);

            this.resetEnergies();
            this.updateEnergies();
        },

        removeBody: function(){

            if(!this.hasBody()){
                return;
            }

            this.body.unhang();

            this.spring.unhang();

            this.stopListening(this.body, 'change:spring');
            delete this.body;
            this.unset('body', {silent: true});

            this.deltaY = 0;
            this.resetEnergies();
        },

        hasBody: function(){
            return !_.isUndefined(this.body);
        },

        updateEnergies: function(solvedValues){

            solvedValues = _.extend({
                deltaDeltaY : 0,
                velocity2   : 0
            }, solvedValues);

            this.set('KE', Constants.SystemEquations.KINETIC_ENERGY(this.body.mass, this.velocity));
            this.set('PEelas', Constants.SystemEquations.ELASTIC_POTENTIAL_ENERGY(this.spring.k, this.deltaY));
            this.set('PEgrav', Constants.SystemEquations.GRAVITATIONAL_POTENTIAL_ENERGY(this.body.mass, this.gravity, this.maxY - this.spring.y2));
            this.set('Q', this.get('Q') + Constants.SystemEquations.DELTA_THERMAL(solvedValues.deltaDeltaY, this.body.mass, this.b, solvedValues.velocity2));

            this.set('Etot', Constants.SystemEquations.TOTAL_ENERGY(this.get('KE'), this.get('PEelas'), this.get('PEgrav'), this.get('Q')));
        },

        updateGravity: function(model, gravity){
            this.gravity = gravity;
        },

        updateFriction: function(model, friction){
            this.b = friction;
        },

        resetEnergies: function(){
            this.set('KE',0);    //all energy set to zero
            this.set('PEelas',0);
            this.set('PEgrav',0);
            this.set('Q',0);
            this.set('Etot', this.get('KE') + this.get('PEelas') + this.get('PEgrav') + this.get('Q'));
        },

        initializeEnergies : function(){
            this.resetEnergies();

            this.set({bars: [{
                    linkTo : 'KE',
                    label : 'KE'
                },{
                    linkTo : 'PEgrav',
                    label : 'PE<sub>grav</sub>'
                },{
                    linkTo : 'PEelas',
                    label : 'PE<sub>elas</sub>'
                },{
                    linkTo : 'Q',
                    label : 'Thermal'
                },{
                    linkTo : 'Etot',
                    label : 'Total',
                    class : 'total'
                }
            ]});

            _.each(this.get('bars'), this._initializeEnergy, this);
        },

        _initializeEnergy : function(energy){
            energy.value = this.get(energy.linkTo);
            this.on('change:' + energy.linkTo, this.updateEnergyBars);
        },

        updateEnergyBars : function(energy){
            var energyChanged = _.keys(energy.changed)[0];
            var bar = _.findWhere(this.get('bars'), {linkTo : energyChanged});
            bar.value = this.get(energyChanged);

            this.trigger('change:bar', bar);
        },

        evolve : function(dt){

            var solvedValues;

            if(!this.spring.isSnagged()){
                return;
            } else if(this.body.grabbed){

                this.velocity = 0;
                this.set('Q', 0);

                this.deltaY = this._calculateRestingDeltaY();
                this.spring.updateY2ByDelta(this.deltaY);

                this.updateEnergies();
            } else {

                if(dt > this.period / 15){
                    dt = this.period / 15;
                }

                solvedValues = this.stepForwardVelocityVerlet(dt);

                // weird, don't know if this needs to be fixed, but the order
                // of when the spring y2 and the body position updates affects
                // whether the spring and body look attached when animating...
                this.spring.updateY2ByDelta(this.deltaY);
                this.body.snapBodyTopCenter(this.spring.y2, this.spring.x);

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
            return this.body.get('top') - this.spring.y1 - this.spring.restL;
        }

    });

    return BodySpringSystem;
});
