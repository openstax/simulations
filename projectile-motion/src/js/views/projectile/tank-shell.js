define(function(require) {

    'use strict';
    
    var TankShell = require('models/projectile/tank-shell');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var TankShellView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.TANK_SHELL);
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
            return TankShell;
        }
    });

    return TankShellView;
});