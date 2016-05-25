define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var NuclearPhysicsSceneView = require('views/scene');

    var DatableItemDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/datable-item');
    var RadiometricDatingMeterView          = require('radioactive-dating-game/views/radiometric-dating-meter');
    var LandscapeView                       = require('radioactive-dating-game/views/landscape');
    var TreeLandscapeView                   = require('radioactive-dating-game/views/landscape/tree');
    var VolcanoLandscapeView                = require('radioactive-dating-game/views/landscape/volcano');

    var Constants = require('constants');
    var Assets = require('assets');

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var MeasurementSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'change:mode', this.modeChanged);
        },

        reset: function() {
            
        },

        getTopPadding: function() {
            return 230;
        },

        getPanelHeight: function() {
            return 176;
        },

        initMVT: function() {
            this.mvt = LandscapeView.createMVT(this.width, this.height);
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBackground();
            this.initRadiometricDatingMeter();
            this.initDecayProportionGraph();
        },

        initBackground: function() {
            var landscapeSettings = {
                mvt: this.mvt,
                simulation: this.simulation,
                width: this.width,
                height: this.height
            };

            this.treeLandscape    = new TreeLandscapeView(landscapeSettings);
            this.volcanoLandscape = new VolcanoLandscapeView(landscapeSettings);

            this.stage.addChild(this.treeLandscape.displayObject);
            this.stage.addChild(this.volcanoLandscape.displayObject);

            this.$ui.append(this.treeLandscape.renderElement().el);
            this.$ui.append(this.volcanoLandscape.renderElement().el);

            this.volcanoLandscape.hide();
        },

        initRadiometricDatingMeter: function() {
            this.radiometricDatingMeterView = new RadiometricDatingMeterView({
                model: this.simulation.meter,
                simulation: this.simulation,
                mvt: this.mvt,
                panelHeight: this.getPanelHeight()
            });

            if (AppView.windowIsShort())
                this.radiometricDatingMeterView.setPanelPosition(this.getLeftPadding() + 12, 12);
            else
                this.radiometricDatingMeterView.setPanelPosition(this.getLeftPadding() + 20, 20);

            this.$ui.append(this.radiometricDatingMeterView.el);
            this.stage.addChild(this.radiometricDatingMeterView.displayObject);
        },

        initDecayProportionGraph: function() {
            var panelMargin = (AppView.windowIsShort()) ? 12 : 20;
            var probePanelWidth = this.radiometricDatingMeterView.getPanelWidth() + panelMargin;
            var width = this.getWidthBetweenPanels() - probePanelWidth;
            var height = this.getPanelHeight();

            this.decayRatesGraphView = new DatableItemDecayProportionChartView({
                simulation: this.simulation,
                width: width,
                height: height
            });

            this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + panelMargin + probePanelWidth;
            this.decayRatesGraphView.displayObject.y = panelMargin;

            this.stage.addChild(this.decayRatesGraphView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            this.decayRatesGraphView.update(time, deltaTime, paused);
            this.radiometricDatingMeterView.update(time, deltaTime, paused);

            if (this.simulation.get('mode') === Constants.MeasurementSimulation.MODE_TREE)
                this.treeLandscape.update(time, deltaTime, paused);
            else
                this.volcanoLandscape.update(time, deltaTime, paused);
        },

        setSoundVolumeMute: function() {
            this.volcanoLandscape.setSoundVolumeMute();
        },

        setSoundVolumeLow: function() {
            this.volcanoLandscape.setSoundVolumeLow();
        },

        setSoundVolumeHigh: function() {
            this.volcanoLandscape.setSoundVolumeHigh();
        },

        modeChanged: function(simulation, mode) {
            if (mode === Constants.MeasurementSimulation.MODE_TREE) {
                this.treeLandscape.reset();
                this.treeLandscape.show();
                this.volcanoLandscape.hide();
            }
            else {
                this.volcanoLandscape.reset();
                this.volcanoLandscape.show();
                this.treeLandscape.hide();
            }
        }

    });

    return MeasurementSceneView;
});
