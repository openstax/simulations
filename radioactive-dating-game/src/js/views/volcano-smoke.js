define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView  = require('common/v3/app/app');
    var PixiView = require('common/v3/pixi/view');
    var range    = require('common/math/range');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');
    var Assets = require('assets');

    /**
     * Creates smoke particles for the volcano
     */
    var VolcanoSmokeView = PixiView.extend({

        /**
         * Initializes the new VolcanoSmokeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.time = 0;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var smokeParticleTexture = Assets.Texture(Assets.Images.SMOKE_PARTICLE);

            this.activeSmokeParticles = [];
            this.dormantSmokeParticles = [];

            var particle;

            // Smoke particles
            for (var i = 0; i < VolcanoSmokeView.NUM_PARTICLES; i++) {
                particle = new PIXI.Sprite(smokeParticleTexture);
                particle.visible = false;
                particle.anchor.x = particle.anchor.y = 0.5;
                particle.velocity = new Vector2();

                this.displayObject.addChild(particle);
                this.dormantSmokeParticles.push(particle);
            }

            this.updateMVT(this.mvt);
        },

        update: function(time, deltaTime, paused) {
            if (!paused)
                this.updateSmokeParticles(time, deltaTime);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            if (AppView.windowIsShort()) {
                this.particleRadiusRange = range({
                    min: 16,
                    max: 56
                });
            }
            else {
                this.particleRadiusRange = range({
                    min: 16,
                    max: 70
                });
            }
        },

        updateSmokeParticles: function(time, deltaTime) {
            // Update internal time
            this.time += deltaTime;

            if (this._emittingParticles) {
                this._emissionTimer += deltaTime;
                while (this._emissionTimer >= VolcanoSmokeView.PARTICLE_EMISSION_FREQUENCY) {
                    this._emissionTimer -= VolcanoSmokeView.PARTICLE_EMISSION_FREQUENCY;
                    this.emitSmokeParticle();
                }
            }

            var particle;
            var percentLifeLeft;
            var percentLifeSpent;
            var radius;
            for (var i = this.activeSmokeParticles.length - 1; i >= 0; i--) {
                particle = this.activeSmokeParticles[i];

                // Clean up dead particles
                if (this.time >= particle.lifeEndsAt) {
                    particle.visible = false;
                    this.activeSmokeParticles.splice(i, 1);
                    this.dormantSmokeParticles.push(particle);
                }

                // Move particles
                particle.x += particle.velocity.x * deltaTime;
                particle.y += particle.velocity.y * deltaTime;

                // Change velocity to drift
                particle.velocity.rotate(particle.angularAcceleration * deltaTime);

                // To use in linear interpolation functions
                percentLifeLeft = ((particle.lifeEndsAt - this.time) / particle.timeToLive);
                percentLifeSpent = 1 - percentLifeLeft;

                // Grow particles
                radius = this.particleRadiusRange.lerp(Math.min(percentLifeSpent, 1));
                particle.scale.x = particle.scale.y = radius / (particle.texture.width / 2);

                particle.rotation += -1 * deltaTime;

                // Fade particles out when they reach the end of their lives
                if (percentLifeLeft < (1 - VolcanoSmokeView.PARTICLE_FADE_POINT))
                    particle.alpha = (percentLifeLeft / (1 - VolcanoSmokeView.PARTICLE_FADE_POINT)) * VolcanoSmokeView.PARTICLE_ALPHA;  
            }
        },
        
        emitSmokeParticle: function() {
            if (!this.dormantSmokeParticles.length) {
                console.log('not enough particles')
                return null;
            }

            var particle = this.dormantSmokeParticles.pop();
            if (particle) {
                var scale = this.particleRadiusRange.min / (particle.texture.width / 2);
                var angle = -Math.PI / 2 + VolcanoSmokeView.PARTICLE_SPREAD_ANGLE_RANGE.random();

                particle.x = 0;
                particle.y = 0;
                particle.scale.x = particle.scale.y = scale;
                particle.alpha = VolcanoSmokeView.PARTICLE_ALPHA;
                particle.visible = true;
                particle.timeToLive = VolcanoSmokeView.PARTICLE_LIFE_SPAN.random();
                particle.lifeEndsAt = this.time + particle.timeToLive;
                particle.velocity.set(VolcanoSmokeView.PARTICLE_VELOCITY_RANGE.random(), 0).rotate(angle);
                particle.rotation = Math.random() * Math.PI;
                var direction = (particle.velocity.angle() > Math.PI * 1.5) ? 1 : -1;
                particle.angularAcceleration = Math.random() * VolcanoSmokeView.PARTICLE_MAX_ANGULAR_ACCELERATION * direction;

                this.displayObject.removeChild(particle);
                this.displayObject.addChildAt(particle, 0);

                this.activeSmokeParticles.push(particle);
            }

            return particle;
        },

        startSmoking: function() {
            this._emittingParticles = true;
            this._emissionTimer = 0;
        },

        stopSmoking: function() {
            this._emittingParticles = false;
        },

        clearSmoke: function() {
            var particle;
            for (var i = this.activeSmokeParticles.length - 1; i >= 0; i--) {
                particle = this.activeSmokeParticles[i];
                particle.visible = false;
                this.activeSmokeParticles.splice(i, 1);
                this.dormantSmokeParticles.push(particle);
            }
        }

    }, Constants.VolcanoSmokeView);


    return VolcanoSmokeView;
});