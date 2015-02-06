define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    var Body = Backbone.Model.extend({

        defaults: {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            mass: 1,
            destroyedInCollision: false
        },

        initialize: function(attributes, options) {
            this.massChanged(this, this.get('mass'));

            this.pos = new Vector2(this.get('x'), this.get('y'));
            this.vel = new Vector2(this.get('vx'), this.get('vy'));
            this.mass = this.get('mass');

            this.set('initMass', this.get('mass'));
            this.set('initX', this.pos.x);
            this.set('initY', this.pos.y);
            this.set('initVX', this.vel.x);
            this.set('initVY', this.vel.y);

            this.prePos = new Vector2();
            this.acc    = new Vector2();
            this.preAcc = new Vector2();
            this.pos_arr = [];
            this.acc_arr = [];

            this.on('change:mass',     this.massChanged);

            // These functions assume they aren't being called after the sim has started
            this.on('change:initMass', this.initMassChanged);
            this.on('change:initX',    this.initXChanged);
            this.on('change:initY',    this.initYChanged);
            this.on('change:initVX',   this.initVXChanged);
            this.on('change:initVY',   this.initVYChanged);
        },

        massChanged: function(model, mass) {
            if (mass < Constants.MIN_BODY_MASS)
                this.set('mass', Constants.MIN_BODY_MASS);

            this.mass = this.get('mass');
        },

        updateAttributes: function() {
            this.set({
                x: this.pos.x,
                y: this.pos.y,
                vx: this.vel.x,
                vy: this.vel.y,
                mass: this.mass
            });
        },

        initMassChanged: function(model, mass) {
            this.mass = mass;
            this.set('mass', mass);
        },

        initXChanged: function(model, x) {
            this.pos.x = x;
            this.set('x', x);
        },

        initYChanged: function(model, y) {
            this.pos.y = y;
            this.set('y', y);
        },

        initVXChanged: function(model, vx) {
            this.vel.x = vx;
            this.set('vx', vx);
        },

        initVYChanged: function(model, vy) {
            this.vel.y = vy;
            this.set('vy', vy);
        },

        destroyInCollision: function() {
            this.mass = Constants.MIN_BODY_MASS;
            this.pos.set(3000, 0);
            this.vel.set(10, 0);
            this.set('destroyedInCollision', true);
        },

        reset: function() {
            this.mass  = this.get('initMass');
            this.pos.x = this.get('initX');
            this.pos.y = this.get('initY');
            this.vel.x = this.get('initVX');
            this.vel.y = this.get('initVY');
            this.set('destroyedInCollision', false);
        }

    });

    return Body;
});
