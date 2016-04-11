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
    var DatingGameLandscapeView             = require('radioactive-dating-game/views/landscape/dating-game');
    var DatableItemView                     = require('radioactive-dating-game/views/datable-item');

    var Constants = require('constants');
    var Assets = require('assets');

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var DatingGameSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);
        },

        reset: function() {
            
        },

        getTopPadding: function() {
            return 230;
        },

        initMVT: function() {
            this.mvt = DatingGameLandscapeView.createMVT(this.width, this.height);
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBackground();
            this.initItems();
            this.initRadiometricDatingMeter();
            this.initDecayProportionGraph();
        },

        initBackground: function() {
            this.landscape = new DatingGameLandscapeView({
                mvt: this.mvt,
                simulation: this.simulation,
                width: this.width,
                height: this.height
            });

            this.stage.addChild(this.landscape.displayObject);
            this.$ui.append(this.landscape.renderElement().el);
        },

        initItems: function() {
            for (var i = 0; i < this.simulation.items.length; i++) {
                var itemViews = new DatableItemView({
                    model: this.simulation.items.at(i),
                    mvt: this.mvt
                });

                this.stage.addChild(itemViews.displayObject);
            }
        },

        initRadiometricDatingMeter: function() {
            this.radiometricDatingMeterView = new RadiometricDatingMeterView({
                model: this.simulation.meter,
                simulation: this.simulation,
                mvt: this.mvt
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
            var height = 216;

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

            this.landscape.update(time, deltaTime, paused);
        },

        setSoundVolumeMute: function() {
            this.landscape.setSoundVolumeMute();
        },

        setSoundVolumeLow: function() {
            this.landscape.setSoundVolumeLow();
        },

        setSoundVolumeHigh: function() {
            this.landscape.setSoundVolumeHigh();
        }

    });

    return DatingGameSceneView;
});
