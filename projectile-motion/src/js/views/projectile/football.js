define(function(require) {

    'use strict';
    
    var Football = require('models/projectile/football');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var FootballView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.FOOTBALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            return this.createProjectileSprite();
        },

        updateRotation: function(model, rotation) {
            this.projectileSprite.rotation = rotation;
            this.restingProjectileSprite.rotation = rotation;
        },

        calculateScale: function() {
            var targetSpriteHeight = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('diameter'))); // in pixels
            return targetSpriteHeight / this.projectileSprite.height;
        }

    }, {
        getModelClass: function() {
            return Football;
        }
    });

    return FootballView;
});