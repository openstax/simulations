define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');
    var PositionableObject = require('common/models/positionable-object');

    var AlphaParticle = PositionableObject.extend({

        defaults: {
          speed: 0,
          defaultSpeed: 0,
          position: {x: 0, y: 0},
          orientation: Math.PI / 2
        },

        // Alpha Particle Movement from:
        // https://github.com/phetsims/rutherford-scattering/blob/master/js/plumpuddingatom/model/PlumPuddingAtomModel.js#L34-L44
        move: function(deltaTime) {
          var speed = this.get('speed');
          var distance = speed * deltaTime;
          var direction = this.get('orientation');
          var dx = Math.cos( direction ) * distance;
          var dy = Math.sin( direction ) * distance;
          var position = this.get('position');
          var x = position.x + dx;
          var y = position.y + dy;

          this.setPosition(x, y);
        }

    }, {});

    return AlphaParticle;
});
