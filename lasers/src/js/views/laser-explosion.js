define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView          = require('common/v3/app/app');
    var PixiView         = require('common/v3/pixi/view');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var range            = require('common/math/range');
    var Vector2          = require('common/math/vector2');
    var Rectangle        = require('common/math/rectangle');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var Assets = require('assets');

    var NUM_PARTICLES = 600;
    var PARTICLE_ALPHA = 1;
    var PARTICLE_INITIAL_VELOCITY_RANGE = range({ min: 200, max: 300 });
    var PARTICLE_INITIAL_VELOCITY_2_RANGE = range({ min: 300, max: 800});
    var PARTICLE_LIFE_SPAN = range({ min: 1, max: 3 });
    var PARTICLE_EMISSION_FREQUENCY = 0.001;
    var PARTICLE_FADE_POINT = 0.6;

    var TEXT_FADE_TIME = 1;

    /**
     * Animates a particle explosion for the laser
     */
    var LaserExplosionView = PixiView.extend({

        /**
         * Initializes the new LaserExplosionView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.repeating = false;
            this.time = 0;

            // Cached objects
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.simulation, 'change:exploded', this.explodedChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.text = new PIXI.Text('Your laser blew up!\nIt was producing more power\nthan it could handle.', {
                fill: '#FF3838',
                font: '22px Helvetica Neue',
                align: 'center'
            });
            this.text.resolution = this.getResolution();
            this.text.anchor.x = 0.5;
            this.text.anchor.y = 0.5;
            this.text.visible = false;

            this.displayObject.addChild(this.text);

            var texture = Assets.Texture(Assets.Images.EXPLOSION_PARTICLE);

            this.activeParticles = [];
            this.dormantParticles = [];
            this.usedParticles = [];

            var particle;

            // Create particles
            for (var i = 0; i < NUM_PARTICLES; i++) {
                particle = new PIXI.Sprite(texture);
                particle.visible = false;
                particle.anchor.x = particle.anchor.y = 0.5;
                particle.velocity = new Vector2();
                particle.acceleration = new Vector2();
                particle.blendMode = PIXI.BLEND_MODES.SCREEN;

                this.displayObject.addChild(particle);
                this.dormantParticles.push(particle);
            }

            this.updateMVT(this.mvt);
        },

        update: function(time, deltaTime, paused) {
            this.updateParticles(time, deltaTime);
            this.updateText(time, deltaTime);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.startingBounds = new Rectangle(this.mvt.modelToView(this.simulation.tube.getBounds()));
            this.center = this.startingBounds.center();

            if (AppView.windowIsShort()) {
                this.particleRadiusRange = range({
                    min: 10,
                    max: 30
                });
            }
            else {
                this.particleRadiusRange = range({
                    min: 15,
                    max: 45
                });
            }

            this.text.x = this.center.x;
            this.text.y = this.center.y;
        },

        updateText: function(time, deltaTime) {
            if (!this._emittingParticles) 
                return;

            this._textFadeTimer += deltaTime;
            var alpha = Math.min(this._textFadeTimer / TEXT_FADE_TIME, 1);
            this.text.alpha = alpha;
        },

        updateParticles: function(time, deltaTime) {
            // Update internal time
            this.time += deltaTime;

            if (this._emittingParticles) {
                this._emissionTimer += deltaTime;
                while (this._emissionTimer >= PARTICLE_EMISSION_FREQUENCY) {
                    this._emissionTimer -= PARTICLE_EMISSION_FREQUENCY;
                    this.emitParticle();
                }
            }

            var particle;
            var percentLifeLeft;
            var percentLifeSpent;
            var radius;
            for (var i = this.activeParticles.length - 1; i >= 0; i--) {
                particle = this.activeParticles[i];

                // Clean up dead particles
                if (this.time >= particle.lifeEndsAt) {
                    particle.visible = false;
                    this.activeParticles.splice(i, 1);
                    if (this.repeating)
                        this.dormantParticles.push(particle);
                    else
                        this.usedParticles.push(particle);
                }

                // Move particles
                particle.x += particle.velocity.x * deltaTime;
                particle.y += particle.velocity.y * deltaTime;

                // Change velocity to drift
                particle.velocity.add(this._vec.set(particle.acceleration).scale(deltaTime));

                // To use in linear interpolation functions
                percentLifeLeft = ((particle.lifeEndsAt - this.time) / particle.timeToLive);
                percentLifeSpent = 1 - percentLifeLeft;

                // Grow particles
                radius = this.particleRadiusRange.lerp(1 - Math.min(percentLifeSpent, 1));
                particle.scale.x = particle.scale.y = radius / (particle.texture.width / 2);

                particle.tint = Colors.interpolateHexInteger(0x000000, this.startingColor, percentLifeSpent);

                // Fade particles out when they reach the end of their lives
                if (percentLifeLeft < (1 - PARTICLE_FADE_POINT)) {
                    var t = (percentLifeLeft / (1 - PARTICLE_FADE_POINT));
                    particle.alpha = t * PARTICLE_ALPHA;
                }
            }
        },
        
        emitParticle: function() {
            if (!this.dormantParticles.length)
                return null;

            var particle = this.dormantParticles.pop();
            if (particle) {
                particle.x = Math.random() * this.startingBounds.w + this.startingBounds.x;
                particle.y = Math.random() * this.startingBounds.h + this.startingBounds.y;

                var scale = this.particleRadiusRange.max / (particle.texture.width / 2);
                var angle = this._vec
                    .set(particle.x, particle.y)
                    .sub(this.center)
                    .angle();

                particle.scale.x = particle.scale.y = scale;
                particle.alpha = PARTICLE_ALPHA;
                particle.tint = this.startingColor;
                particle.visible = true;
                particle.timeToLive = PARTICLE_LIFE_SPAN.random();
                particle.lifeEndsAt = this.time + particle.timeToLive;

                if (Math.random() < 0.4)
                    particle.velocity.set(PARTICLE_INITIAL_VELOCITY_RANGE.random(), 0).rotate(angle);
                else
                    particle.velocity.set(PARTICLE_INITIAL_VELOCITY_2_RANGE.random(), 0).rotate(angle);
                particle.acceleration.set(-particle.velocity.x, -particle.velocity.y).scale(0.6);

                this.displayObject.removeChild(particle);
                this.displayObject.addChildAt(particle, 0);

                this.activeParticles.push(particle);
            }

            return particle;
        },

        updateColor: function() {
            var groundState = this.simulation.getGroundState();
            var middleState = this.simulation.getMiddleEnergyState();
            var deltaEnergy = middleState.getEnergyLevel() - groundState.getEnergyLevel();
            var hex = WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));
            this.startingColor = Colors.parseHex(hex);
        },

        start: function() {
            this.updateColor();
            this.text.visible = true;

            this._emittingParticles = true;
            this._emissionTimer = 0;
            this._textFadeTimer = 0;
        },

        stop: function() {
            this._emittingParticles = false;
        },

        clear: function() {
            var particle;
            var i;
            for (i = this.activeParticles.length - 1; i >= 0; i--) {
                particle = this.activeParticles[i];
                particle.visible = false;
                this.activeParticles.splice(i, 1);
                this.dormantParticles.push(particle);
            }

            for (i = this.usedParticles.length - 1; i >= 0; i--) {
                particle = this.usedParticles[i];
                particle.visible = false;
                this.usedParticles.splice(i, 1);
                this.dormantParticles.push(particle);
            }

            this.text.visible = false;
        },

        explodedChanged: function(simulation, exploded) {
            if (exploded) {
                this.start();
            }
            else {
                this.stop();
                this.clear();
            }
        }

    });


    return LaserExplosionView;
});