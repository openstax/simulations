define(function(require) {

    'use strict';
    
    var AdultHuman = require('models/projectile/adult-human');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var AdultHumanView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.HUMAN);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.HUMAN_IMPACT);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },

        calculateScale: function() {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.model.get('diameter')); // in pixels
            targetSpriteWidth *= 2;
            return targetSpriteWidth / this.projectileSprite.width;
        }

    }, {
        getModelClass: function() {
            return AdultHuman;
        }
    });

    return AdultHumanView;
});