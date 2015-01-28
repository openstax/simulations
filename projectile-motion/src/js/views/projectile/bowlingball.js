define(function(require) {

    'use strict';
    
    var Bowlingball = require('models/projectile/bowlingball');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var BowlingballView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.BOWLINGBALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.BOWLINGBALL_IMPACT);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.4;
            return sprite;
        }

    }, {
        getModelClass: function() {
            return Bowlingball;
        }
    });

    return BowlingballView;
});