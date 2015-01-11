define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/pixi/view/slider');
    var Rectangle  = require('common/math/rectangle');

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
            // this.steamLayer = new PIXI.SpriteBatch();
            // this.displayObject.addChild(this.steamLayer);

            // this.activeSteamParticles = [];
            // this.dormantSteamParticles = [];
            // var particle;
            // for (var i = 0; i < TeapotView.NUM_STEAM_PARTICLES; i++) {
            //     particle = new PIXI.Sprite(steamParticleTexture);
            //     particle.visible = false;
            //     particle.anchor.x = particle.anchor.y = 0.5;
            //     this.steamLayer.addChild(particle);
            //     this.dormantSteamParticles.push(particle);
            // }

            // this.steamParticleEmissionCounter = 0;

            this.steamGraphics = new PIXI.Graphics();
            this.displayObject.addChild(this.steamGraphics);

            this.spoutTipPosition = this.mvt.modelToViewDelta(Constants.Teapot.SPOUT_TIP_OFFSET);
            this.spoutBottomPosition = this.mvt.modelToViewDelta(Constants.Teapot.SPOUT_BOTTOM_OFFSET);
            //this._spoutDirection = new Vector2();
        },

        spoutDirection: function() {
            return this._spoutDirection
                .set(this.spoutTipPosition)
                .sub(this.spoutBottomPosition)
                .normalize();
        },

        update: function(time, deltaTime, simulationPaused) {
            if (!simulationPaused) {
                //this.updateSteamParticles(time, deltaTime);
                this.updateSteamCloud();
            }
        },

        updateSteamCloud: function() {
            // var steamingProportion = this.model.getEnergyProductionRate() / Constants.MAX_ENERGY_PRODUCTION_RATE;
            // var heightAndWidth = steamingProportion * TeapotView.STEAM_MAX_HEIGHT_AND_WIDTH;
            
        },

        // updateSteamParticles: function(time, deltaTime) {
        //     this.steamParticleEmissionCounter += deltaTime;

        //     var steamingProportion = this.model.getEnergyProductionRate() / Constants.MAX_ENERGY_PRODUCTION_RATE;
        //     var emissionRate = steamingProportion * TeapotView.MAX_STEAM_PARTICLE_EMISSION_RATE;
        //     var emissionInterval = 1 / emissionRate; // time between particle emissions
        //     var cloudCenterDistance = steamingProportion * TeapotView.MAX_STEAM_CLOUD_CENTER_DISTANCE;
            
        //     // Activate new particles
        //     while (this.steamParticleEmissionCounter > emissionInterval) {
        //         this.emitSteamParticle(time, steamingProportion);
        //         this.steamParticleEmissionCounter -= emissionInterval;
        //     }

        //     // Update active particles
        //     var particle;
        //     for (var i = this.activeSteamParticles.length - 1; i >= 0; i--) {
        //         particle = this.activeSteamParticles[i];
        //         particle.x += particle.velocity.x * deltaTime;
        //         particle.y += particle.velocity.y * deltaTime;


        //     }
        // },

        // emitSteamParticle: function(time, steamingProportion) {
        //     if (!this.dormantSteamParticles.length)
        //         return null;

        //     var scale = TeapotView.STEAM_PARTICLE_RADIUS_RANGE.min / (steamParticleTexture.width / 2);
        //     var cloudCenterDistance

        //     var particle = this.dormantSteamParticles.pop();
        //     particle.x = this.spoutTipPosition.x;
        //     particle.y = this.spoutTipPosition.y;
        //     particle.scale.x = particle.scale.y = scale;
        //     particle.alpha = 0;
        //     particle.visible = true;
        //     particle.timeToLive = BeakerView.STEAM_PARTICLE_LIFE_RANGE.random();
        //     particle.lifeEndsAt = time + particle.timeToLive;
        //     this.activeSteamParticles.push(particle);

        //     return particle;
        // },

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