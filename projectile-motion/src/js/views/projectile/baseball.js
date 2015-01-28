define(function(require) {

    'use strict';
    
    var Baseball = require('models/projectile/baseball');

    var ProjectileView = require('views/projectile');

    var Assets = require('assets');

    var BaseballView = ProjectileView.extend({

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.BASEBALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },
        
        createRestingProjectileSprite: function() {
            return this.createProjectileSprite();
        }

    }, {
        getModelClass: function() {
            return Baseball;
        }
    });

    return BaseballView;
});