define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Vector2  = require('common/math/vector2');

    var Body = Backbone.Model.extend({

        defaults: {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            mass: 1
        },

        initialize: function(attributes, options) {
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
        },

        updateAttributes: function() {
            this.set({
                x: this.pos.x,
                y: this.pos.y,
                vx: this.vel.x,
                vy: this.vel.y,
                mass: this.mass
            });
        }

    });

    return Body;
});
