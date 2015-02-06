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

            this.initMass = this.get('mass');
            this.initPos  = this.pos.clone();
            this.initVel  = this.vel.clone();

            this.prePos = new Vector2();
            this.acc    = new Vector2();
            this.preAcc = new Vector2();
            this.pos_arr = [];
            this.acc_arr = [];

            this.on('change:mass', this.massChanged);
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

        setInitialMass: function(mass) {
            this.initMass = mass;
            this.mass = mass;
            this.set('mass', mass);
        },

        setInitialX: function(x) {
            this.initPos.x = x;
            this.pos.x = x;
            this.set('x', x);
        },

        setInitialY: function(y) {
            this.initPos.y = y;
            this.pos.y = y;
            this.set('y', y);
        },

        setInitialVX: function(vx) {
            this.initVel.x = vx;
            this.vel.x = vx;
            this.set('vx', vx);
        },

        setInitialVY: function(vy) {
            this.initVel.y = vy;
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
            this.mass = this.initMass;
            this.pos  = this.initPos.clone();
            this.vel  = this.initVel.clone();
            this.set('destroyedInCollision', false);
        }

    });

    return Body;
});
