define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var SingleNucleusDecayChart   = require('views/nucleus-decay-chart/single');

    var BetaDecaySceneView = require('beta-decay/views/scene');

    /**
     *
     */
    var SingleNucleusBetaDecaySceneView = BetaDecaySceneView.extend({

        initialize: function(options) {
            BetaDecaySceneView.prototype.initialize.apply(this, arguments);

            this.renderUI();
        },

        renderUI: function() {
            var self = this;
            this.$resetButton = $('<button class="btn btn-lg reset-nucleus-btn">Reset Nucleus</button>');
            this.$resetButton.on('click', function() {
                self.resetNucleus();
            });

            this.$ui.append(this.$resetButton);
        },

        initMVT: function() {
            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 200) / 2);
                this.viewOriginY = Math.round(this.height / 2);
            }
            else {
                this.viewOriginX = Math.round(this.width  / 2);
                this.viewOriginY = Math.round(this.height / 2);
            }

            var pixelsPerFemtometer = 25;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            BetaDecaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initNucleusDecayChart();
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new SingleNucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.nucleusDecayChart.update(time, deltaTime, paused);
        },

        resetNucleus: function() {
            this.simulation.resetNucleus();
        }

    });

    return SingleNucleusBetaDecaySceneView;
});
