define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AppView = require('common/v3/app/app');

    var LandscapeView    = require('radioactive-dating-game/views/landscape');
    var VolcanoSmokeView = require('radioactive-dating-game/views/volcano-smoke');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var VolcanoLandscapeView = LandscapeView.extend({

        shakeDistance: 10, // Pixels
        shakeSpeed: 500,   // Pixels per second
        fogTimeOffset: 1,

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this._volcanoErupting = false;
            this._volcanoCooling = false;
            this._shakeDirection = 1;
            this._xOffset = 0;

            LandscapeView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'eruption-start', this.eruptionStarted);
            this.listenTo(this.simulation, 'eruption-end',   this.eruptionEnded);
        },

        initGraphics: function() {
            LandscapeView.prototype.initGraphics.apply(this, arguments);

            this.initSmoke();
            this.initFog();
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

            this.$el.append(this.$eruptVolcanoButton);
            this.$el.append(this.$coolRockButton);

            return this;
        },

        updateMVT: function(mvt) {
            LandscapeView.prototype.updateMVT.apply(this, arguments);

            if (AppView.windowIsShort()) {
                this.volcanoSmokeView.displayObject.x = 566;
                this.volcanoSmokeView.displayObject.y = 318;
            }
            else {
                this.volcanoSmokeView.displayObject.x = 612;
                this.volcanoSmokeView.displayObject.y = 390;
            }
        },

        update: function(time, deltaTime, paused) {
            if (!paused) {
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

                this.volcanoSmokeView.update(time, deltaTime, paused);
            }
        },

        updateLayerPositions: function() {
            this.backgroundEffectsLayer.x = this._xOffset;
            this.backgroundLayer.x = this._xOffset;
            this.foregroundLayer.x = this._xOffset;
        },

        eruptVolcano: function() {
            this.$eruptVolcanoButton.hide();
            this.simulation.eruptVolcano();
        },

        coolRock: function() {

        },

        eruptionStarted: function() {
            this._xOffset = 0;
            this._fogTimer = 0;
            this._volcanoErupting = true;
            this._volcanoCooling = false;
            this.volcanoSmokeView.startSmoking();
        },

        eruptionEnded: function() {
            this._volcanoErupting = false;
            this._volcanoCooling = true;
            this._xOffset = 0;
            this._fogTimer = 0;
            this.updateLayerPositions();
            this.volcanoSmokeView.stopSmoking();
            this.$eruptVolcanoButton.show();
        }

    });


    return VolcanoLandscapeView;
});