define(function(require) {

    'use strict';
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

    /**
     * A view that represents a cannon model
     */
    var ProjectileView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:x', this.updateX);
            this.listenTo(this.model, 'change:y', this.updateY);

            this.updateMVT(this.mvt);
        },

        /**
         * Override this to draw different kinds of projectiles.
         */
        initGraphics: function() {
            var projectileSprite = Assets.createSprite(Assets.Images.CANNON_BALL);
            projectileSprite.anchor.x = projectileSprite.anchor.y = 0.5;
            this.projectileSprite = projectileSprite;

            this.displayObject.addChild(projectileSprite);
        },

        updateX: function(model, x) {
            this.displayObject.x = this.mvt.modelToViewX(x);
        },

        updateY: function(model, y) {
            this.displayObject.y = this.mvt.modelToViewY(y);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.displayObject.scale.x = this.displayObject.scale.y = this.calculateScale();
            console.log(this.displayObject.scale.x);

            this.updateX(this.model, this.model.get('x'));
            this.updateY(this.model, this.model.get('y'));
        },

        calculateScale: function() {
            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.model.get('diameter')); // in pixels
            return targetSpriteWidth / this.projectileSprite.width;
        }

    });

    return ProjectileView;
});