define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView           = require('common/v3/pixi/view');
    var ModelViewTransform = require('common/math/model-view-transform');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

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

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {

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
                }
            }
        },

        clear: function() {
            for (var i = this.nuclei.length - 1; i >= 0; i--) {
                this.displayObject.removeChild(this.sprites[i]);

                this.nuclei.splice(i, 1);
                this.sprites.splice(i, 1);
            }
        },

        setNucleusScale: function(scale) {
            this.mvt = ModelViewTransform.createScaleMapping(scale, scale);
        },

        setMillisecondsToPixels: function(msToPx) {
            this.msToPx = msToPx;
        },

        update: function(time, deltaTime, paused) {
            var isotope1Y = this.isotope1Y;
            var isotope2Y = this.isotope2Y;
            var nucleus;
            var sprite;

            for (var i = 0; i < this.nuclei.length; i++) {
                nucleus = this.nuclei[i];
                sprite = this.sprites[i];

                if (nucleus.isDecayActive()) {
                    sprite.y = isotope1Y;
                }
                else if (nucleus.hasDecayed()) {
                    sprite.y = isotope2Y;
                }
                else {
                    sprite.y = isotope1Y;
                }
            }
        }

    });


    return NucleusDecayChartNucleiView;
});