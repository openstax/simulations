define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var NucleusDecayChart         = require('views/nucleus-decay-chart');
    var NuclearPhysicsSceneView   = require('views/scene');
    var AtomCanisterView          = require('views/atom-canister');

    /**
     *
     */
    var MultiNucleusBetaDecaySceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            this.showingLabels = true;
            this.nucleusViews = [];

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.atomicNuclei, 'add', this.nucleusAdded);
        },

        renderContent: function() {
            var self = this;

            this.$resetButton = $('<button class="btn btn-lg reset-nuclei-btn">Reset All Nuclei</button>');
            this.$resetButton.on('click', function() {
                self.resetNuclei();
            });

            this.$add10Button = $('<button class="btn add-10-btn">+ 10</button>');
            this.$add10Button.on('click', function() {
                self.add10();
            });

            this.$remove10Button = $('<button class="btn remove-10-btn">- 10</button>');
            this.$remove10Button.on('click', function() {
                self.remove10();
            });

            this.$bucketButtonsWrapper = $('<div class="bucket-btns-wrapper">');
            this.$bucketButtonsWrapper.append(this.$add10Button);
            this.$bucketButtonsWrapper.append(this.$remove10Button);

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$bucketButtonsWrapper);
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
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.nucleusLayer = new PIXI.Container();
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initNucleusDecayChart();
            this.initAtomCanister();
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new NucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        initAtomCanister: function() {
            this.atomCanisterView = new AtomCanisterView({
                simulation: this.simulation,
                width: 160,
                mvt: this.mvt
            });

            this.atomCanisterView.displayObject.x = 534;
            this.atomCanisterView.displayObject.y = 420;

            this.stage.addChild(this.atomCanisterView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);
            
            this.nucleusDecayChart.update(time, deltaTime, paused);
            this.atomCanisterView.update(time, deltaTime, paused);
        },

        nucleusAdded: function(nucleus) {
            var nucleusView = new ExplodingNucleusView({
                model: this.simulation.atomicNucleus,
                mvt: this.mvt,
                showSymbol: this.showingLabels
            });

            this.nucleusViews.push(nucleusView);

            this.nucleusLayer.addChild(this.nucleusView.displayObject);
        },

        resetNuclei: function() {
            console.log('reset nuclei');
        },

        add10: function() {

        },

        remove10: function() {

        },

        showLabels: function() {
            this.nucleusView.showLabel();
            this.showingLabels = true;
        },

        hideLabels: function() {
            this.nucleusView.hideLabel();
            this.showingLabels = false;
        }

    });

    return MultiNucleusBetaDecaySceneView;
});
