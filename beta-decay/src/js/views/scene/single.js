define(function(require) {

    'use strict';

    var AppView = require('common/v3/app/app');

    var SingleNucleusDecayChart = require('views/nucleus-decay-chart/single');
    var SingleNucleusSceneView  = require('views/scene/single-nucleus');

    // CSS
    require('less!beta-decay/styles/scene');

    /**
     *
     */
    var SingleNucleusBetaDecaySceneView = SingleNucleusSceneView.extend({

        initialize: function(options) {
            SingleNucleusSceneView.prototype.initialize.apply(this, [options]);

        },

        initGraphics: function() {
            SingleNucleusSceneView.prototype.initGraphics.apply(this, arguments);

            this.initNucleusDecayChart();
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new SingleNucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            if (AppView.windowIsShort()) {
                this.nucleusDecayChart.displayObject.x = this.getLeftPadding() + 12;
                this.nucleusDecayChart.displayObject.y = 12;
            }
            else {
                this.nucleusDecayChart.displayObject.x = this.getLeftPadding() + 20;
                this.nucleusDecayChart.displayObject.y = 20;
            }

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        getTopPadding: function() {
            return 150;
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SingleNucleusSceneView.prototype._update.apply(this, arguments);

            this.nucleusDecayChart.update(time, deltaTime, paused);
        }

    });

    return SingleNucleusBetaDecaySceneView;
});
