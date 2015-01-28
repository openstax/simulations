define(function(require) {

    'use strict';
    
    var Buick = require('models/projectile/buick');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var BuickView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.BUICK);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.BUICK_IMPACT);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },

        calculateScale: function() {
            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('diameter'))); // in pixels
            return targetSpriteHeight / 400;
        }

    }, {
        getModelClass: function() {
            return Buick;
        }
    });

    return BuickView;
});