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
            this.updateSpring(spring);
            this.snapBodyTopCenter(this.spring.y2, this.spring.x);
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
            this.unset('center');
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
