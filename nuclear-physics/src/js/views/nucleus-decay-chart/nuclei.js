define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView           = require('common/v3/pixi/view');
    var ModelViewTransform = require('common/math/model-view-transform');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var Constants = require('constants');
    var FALL_TIME = Constants.NucleusDecayChart.FALL_TIME;
    var BUNCHING_OFFSETS = Constants.NucleusDecayChart.BUNCHING_OFFSETS;

    /**
     * 
     */
    var NucleusDecayChartNucleiView = PixiView.extend({

        /**
         * Initializes the new NucleusDecayChartNucleiView.
         */
        initialize: function(options) {
            this.simulation = options.simulation;
            this.renderer = options.renderer;
            this.width = options.width;
            this.height = options.height;
            this.isotope1Y = options.isotope1Y;
            this.isotope2Y = options.isotope2Y;

            this.nuclei = [];
            this.sprites = [];
            this.decayedNuclei = [];
            this.decayedSprites = [];

            this.bunchingCounter = 0;

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
            var sprite = ParticleGraphicsGenerator.generateLabeledNucleus(nucleus, this.mvt, this.renderer, false, 0.6);
            // Set the offset for this node so that the nodes don't
            //   all just stack directly on top of each other.
            sprite.bunchingOffset = BUNCHING_OFFSETS[this.bunchingCounter];
            this.bunchingCounter = (this.bunchingCounter + 1) % BUNCHING_OFFSETS.length;

            this.sprites.push(sprite);
            this.nuclei.push(nucleus);
            this.displayObject.addChild(sprite);
        },

        /**
         * For use with a single nucleus, this function first removes the undecayed
         *   nucleus if it exists before adding the new one.
         */
        replaceNucleus: function(nucleus) {
            if (this.nuclei.length) {
                this.displayObject.removeChild(this.sprites[0]);

                this.nuclei.splice(0, 1);
                this.sprites.splice(0, 1);
            }

            this.addNucleus(nucleus);
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
                    sprite.x = nucleus.getAdjustedActivatedTime() * this.msToPx + (sprite.bunchingOffset.x * this.height);
                }
                else if (nucleus.hasDecayed()) {
                    var texture = ParticleGraphicsGenerator.generateLabeledNucleus(nucleus, this.mvt, this.renderer, false, 0.6).texture;
                    sprite.texture = texture;
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
                // Account for bunching
                sprite.y +=  sprite.bunchingOffset.y * this.height;

                sprite.decayTime += deltaTime;
            }
        }

    });


    return NucleusDecayChartNucleiView;
});