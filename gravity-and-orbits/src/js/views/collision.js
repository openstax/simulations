define(function(require) {

    'use strict';

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var range    = require('common/math/range');

    var Satellite = require('models/body/satellite');

    var Assets    = require('assets');
    var Constants = require('constants');

    var CollisionView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.position = new Vector2(options.smallerBody.get('position'));

            var diameter = options.smallerBody.getDiameter();
            this.diameterRange = range({
                min: diameter * 1,
                max: diameter * 1.8
            });

            // Special case for the Satellite
            if (options.smallerBody instanceof Satellite) {
                this.diameterRange.min *= 1000;
                this.diameterRange.max *= 1000;
            }

            /*
             * TODO: This would look much better as a particle system. The
             *   particles would be the color of the body (a model attribute)
             *   and would be shot out in a fan shape perpendicular to the
             *   surface of the larger body at the time of collision (or the
             *   direction of the vector going from the center of the larger
             *   one to the center of the smaller one).  All the particles
             *   would also have a portion of the larger body's velocity
             *   added to the particles' initial velocity so that they kind
             *   of move with the large body but are independent.
             */

            this.animationFinished = false;

            this.initGraphics();
        },

        initGraphics: function() {
            var explosionSprite = Assets.createSprite(Assets.Images.EXPLOSION);
            explosionSprite.anchor.x = explosionSprite.anchor.y = 0.5;
            explosionSprite.rotation = Math.PI * 2 * Math.random();

            this.explosionSprite = explosionSprite;
            this.imageWidth = explosionSprite.width;

            this.animate(0);
            this.updateMVT(this.mvt);

            this.displayObject.addChild(explosionSprite);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var viewPosition = this.mvt.modelToView(this.position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;

            var targetSpriteWidth = this.mvt.modelToViewDeltaX(this.diameterRange.max);
            var scale = targetSpriteWidth / this.imageWidth;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;
        },

        update: function(time, deltaTime) {
            if (this.time === undefined)
                this.time = 0;
            else
                this.time += deltaTime;

            this.animate(this.time);

            if (this.time > CollisionView.ANIMATION_DURATION)
                this.animationFinished = true;
        },

        animate: function(time) {
            var lerpValue;
            var percentTimeElapsed = time / CollisionView.ANIMATION_DURATION;

            // Animate scale
            if (percentTimeElapsed < CollisionView.ANIMATION_MIDPOINT)
                lerpValue = percentTimeElapsed / CollisionView.ANIMATION_MIDPOINT;
            else
                lerpValue = 1 - ((percentTimeElapsed - CollisionView.ANIMATION_MIDPOINT) / (1 - CollisionView.ANIMATION_MIDPOINT));

            var targetDiameter = this.diameterRange.lerp(lerpValue);
            var scale = targetDiameter / this.diameterRange.max;

            // Animate alpha
            var alpha;
            if (percentTimeElapsed < CollisionView.ANIMATION_MIDPOINT)
                alpha = 1;
            else
                alpha = lerpValue;

            // Animate rotation
            //var rotation = CollisionView.ANIMATION_ROTATION * percentTimeElapsed;

            this.explosionSprite.scale.x = scale;
            this.explosionSprite.scale.y = scale;
            this.explosionSprite.alpha = alpha;
            //this.explosionSprite.rotation = rotation;
        },

        finished: function() {
            return this.animationFinished;
        }

    }, Constants.CollisionView);

    return CollisionView;
});