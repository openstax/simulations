define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/pixi/view/slider');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var EnergySourceView = require('views/energy-source');
    var BurnerView       = require('views/element/burner');
    var BurnerStandView  = require('views/element/burner-stand');

    var Constants = require('constants');

    var Assets = require('assets');

    var maxParticleRadius = Constants.TeapotView.STEAM_PARTICLE_RADIUS_RANGE.max;
    var steamParticleTexture = PIXI.Texture.generateRoundParticleTexture(0, maxParticleRadius, Constants.TeapotView.STEAM_PARTICLE_COLOR);

    var TeapotView = EnergySourceView.extend({

        initialize: function(options) {
            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            var teapotBounds = this.initTeapot();

            var burnerStandWidth = teapotBounds.w * 0.9;
            var burnerStandHeight = burnerStandWidth * 0.7;
            var burnerStandRect = new Rectangle(
                teapotBounds.center().x - burnerStandWidth / 2,
                teapotBounds.top() - 35,
                burnerStandWidth,
                burnerStandHeight
            );
            
            this.initBurnerView(burnerStandRect);
            this.initBurnerStandView(burnerStandRect);
            this.initSteam();
        },

        initTeapot: function() {
            var teapotSprite = this.createSpriteWithOffset(Assets.Images.TEAPOT_LARGE, Constants.Teapot.TEAPOT_OFFSET);
            this.displayObject.addChild(teapotSprite);

            var teapotSpriteBounds = teapotSprite.getBounds();

            return new Rectangle(
                teapotSprite.x,
                teapotSprite.y,
                teapotSprite.width,
                teapotSprite.height
            );
        },

        initBurnerView: function(burnerStandRect) {
            var burnerView = new BurnerView({
                model: this.model,
                mvt: this.mvt,
                width:  TeapotView.BURNER_WIDTH,
                height: TeapotView.BURNER_HEIGHT,
                openingHeight: TeapotView.BURNER_OPENING_HEIGHT,
                energyChunkCollection: this.model.energyChunks,
                coolingEnabled: false,
                sliderReturnsToCenter: false
            });
            this.burnerView = burnerView;

            this.displayObject.addChildAt(burnerView.frontLayer, 0);
            this.displayObject.addChildAt(burnerView.energyChunkLayer, 0);
            this.displayObject.addChildAt(burnerView.backLayer, 0);

            burnerView.setPosition(
                burnerStandRect.center().x,
                burnerStandRect.top() + 5
            );
        },

        initBurnerStandView: function(burnerStandRect) {
            var burnerStandView = new BurnerStandView({
                model: this.model,
                mvt: this.mvt,
                rectangle: burnerStandRect,
                projectedEdgeLength: burnerStandRect.w * 0.2
            });

            burnerStandView.stopListening(this.model, 'change:position');
            burnerStandView.setPosition(0, burnerStandRect.h);

            this.displayObject.addChildAt(burnerStandView.displayObject, 0);
        },

        initSteam: function() {
            this.steamLayer = new PIXI.SpriteBatch();
            this.displayObject.addChild(this.steamLayer);

            this.activeSteamParticles = [];
            this.dormantSteamParticles = [];
            var particle;
            for (var i = 0; i < TeapotView.NUM_STEAM_PARTICLES; i++) {
                particle = new PIXI.Sprite(steamParticleTexture);
                particle.visible = false;
                particle.anchor.x = particle.anchor.y = 0.5;
                this.steamLayer.addChild(particle);
                this.dormantSteamParticles.push(particle);
            }

            this.steamParticleEmissionCounter = 0;

            this.spoutTipPosition = this.mvt.modelToViewDelta(new Vector2(0.0475, 0.045)).clone();
            this.spoutBottomPosition = this.mvt.modelToViewDelta(Constants.Teapot.SPOUT_BOTTOM_OFFSET).clone();
            this._spoutDirection = new Vector2();
        },

        spoutDirection: function() {
            return this._spoutDirection
                .set(this.spoutTipPosition)
                .sub(this.spoutBottomPosition)
                .normalize();
        },

        spoutAngle: function() {
            return this._spoutDirection
                .set(this.spoutTipPosition)
                .sub(this.spoutBottomPosition)
                .angle(); // not normalizing it so the angle's more accurate
        },

        update: function(time, deltaTime, simulationPaused) {
            EnergySourceView.prototype.update.apply(this, [time, deltaTime, simulationPaused]);

            if (!simulationPaused) {
                this.updateSteamParticles(time, deltaTime);
            }
        },

        updateSteamParticles: function(time, deltaTime) {
            this.steamParticleEmissionCounter += deltaTime;

            var steamingProportion = this.model.get('energyProductionRate') / Constants.MAX_ENERGY_PRODUCTION_RATE;
            var emissionRate = steamingProportion * TeapotView.MAX_STEAM_PARTICLE_EMISSION_RATE;
            var emissionInterval = 1 / emissionRate; // time between particle emissions
            var cloudCenterDistance = steamingProportion * TeapotView.MAX_STEAM_CLOUD_CENTER_DISTANCE;
            //console.log(cloudCenterDistance);
            
            // Activate new particles
            while (this.steamParticleEmissionCounter > emissionInterval) {
                this.emitSteamParticle(time, steamingProportion, cloudCenterDistance);
                this.steamParticleEmissionCounter -= emissionInterval;
            }

            // Update active particles
            var particle;
            var radius;
            var lifeProgress;
            for (var i = this.activeSteamParticles.length - 1; i >= 0; i--) {
                particle = this.activeSteamParticles[i];
                // Clean up dead particles
                if (time >= particle.lifeEndsAt) {
                    particle.visible = false;
                    this.activeSteamParticles.splice(i, 1);
                    this.dormantSteamParticles.push(particle);
                }

                // Move particles
                particle.x += particle.velocity.x * deltaTime;
                particle.y += particle.velocity.y * deltaTime;

                // Find the percent of life spent
                lifeProgress = 1 - ((particle.lifeEndsAt - time) / particle.timeToLive);

                // Scale particles as they get older
                radius = TeapotView.STEAM_PARTICLE_RADIUS_RANGE.lerp(Math.min(lifeProgress * 2, 1)) * steamingProportion;
                particle.scale.x = particle.scale.y = radius / TeapotView.STEAM_PARTICLE_RADIUS_RANGE.max;



                // Apply repellant force on particles inversely related
                //   to the distance from the center of the cloud.

            }
        },

        emitSteamParticle: function(time, steamingProportion, cloudCenterDistance) {
            if (!this.dormantSteamParticles.length)
                return null;

            var scale = TeapotView.STEAM_PARTICLE_RADIUS_RANGE.min / (steamParticleTexture.width / 2);
            var angle = this.spoutAngle() + (Math.random() * TeapotView.STEAM_EMISSION_ANGLE) - (TeapotView.STEAM_EMISSION_ANGLE / 2);
            console.log(angle);
            var particle = this.dormantSteamParticles.pop();
            if (particle) {
                particle.x = this.spoutTipPosition.x;
                particle.y = this.spoutTipPosition.y;
                particle.scale.x = particle.scale.y = scale;
                particle.alpha = TeapotView.STEAM_PARTICLE_MAX_ALPHA * steamingProportion;
                particle.visible = true;
                particle.velocity = new Vector2(cloudCenterDistance, 0).angle(angle);
                //console.log(particle.velocity);
                //console.log(cloudCenterDistance);
                // console.log(this.spoutTipPosition);
                particle.timeToLive = TeapotView.STEAM_PARTICLE_LIFE_RANGE.random() * steamingProportion;
                particle.lifeEndsAt = time + particle.timeToLive;
                this.activeSteamParticles.push(particle);    
            }

            return particle;
        },

        showEnergyChunks: function() {
            EnergySourceView.prototype.showEnergyChunks.apply(this);
            this.burnerView.showEnergyChunks();
        },

        hideEnergyChunks: function() {
            EnergySourceView.prototype.hideEnergyChunks.apply(this);
            this.burnerView.hideEnergyChunks();
        },

    }, Constants.TeapotView);

    return TeapotView;
});