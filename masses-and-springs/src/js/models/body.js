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
    var Body = Backbone.Model.extend({

        defaults: {
            mass : 0,
            x : 0,
            y : 0,
            spring : undefined, //a spring can be attached to a body;
            grabbed : false,    //a body is grabbed if view is being dragged by mouse
            color : Constants.BodyDefaults.COLOR,
            acceleration : Constants.SimSettings.GRAVITY_DEFAULT
        },

        initialize: function(attributes, options) {

            this.mass = this.get('mass');   //mass in kg,
            this.x = this.get('x');         //x-y position on stage of (upper left corner of body)
            this.y = this.get('y');
            this.color = this.get('color');
            this.acceleration = this.get('acceleration');

            this.rest(this.y);

            this.on('change:x', this.updateX);
            this.on('change:y', this.updateY);

            this.on('change:acceleration', this.updateAcceleration);
            this.on('change:resting', this.updateResting);

            this.on('change:top', this.updateTop);
        },

        hangOn: function(spring){
            this.updateSpring(spring);
        },

        unhang: function(){
            this.updateSpring(undefined);
            this.unsnap();
        },

        updateSpring: function(spring){
            this.spring = spring;
            this.set('spring', spring);
        },

        snapBodyTopCenter: function(top, center){
            this.set('center', center);
            this.set('top', top);
        },

        unsnap: function(){
            this.unset('center', false);
        },

        drop: function(dt){
            this.velocityY += this.acceleration * dt;
            this.y += this.velocityY * dt;
            this.set('y', this.y);
        },

        rest: function(restingY){
            this.resting = true;
            this.velocityY = 0;
            this.bounced = 0;

            if(restingY){
                this.restingY = restingY;                
            }
        },

        rebound: function(dt){

            if(this.bounced){
                this.trigger('hitGround');
                this.set('y', this.restingY);
                return;
            }

            this.velocityY = 0.5 * this.velocityY;
            this.y -= this.velocityY * dt;
            this.set('y', this.y);
            this.bounced ++;
        },

        updateAcceleration: function(model, acceleration){
            this.acceleration = acceleration;
        },

        updateX: function(model, x){
            this.x = x;
        },

        updateY: function(model, y){
            this.y = y;
        },

        updateTop: function(model, top){
            this.top = top;
        },

        updateResting: function(model, resting){
            this.resting = resting;
        },

        isHung: function(){
            return !_.isUndefined(this.spring);
        },

        evolve: function(dt){

            if(this.isHung()){
                return;
            }

            if(this.y < this.restingY){
                this.drop(dt);
            } else if (this.y == this.restingY){
                this.rest();
            } else {
                this.rebound(dt);
            }

        }


    });

    return Body;
});
