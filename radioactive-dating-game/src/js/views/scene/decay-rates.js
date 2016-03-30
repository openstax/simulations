define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var ParticleGraphicsGenerator     = require('views/particle-graphics-generator');
    var MultipleNucleusDecayChart     = require('views/nucleus-decay-chart/multiple');
    var NuclearPhysicsSceneView       = require('views/scene');
    var AtomCanisterView              = require('views/atom-canister');
    var DraggableExplodingNucleusView = require('views/nucleus/draggable');

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
            this.nucleusViews = [];

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.atomicNuclei, 'add',    this.nucleusAdded);
            this.listenTo(this.simulation.atomicNuclei, 'remove', this.nucleusRemoved);
            this.listenTo(this.simulation.atomicNuclei, 'reset',  this.nucleiReset);
        },

        renderContent: function() {
            var self = this;

            this.$resetButton = $('<button class="btn btn-lg reset-nuclei-btn">Reset All Nuclei</button>');
            this.$resetButton.on('click', function() {
                self.resetNuclei();
            });

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$canisterSliderWrapper);
        },

        reset: function() {
            this.showLabels();
        },

        getTopPadding: function() {
            return 230;
        },

        initMVT: function() {
            var pixelsPerFemtometer;

            if (AppView.windowIsShort()) {
                pixelsPerFemtometer = 6;
            }
            else {
                pixelsPerFemtometer = 8;
            }

            this.viewOriginX = 0;
            this.viewOriginY = 0;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );

            this.simulation.setNucleusBounds(
                this.mvt.viewToModelX(this.getLeftPadding()),
                this.mvt.viewToModelY(this.getTopPadding()),
                this.mvt.viewToModelDeltaX(this.getAvailableWidth()),
                this.mvt.viewToModelDeltaY(this.getAvailableHeight())
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

            this.canisterLayer = new PIXI.Container();
            this.nucleusLayer = new PIXI.Container();
            this.dummyLayer = new PIXI.Container();

            this.stage.addChild(this.canisterLayer);
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initAtomCanister();

            this.stage.addChild(this.dummyLayer);
        },

        initAtomCanister: function() {
            var canisterX;
            var canisterY;
            var canisterWidth;

            if (AppView.windowIsShort()) {
                canisterX = 12 + 21;
                canisterY = 260;
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

            // Calculate the bounds of the areas to be avoided when placing atoms
            var resetButtonPos = this.$resetButton.position();
            var resetButtonRect = new Rectangle(resetButtonPos.left, resetButtonPos.top, canisterWidth, 46);
            this.atomCanisterView.setAreasToAvoid([
                resetButtonRect
            ]);

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

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);
            
            this.atomCanisterView.update(time, deltaTime, paused);

            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].update(time, deltaTime, paused);
        },

        nucleusAdded: function(nucleus) {
            var nucleusView = new DraggableExplodingNucleusView({
                model: nucleus,
                mvt: this.mvt,
                showSymbol: this.showingLabels,
                atomCanister: this.atomCanisterView,
                renderer: this.renderer
            });

            this.nucleusViews.push(nucleusView);

            this.nucleusLayer.addChild(nucleusView.displayObject);
        },

        nucleusRemoved: function(nucleus) {
            for (var i = 0; i < this.nucleusViews.length; i++) {
                if (this.nucleusViews[i].model == nucleus) {
                    this.nucleusViews[i].remove();
                    this.nucleusViews.splice(i, 1);
                    break;
                }
            }
        },

        nucleiReset: function() {
            for (var i = this.nucleusViews.length - 1; i >= 0; i--) {
                this.nucleusViews[i].remove();
                this.nucleusViews.splice(i, 1);
            }
        },

        resetNuclei: function() {
            this.simulation.resetActiveAndDecayedNuclei();
        },

        showLabels: function() {
            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].showLabel();
            this.showingLabels = true;
        },

        hideLabels: function() {
            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].hideLabel();
            this.showingLabels = false;
        }

    });

    return DecayRatesSceneView;
});
