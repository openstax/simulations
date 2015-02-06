define(function(require) {

    'use strict';

    var PIXI      = require('pixi');
    var PixiView  = require('common/pixi/view');
    var Assets    = require('assets');
    var Constants = require('constants');

    var CollisionView = PixiView.extend({

        initialize: function(options) {
            this.position = options.position;
            this.mvt = options.mvt;

            this.animationFinished = false;

            this.initGraphics();
        },

        initGraphics: function() {
            var explosionSprite = Assets.createSprite(Assets.Images.EXPLOSION);
            explosionSprite.anchor.x = explosionSprite.anchor.y = 0.5;
            this.explosionSprite = explosionSprite;
            this.imageWidth = explosionSprite.width;

            this.displayObject.addChild(explosionSprite);

            this.updateMVT(this.mvt);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var viewPosition = this.mvt.modelToView(this.position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;

            var targetSpriteWidth = this.mvt.modelToViewDeltaX(CollisionView.END_COLLISION_DIAMETER);
            var scale = targetSpriteWidth / this.imageWidth;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;
        },

        update: function(time, deltaTime, paused) {
            if (paused)
                return;

            if (this.time === undefined)
                this.time = 0;
            else {
                this.time += deltaTime;

                if (this.time > 2)
                    this.animationFinished = true;
            }
        },

        finished: function() {
            return this.animationFinished;
        }

    }, Constants.CollisionView);

    return CollisionView;
});