define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');
    var Vector2 = require('common/math/vector2');

    var AlphaParticle = Backbone.Model.extend({

        defaults: {
          speed: 0,
          defaultSpeed: 0,
          position: {x: 0, y: 0},
          orientation: Math.PI / 2,
          positions: []
        },

        move: function(deltaTime) {
          var speed = this.get('speed');
          var distance = speed * deltaTime;
          var direction = this.get('orientation');
          var dx = Math.cos( direction ) * distance;
          var dy = Math.sin( direction ) * distance;
          var position = this.get('position');
          var x = position.x + dx;
          var y = position.y + dy;

          this.set('position', new Vector2( x, y ));
        }

    }, {});

    return AlphaParticle;
});
