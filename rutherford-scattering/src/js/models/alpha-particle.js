define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');

    var AlphaParticle = Backbone.Model.extend({

        defaults: {
          speed: 0,
          defaultSpeed: 0,
          position: {x: 0, y: 0},
          orientation: Math.PI / 2
        }

    }, {});

    return AlphaParticle;
});
