define(function(require) {

    'use strict';
    
    var Golfball = require('models/projectile/golfball');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var GolfballView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.GOLFBALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            return this.createProjectileSprite();
        }

    }, {
        getModelClass: function() {
            return Golfball;
        }
    });

    return GolfballView;
});