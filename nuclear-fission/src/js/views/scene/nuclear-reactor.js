define(function(require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var NuclearReactorView = require('nuclear-fission/views/nuclear-reactor');

    var NuclearPhysicsSceneView = require('views/scene');

    /**
     *
     */
    var NuclearReactorSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'nucleus-change', this.nucleusChanged);
            this.listenTo(this.simulation, 'reset',          this.simulationReset);
        },

        renderContent: function() {
            var self = this;
            this.$resetButton = $('<button class="btn btn-lg reset-nuclei-btn">Reset Nuclei</button>');
            this.$resetButton.on('click', function() {
                self.resetNuclei();
            });
            this.$resetButton.hide();

            var html = '<button class="btn btn-lg view-reactor-picture-btn"data-toggle="modal" data-target="#picture-dialog"><span class="fa fa-picture-o"></span> Picture of Reactor</button>';
            this.$viewReactorPictureButton = $(html);

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$viewReactorPictureButton);
        },

        reset: function() {
            
        },

        initMVT: function() {
            this.viewOriginX = this.getLeftPadding() + this.getAvailableWidth() / 2 - 10;
            this.viewOriginY = this.getTopPadding() + this.getAvailableHeight() / 2;

            var pixelsPerFemtometer = 1;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initNuclearReactor();
        },

        initNuclearReactor: function() {
            this.nuclearReactorView = new NuclearReactorView({
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.stage.addChild(this.nuclearReactorView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            this.nuclearReactorView.update(time, deltaTime, paused);
        },

        resetNuclei: function() {
            this.simulation.reset();
            this.hideResetButton();
        },

        showResetButtonWithDelay: function() {
            // Don't start it over again
            if (this.buttonTimeout)
                return;

            this.buttonTimeout = window.setTimeout(_.bind(function() {
                this.$resetButton.show();
                this.buttonTimeout = null;
            }, this), 1500);
        },

        hideResetButton: function() {
            if (this.buttonTimeout) {
                window.clearTimeout(this.buttonTimeout);
                this.buttonTimeout = null;
            }
            this.$resetButton.hide();
        },

        nucleusChanged: function() {
            if (this.simulation.getChangedNucleiExist())
                this.showResetButtonWithDelay();
        },

        simulationReset: function() {
            this.hideResetButton();
        }

    });

    return NuclearReactorSceneView;
});
