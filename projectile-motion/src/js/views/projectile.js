define(function(require) {

    'use strict';
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Projectile = require('models/projectile');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

    var ProjectileView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:x', this.updateX);
            this.listenTo(this.model, 'change:y', this.updateY);
            this.listenTo(this.model, 'change:atRest', this.updateRestState);
            this.listenTo(this.model, 'change:rotation', this.updateRotation);

            this.updateMVT(this.mvt);
        },

        /**
         * Override this to draw different kinds of projectiles.
         */
        initGraphics: function() {
            var projectileSprite = this.createProjectileSprite();
            
            this.projectileSprite = projectileSprite;
            this.displayObject.addChild(projectileSprite);

            var restingProjectileSprite = this.createRestingProjectileSprite();
            restingProjectileSprite.visible = false;
            this.restingProjectileSprite = restingProjectileSprite;
            this.displayObject.addChild(restingProjectileSprite);
        },

        createProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.CANNON_BALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },

        createRestingProjectileSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.CANNON_BALL);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            return sprite;
        },

        updateRestState: function(model, atRest) {
            this.projectileSprite.visible = !atRest;
            this.restingProjectileSprite.visible = atRest;
        },

        updateRotation: function(model, rotation) {},

        updateX: function(model, x) {
            this.displayObject.x = this.mvt.modelToViewX(x);
        },

        updateY: function(model, y) {
            this.displayObject.y = this.mvt.modelToViewY(y);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.displayObject.scale.x = this.displayObject.scale.y = this.calculateScale();

            this.updateX(this.model, this.model.get('x'));
            this.updateY(this.model, this.model.get('y'));
        },

        calculateScale: function() {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.model.get('diameter')); // in pixels
            return targetSpriteWidth / this.projectileSprite.width;
        }

    }, {
        getModelClass: function() {
            return Projectile;
        }
    });

    return ProjectileView;
});