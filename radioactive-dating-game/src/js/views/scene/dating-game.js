define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var buzz = require('buzz');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var NuclearPhysicsSceneView = require('views/scene');

    var PrePopulatedDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/pre-populated');
    var RadiometricDatingMeterView           = require('radioactive-dating-game/views/radiometric-dating-meter');
    var LandscapeView                        = require('radioactive-dating-game/views/landscape');
    var DatingGameLandscapeView              = require('radioactive-dating-game/views/landscape/dating-game');
    var DatableItemView                      = require('radioactive-dating-game/views/datable-item');
    var AnswerInputView                      = require('radioactive-dating-game/views/answer-input');
    var AnswerLabelView                      = require('radioactive-dating-game/views/answer-label');

    var Constants = require('constants');
    var Assets = require('assets');

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var DatingGameSceneView = NuclearPhysicsSceneView.extend({

        lowVolume: 40,
        highVolume: 100,

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.answerLabelViews = [];

            this.passSound = new buzz.sound('audio/ding', {
                formats: ['ogg', 'mp3', 'wav'],
                volume: this.lowVolume
            });
            this.failSound = new buzz.sound('audio/buzz', {
                formats: ['ogg', 'mp3', 'wav'],
                volume: this.lowVolume
            });
            this.winSound = new buzz.sound('audio/short-fanfare', {
                formats: ['ogg', 'mp3', 'wav'],
                volume: this.lowVolume
            });

            // Cached objects
            this._answerPosition = new Vector2();

            this.listenTo(this.simulation, 'estimate-passed', this.estimatePassed);
            this.listenTo(this.simulation, 'estimate-failed', this.estimateFailed);
            this.listenTo(this.simulation, 'win', this.win);
        },

        renderContent: function() {
            NuclearPhysicsSceneView.prototype.renderContent.apply(this, arguments);

            var self = this;
            this.$resetButton = $('<button class="btn btn-lg reset-game-btn">Reset Game</button>');
            this.$resetButton.on('click', function() {
                self.reset();
            });

            this.$answerLabels = $('<div>');

            this.$winDisplay = $('<div class="win-display"><span>Success!</span></div>');

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$answerLabels);
            this.$ui.append(this.$winDisplay);
        },

        reset: function() {
            this.simulation.reset();
            this.removeAnswerLabelViews();
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
            this.initAnswerInputView();
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
            this.itemViews = [];

            for (var i = 0; i < this.simulation.items.length; i++) {
                var itemView = new DatableItemView({
                    model: this.simulation.items.at(i),
                    mvt: this.mvt
                });

                this.itemViews.push(itemView);
                this.stage.addChild(itemView.displayObject);
            }
        },

        initRadiometricDatingMeter: function() {
            this.radiometricDatingMeterView = new RadiometricDatingMeterView({
                model: this.simulation.meter,
                simulation: this.simulation,
                mvt: this.mvt,
                panelHeight: this.getPanelHeight(),
                includeCustom: true
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

            this.decayRatesGraphView = new PrePopulatedDecayProportionChartView({
                simulation: this.simulation,
                width: width,
                height: height
            });

            this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + panelMargin + probePanelWidth;
            this.decayRatesGraphView.displayObject.y = panelMargin;

            this.stage.addChild(this.decayRatesGraphView.displayObject);
        },

        initAnswerInputView: function() {
            this.answerInputView = new AnswerInputView({
                simulation: this.simulation,
                mvt: this.mvt,
                sceneWidth: this.width,
                sceneHeight: this.height,
                itemViews: this.itemViews
            });

            this.answerInputView.render();

            this.$ui.append(this.answerInputView.el);

            this.answerInputView.postRender();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            this.decayRatesGraphView.update(time, deltaTime, paused);
            this.radiometricDatingMeterView.update(time, deltaTime, paused);

            this.landscape.update(time, deltaTime, paused);
        },

        getPanelHeight: function() {
            return 176;
        },

        getItemView: function(item) {
            for (var i = 0; i < this.itemViews.length; i++) {
                if (this.itemViews[i].model === item)
                    return this.itemViews[i];
            }
            return null;
        },

        getAnswerLabelView: function(item) {
            for (var i = 0; i < this.answerLabelViews.length; i++) {
                if (this.answerLabelViews[i].model === item)
                    return this.answerLabelViews[i];
            }
            return null;
        },

        removeAnswerLabelView: function(item) {
            for (var i = 0; i < this.answerLabelViews.length; i++) {
                if (this.answerLabelViews[i].model === item) {
                    this.answerLabelViews[i].remove();
                    this.answerLabelViews.splice(i, 1);
                    return;
                }
            }
        },

        removeAnswerLabelViews: function() {
            for (var i = this.answerLabelViews.length - 1; i >= 0; i--) {
                this.answerLabelViews[i].remove();
                this.answerLabelViews.splice(i, 1);
            }
        },

        getAnswerPosition: function(item) {
            var itemView = this.getItemView(item);
            var itemBounds = itemView.getBounds();
            var itemPosition = this.mvt.modelToView(item.getPosition());

            return this._answerPosition.set(
                itemBounds.x + itemBounds.width + 8,
                itemPosition.y
            );
        },

        showAnswerLabel: function(item, answer, passed) {
            this.removeAnswerLabelView(item);

            var position = this.getAnswerPosition(item);
            var answerLabelView = new AnswerLabelView({
                model: item,
                x: position.x,
                y: position.y,
                answer: answer,
                passed: passed
            });

            this.$answerLabels.append(answerLabelView.el);
            this.answerLabelViews.push(answerLabelView);
        },

        setSoundVolumeMute: function() {
            this.passSound.setVolume(0);
            this.failSound.setVolume(0);
            this.winSound.setVolume(0);
        },

        setSoundVolumeLow: function() {
            this.passSound.setVolume(this.lowVolume);
            this.failSound.setVolume(this.lowVolume);
            this.winSound.setVolume(this.lowVolume);
        },

        setSoundVolumeHigh: function() {
            this.passSound.setVolume(this.highVolume);
            this.failSound.setVolume(this.highVolume);
            this.winSound.setVolume(this.highVolume);
        },

        estimatePassed: function(item, estimate) {
            this.passSound.play();

            this.showAnswerLabel(item, estimate, true);
        },

        estimateFailed: function(item, estimate) {
            this.failSound.play();

            this.showAnswerLabel(item, estimate, false);
        },

        win: function() {
            this.winSound.play();
            this.showWinDisplay(2000);
        },

        showWinDisplay: function(duration) {
            this.$winDisplay.show();
            var self = this;
            setTimeout(function() {
                self.hideWinDisplay();
            }, duration);
        },

        hideWinDisplay: function() {
            this.$winDisplay.addClass('animate-out');
            var $winDisplay = this.$winDisplay;
            setTimeout(function() {
                $winDisplay
                    .hide()
                    .removeClass('animate-out');
            }, 200);
        }

    });

    return DatingGameSceneView;
});
