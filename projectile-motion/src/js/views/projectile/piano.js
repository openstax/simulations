define(function(require) {

    'use strict';
    
    var Piano = require('models/projectile/piano');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var PianoView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.PIANO);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.PIANO_IMPACT);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        }

    }, {
        getModelClass: function() {
            return Piano;
        }
    });

    return PianoView;
});