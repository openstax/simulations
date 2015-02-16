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
            color : Constants.BodyDefaults.COLOR
            // hung : false,       //a body is hung if it is attached to a spring
            // onWhichSpring : -1 // trying without onWhichSpring index
        },

        initialize: function(attributes, options) {

            this.mass = this.get('mass');   //mass in kg,
            this.x = this.get('x');         //x-y position on stage of (upper left corner of body)
            this.y = this.get('y');
            this.color = this.get('color');

            this.on('change:x', this.xChanged);
            this.on('change:y', this.yChanged);

        },

        hangOn: function(spring){
            // Simplified version of the following
            // //this.body.x = this.spring.x;  //position mass directly under spring
            // this.body.hung = true;
            // this.body.onWhichSpring = this.i;
            // this.body.spring = this.spring; //attach spring to body

            this.spring = spring;
            this.set('spring', spring);
        },


        unhang: function(){
            // Simplified version of the following
            // this.body.onWhichSpring = -1;
            // this.body.hung = false;
            // this.body.spring = undefined;

            this.hangOn(undefined);
        },

        xChanged: function(model, x){
            this.x = x;
        },

        yChanged: function(model, y){
            this.y = y;
        },

        isHung: function(){
            return !_.isUndefined(this.spring);
        }


    });

    return Body;
});
