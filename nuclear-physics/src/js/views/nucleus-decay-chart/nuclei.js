define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView           = require('common/v3/pixi/view');
    var ModelViewTransform = require('common/math/model-view-transform');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var Constants = require('constants');
    var FALL_TIME = Constants.NucleusDecayChart.FALL_TIME;

    /**
     * 
     */
    var NucleusDecayChartNucleiView = PixiView.extend({

        /**
         * Initializes the new NucleusDecayChartNucleiView.
         */
        initialize: function(options) {
            this.simulation = options.simulation;
            this.width = options.width;
            this.height = options.height;
            this.isotope1Y = options.isotope1Y;
            this.isotope2Y = options.isotope2Y;

            this.nuclei = [];
            this.sprites = [];
            this.decayedNuclei = [];
            this.decayedSprites = [];

            this.initGraphics();

            if (this.width)
                this.setWidth(this.width);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.mask = new PIXI.Graphics();
            this.displayObject.addChild(this.mask);
            this.displayObject.mask = this.mask;
        },

        addNucleus: function(nucleus) {
            var sprite = ParticleGraphicsGenerator.generateNucleus(nucleus, this.mvt);
            this.sprites.push(sprite);
            this.nuclei.push(nucleus);
            this.displayObject.addChild(sprite);
        },

        removeNucleus: function(nucleus) {
            for (var i = this.nuclei.length - 1; i >= 0; i--) {
                if (this.nuclei[i] === nucleus) {
                    this.displayObject.removeChild(this.sprites[i]);

                    this.nuclei.splice(i, 1);
                    this.sprites.splice(i, 1);
                    return;
                }
            }

            for (var i = this.decayedNuclei.length - 1; i >= 0; i--) {
                if (this.decayedNuclei[i] === nucleus) {
                    this.displayObject.removeChild(this.decayedSprites[i]);

                    this.decayedNuclei.splice(i, 1);
                    this.decayedSprites.splice(i, 1);
                }
            } 
        },

        clear: function() {
            for (var i = this.nuclei.length - 1; i >= 0; i--) {
                this.displayObject.removeChild(this.sprites[i]);

                this.nuclei.splice(i, 1);
                this.sprites.splice(i, 1);
            }

            this.clearDecayed();
        },

        clearDecayed: function() {
            for (var i = this.decayedSprites.length - 1; i >= 0; i--) {
                this.displayObject.removeChild(this.decayedSprites[i]);

                this.decayedNuclei.splice(i, 1);
                this.decayedSprites.splice(i, 1);
            }
        },

        setNucleusScale: function(scale) {
            this.mvt = ModelViewTransform.createScaleMapping(scale, scale);
        },

        setMillisecondsToPixels: function(msToPx) {
            this.msToPx = msToPx;
        },

        setWidth: function(width) {
            this.width = width;

            var rightBuffer = 20;
            this.mask.beginFill();
            this.mask.drawRect(-rightBuffer, 0, this.width + rightBuffer, this.height);
            this.mask.endFill();
        },

        update: function(time, deltaTime, paused) {
            var isotope1Y = this.isotope1Y;
            var isotope2Y = this.isotope2Y;
            var ySpan = isotope2Y - isotope1Y;
            var nucleus;
            var sprite;
            var i;

            for (i = this.nuclei.length - 1; i >= 0; i--) {
                nucleus = this.nuclei[i];
                sprite = this.sprites[i];

                if (nucleus.isDecayActive()) {
                    sprite.y = isotope1Y;
                    sprite.x = nucleus.getAdjustedActivatedTime() * this.msToPx;
                }
                else if (nucleus.hasDecayed()) {
                    sprite.decayTime = 0;
                    this.sprites.splice(i, 1);
                    this.nuclei.splice(i, 1);

                    this.decayedSprites.push(sprite);
                    this.decayedNuclei.push(nucleus);
                }
            }

            for (i = this.decayedSprites.length - 1; i >= 0; i--) {
                sprite = this.decayedSprites[i];

                if (sprite.decayTime < FALL_TIME)
                    sprite.y = isotope1Y + (sprite.decayTime / FALL_TIME) * ySpan;
                else
                    sprite.y = isotope2Y;

                sprite.decayTime += deltaTime;
            }
        }

    });


    return NucleusDecayChartNucleiView;
});