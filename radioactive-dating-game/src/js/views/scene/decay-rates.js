define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var ParticleGraphicsGenerator      = require('views/particle-graphics-generator');
    var MultipleNucleusDecayChart      = require('views/nucleus-decay-chart/multiple');
    var NuclearPhysicsSceneView        = require('views/scene');
    var AtomCanisterView               = require('views/atom-canister');
    var SphericalNucleusCollectionView = require('views/spherical-nucleus-collection');

    var DecayRatesChartView = require('radioactive-dating-game/views/decay-proportion-chart/decay-rates');

    var Constants = require('constants');

    var showNucleusPlacementDebuggingGraphics = false;

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var DecayRatesSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            this.showingLabels = true;

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            var self = this;

            this.$resetButton = $('<button class="btn btn-lg reset-nuclei-btn">Reset All Nuclei</button>');
            this.$resetButton.on('click', function() {
                self.resetNuclei();
            });

            this.$ui.append(this.$resetButton);
        },

        reset: function() {
            this.showLabels();
        },

        getTopPadding: function() {
            if (AppView.windowIsShort())
                return 220;
            else
                return 230;
        },

        initMVT: function() {
            var pixelsPerFemtometer;

            if (AppView.windowIsShort()) {
                pixelsPerFemtometer = 0.7;
            }
            else {
                pixelsPerFemtometer = 1;
            }

            this.viewOriginX = 0;
            this.viewOriginY = 0;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );

            var padding = AppView.windowIsShort() ? 12 : 20;

            this.simulation.setNucleusBounds(
                this.mvt.viewToModelX(this.getLeftPadding() + padding),
                this.mvt.viewToModelY(this.getTopPadding() + padding),
                this.mvt.viewToModelDeltaX(this.getAvailableWidth() - padding * 2),
                this.mvt.viewToModelDeltaY(this.getAvailableHeight() - padding * 2)
            );

            if (showNucleusPlacementDebuggingGraphics) {
                var graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF0000, 1);
                graphics.drawRect(this.getLeftPadding(), this.getTopPadding(), this.getAvailableWidth(), this.getAvailableHeight());
                graphics.endFill();
                this.stage.addChild(graphics);    
            }
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.nucleusLayer = new PIXI.Container();
            this.canisterLayer = new PIXI.Container();
            this.dummyLayer = new PIXI.Container();

            this.stage.addChild(this.canisterLayer);
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initAtomCanister();
            this.initNucleusCollectionView();
            this.initDecayRatesChartView();

            this.stage.addChild(this.dummyLayer);
        },

        initAtomCanister: function() {
            var canisterX;
            var canisterY;
            var canisterWidth;

            if (AppView.windowIsShort()) {
                canisterX = 21;
                canisterY = 254;
                canisterWidth = 160;
            }
            else {
                canisterX = 534;
                canisterY = 440;
                canisterWidth = 160;
            }

            this.atomCanisterView = new AtomCanisterView({
                simulation: this.simulation,
                width: canisterWidth,
                mvt: this.mvt,
                dummyLayer: this.dummyLayer,
                renderer: this.renderer,
                draggingEnabled: false,
                sliderEnabled: true,
                preferredInterNucleusDistance: Constants.PREFERRED_INTER_NUCLEUS_DISTANCE,
                minNucleusToObstacleDistance: Constants.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE,
                hideNucleons: true,
                atomScale: 2.5
            });

            this.atomCanisterView.displayObject.x = canisterX;
            this.atomCanisterView.displayObject.y = canisterY;

            this.simulation.setCanisterBounds(
                this.mvt.viewToModel(this.atomCanisterView.getBounds())
            );

            if (showNucleusPlacementDebuggingGraphics) {
                var graphics = new PIXI.Graphics();
                graphics.beginFill();
                for (var i = 0; i < this.atomCanisterView.modelAreasToAvoid.length; i++) {
                    var viewArea = this.mvt.modelToView(this.atomCanisterView.modelAreasToAvoid[i]);
                    graphics.drawRect(viewArea.x, viewArea.y, viewArea.w, viewArea.h);
                }
                graphics.endFill();
                this.stage.addChild(graphics);    
            }

            this.canisterLayer.addChild(this.atomCanisterView.displayObject);
        },

        initNucleusCollectionView: function() {
            this.nucleusCollectionView = new SphericalNucleusCollectionView({
                simulation: this.simulation,
                collection: this.simulation.atomicNuclei,
                mvt: this.mvt
            });

            this.nucleusLayer.addChild(this.nucleusCollectionView.displayObject);
        },

        initDecayRatesChartView: function() {
            this.decayRatesGraphView = new DecayRatesChartView({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            if (AppView.windowIsShort()) {
                this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + 12;
                this.decayRatesGraphView.displayObject.y = 12;
            }
            else {
                this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + 20;
                this.decayRatesGraphView.displayObject.y = 20;
            }

            this.stage.addChild(this.decayRatesGraphView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);
            
            this.atomCanisterView.update(time, deltaTime, paused);
            this.nucleusCollectionView.update(time, deltaTime, paused);
            this.decayRatesGraphView.update(time, deltaTime, paused);
        },

        resetNuclei: function() {
            this.simulation.resetActiveAndDecayedNuclei();
        }

    });

    return DecayRatesSceneView;
});
