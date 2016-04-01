define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var LandscapeView = require('radioactive-dating-game/views/landscape');

    var Assets = require('assets');

    /**
     * Represents a landscape scene with backdrop and foreground items.
     */
    var VolcanoLandscapeView = LandscapeView.extend({

        shakeDistance: 10, // Pixels
        shakeSpeed: 500,   // Pixels per second

        /**
         * Initializes the new LandscapeView.
         */
        initialize: function(options) {
            this._volcanoErupting = false;
            this._shakeDirection = 1;

            LandscapeView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            LandscapeView.prototype.initGraphics.apply(this, arguments);

            this.fog = new PIXI.Graphics();
            this.fog.beginFill(0x000000, 0.4);
            this.fog.drawRect(0, 0, this.width, this.height);
            this.fog.endFill();
            this.fog.alpha = 0;

            this.displayObject.addChild(this.fog);
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

        update: function(time, deltaTime, paused) {
            if (!paused) {
                if (this._volcanoErupting) {
                    this.background.x += deltaTime * this.shakeSpeed * this._shakeDirection;

                    if (this.background.x <= this.width / 2 - this.shakeDistance / 2) {
                        this.background.x = this.width / 2 - this.shakeDistance / 2;
                        this._shakeDirection *= -1;
                    }
                    else if (this.background.x >= this.width / 2 + this.shakeDistance / 2) {
                        this.background.x = this.width / 2 + this.shakeDistance / 2;
                        this._shakeDirection *= -1;
                    }

                    this.fog.alpha += deltaTime * 0.7;
                    if (this.fog.alpha > 1)
                        this.fog.alpha = 1;
                }
            }
        },

        eruptVolcano: function() {
            this._volcanoErupting = true;
            this.$eruptVolcanoButton.hide();
        },

        stopErupting: function() {
            this._volcanoErupting = false;
            this.background.x = this.width / 2;
            this.fog.alpha = 0;
        },

        coolRock: function() {

        }

    });


    return VolcanoLandscapeView;
});