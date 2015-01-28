define(function(require) {

    'use strict';
    
    var Pumpkin = require('models/projectile/pumpkin');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var PumpkinView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.PUMPKIN);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.PUMPKIN_IMPACT);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        }

    }, {
        getModelClass: function() {
            return Pumpkin;
        }
    });

    return PumpkinView;
});