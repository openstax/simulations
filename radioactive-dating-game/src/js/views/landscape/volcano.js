define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var buzz = require('buzz');

    var AppView = require('common/v3/app/app');

    var AgingRock = require('radioactive-dating-game/models/datable-item/aging-rock');

    var LandscapeView            = require('radioactive-dating-game/views/landscape');
    var VolcanoSmokeView         = require('radioactive-dating-game/views/volcano-smoke');
    var FlyingRockCollectionView = require('radioactive-dating-game/views/flying-rock-collection');
    var AgingRockView            = require('radioactive-dating-game/views/aging-rock');

    var Constants = require('constants');
    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var VolcanoLandscapeView = LandscapeView.extend({

        shakeDistance: 10, // Pixels
        shakeSpeed: 500,   // Pixels per second
        fogTimeOffset: 1,
        lowVolume: 40,
        highVolume: 100,

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this._volcanoErupting = false;
            this._volcanoCooling = false;
            this._shakeDirection = 1;
            this._xOffset = 0;

            LandscapeView.prototype.initialize.apply(this, arguments);

            this.tremorSound = new buzz.sound('audio/tremor', {
                formats: ['ogg', 'mp3', 'wav'],
                volume: this.lowVolume
            });

            this.listenTo(this.simulation, 'eruption-start',     this.eruptionStarted);
            this.listenTo(this.simulation, 'eruption-end',       this.eruptionEnded);
            this.listenTo(this.simulation, 'aging-rock-emitted', this.agingRockEmitted);
            this.listenTo(this.simulation, 'reset',              this.reset);
            this.listenTo(this.simulation, 'change:paused',      this.pausedChanged);
        },

        initGraphics: function() {
            LandscapeView.prototype.initGraphics.apply(this, arguments);

            this.initSmoke();
            this.initFog();
            this.initFlyingRocks();
        },

        initSmoke: function() {
            this.volcanoSmokeView = new VolcanoSmokeView({
                mvt: this.mvt
            });

            this.backgroundEffectsLayer.addChild(this.volcanoSmokeView.displayObject);
        },

        initFog: function() {
            this.fog = new PIXI.Graphics();
            this.fog.beginFill(0x000000, 0.3);
            this.fog.drawRect(0, 0, this.width, this.height);
            this.fog.endFill();
            this.fog.alpha = 0;

            this.foregroundEffectsLayer.addChild(this.fog);
        },

        initFlyingRocks: function() {
            this.flyingRockCollectionView = new FlyingRockCollectionView({
                mvt: this.mvt,
                collection: this.simulation.flyingRocks
            });

            this.backgroundEffectsLayer.addChild(this.flyingRockCollectionView.displayObject);
        },

        reset: function() {
            this.$resetButton.hide();
            this.$coolRockButton.hide();
            this.$eruptVolcanoButton.show();
            this._volcanoErupting = false;
            this._volcanoCooling = false;
            this._xOffset = 0;
            this._fogTimer = 0;
            if (this.agingRockView)
                this.agingRockView.remove();
            this.fog.alpha = 0;
            this.updateLayerPositions();
            this.volcanoSmokeView.stopSmoking();
            this.volcanoSmokeView.clearSmoke();
            this.tremorSound.stop();
        },

        getBackgroundTexture: function() {
            return Assets.Texture(Assets.Images.MEASUREMENT_BACKGROUND_VOLCANO);
        },

        renderElement: function() {
            var self = this;

            this.$eruptVolcanoButton = $('<button class="btn erupt-volcano-btn">Erupt Volcano</button>');
            this.$eruptVolcanoButton.on('click', function() {
                self.eruptVolcano();
            });

            this.$coolRockButton = $('<button class="btn cool-rock-btn">Cool Rock</button>');
            this.$coolRockButton.on('click', function() {
                self.coolRock();
            });
            this.$coolRockButton.hide();

            this.$resetButton = $('<button class="btn reset-volcano-btn">Reset</button>');
            this.$resetButton.on('click', function() {
                self.resetVolcano();
            });
            this.$resetButton.hide();

            this.$el.append(this.$eruptVolcanoButton);
            this.$el.append(this.$coolRockButton);
            this.$el.append(this.$resetButton);

            return this;
        },

        updateMVT: function(mvt) {
            LandscapeView.prototype.updateMVT.apply(this, arguments);

            var smokeViewPosition = this.mvt.modelToView(Constants.MeasurementSimulation.VOLCANO_TOP_POSITION);
            this.volcanoSmokeView.displayObject.x = smokeViewPosition.x;
            this.volcanoSmokeView.displayObject.y = smokeViewPosition.y;
        },

        update: function(time, deltaTime, paused) {
            this.flyingRockCollectionView.update(time, deltaTime, paused);

            if (!paused) {
                this.animateShakeAndFog(time, deltaTime, paused);
                this.volcanoSmokeView.update(time, deltaTime, paused);
            }
        },

        animateShakeAndFog: function(time, deltaTime, paused) {
            if (this._volcanoErupting) {
                this._xOffset += deltaTime * this.shakeSpeed * this._shakeDirection;

                if (this._xOffset <= -this.shakeDistance / 2) {
                    this._xOffset = -this.shakeDistance / 2;
                    this._shakeDirection *= -1;
                }
                else if (this._xOffset >= this.shakeDistance / 2) {
                    this._xOffset = this.shakeDistance / 2;
                    this._shakeDirection *= -1;
                }

                this.updateLayerPositions();

                this._fogTimer += deltaTime;
                if (this._fogTimer >= this.fogTimeOffset) {
                    this.fog.alpha += deltaTime * 0.7;
                    if (this.fog.alpha > 1)
                        this.fog.alpha = 1;    
                }
            }
            else if (this._volcanoCooling) {
                this._fogTimer += deltaTime;
                if (this._fogTimer >= this.fogTimeOffset) {
                    this.fog.alpha -= deltaTime * 0.7;
                    if (this.fog.alpha < 0)
                        this.fog.alpha = 0;
                }
            }
        },

        updateLayerPositions: function() {
            this.backgroundEffectsLayer.x = this._xOffset;
            this.backgroundLayer.x = this._xOffset;
            this.foregroundLayer.x = this._xOffset;
        },

        eruptVolcano: function() {
            this.simulation.eruptVolcano();
        },

        coolRock: function() {
            this.$coolRockButton.hide();
            this.simulation.forceClosure();
        },

        resetVolcano: function() {
            this.simulation.reset();
        },

        eruptionStarted: function() {
            this._xOffset = 0;
            this._fogTimer = 0;
            this._volcanoErupting = true;
            this._volcanoCooling = false;

            this.$eruptVolcanoButton.hide();

            if (this.agingRockView)
                this.agingRockView.remove();
            this.agingRockView = null;

            this.volcanoSmokeView.startSmoking();
            if (!this.simulation.get('paused'))
                this.tremorSound.stop().play();
        },

        eruptionEnded: function() {
            this._volcanoErupting = false;
            this._volcanoCooling = true;
            this._xOffset = 0;
            this._fogTimer = 0;
            this.updateLayerPositions();
            this.volcanoSmokeView.stopSmoking();
        },

        agingRockEmitted: function() {
            this.agingRockView = new AgingRockView({
                model: this.simulation.agingRock,
                mvt: this.mvt
            });

            // Add it to the background effects layer first so it's behind the volcano
            this.backgroundEffectsLayer.addChild(this.agingRockView.displayObject);

            // When the rock starts falling, move it to the foreground
            this.listenTo(this.simulation.agingRock, 'falling', function() {
                this.backgroundEffectsLayer.removeChild(this.agingRockView.displayObject);
                this.foregroundLayer.addChild(this.agingRockView.displayObject);
            });

            this.listenTo(this.simulation.agingRock, 'change:closureState', function(model, closureState) {
                switch (closureState) {
                    case AgingRock.CLOSURE_POSSIBLE:
                        this.$coolRockButton.show();
                        break;
                    case AgingRock.CLOSED:
                        this.$resetButton.show();
                        this.$coolRockButton.hide();
                        break;
                }
            });
        },

        pausedChanged: function(simulation, paused) {
            if (this.tremorSound.getTime() > 0 && !this.tremorSound.isEnded()) {
                if (paused)
                    this.tremorSound.pause(); 
                else
                    this.tremorSound.play();    
            }
            else if (!paused && this._volcanoErupting) {
                // If it hasn't been playing but we're unpausing during the volcano eruption,
                //    we need to play it because it was never started.
                this.tremorSound.play();
            }
        },

        setSoundVolumeMute: function() {
            this.tremorSound.setVolume(0);
        },

        setSoundVolumeLow: function() {
            this.tremorSound.setVolume(this.lowVolume);
        },

        setSoundVolumeHigh: function() {
            this.tremorSound.setVolume(this.highVolume);
        }

    });


    return VolcanoLandscapeView;
});