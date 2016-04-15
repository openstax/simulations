define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ExternalFieldControlView = require('views/external-field-control');
    var ElectricFieldView        = require('views/electric-field');
    var ParticleView             = require('views/particle');
    var BoundsView               = require('views/bounds');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var EFDSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.particles, 'reset',  this.particlesReset);
            this.listenTo(this.simulation.particles, 'add',    this.particleAdded);
            this.listenTo(this.simulation.particles, 'remove', this.particleRemoved);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initElectricFieldView();
            this.initParticles();
            this.initBoundsView();
            this.initExternalFieldControlView();
        },

        initMVT: function() {
            // Use whichever dimension is smaller
            var m = 36;
            var usableWidth = this.width - ExternalFieldControlView.PANEL_WIDTH - ExternalFieldControlView.RIGHT - m * 2;
            var usableHeight = this.height - 62 - m * 2;

            if (AppView.windowIsShort())
                usableWidth -= ExternalFieldControlView.PANEL_WIDTH + ExternalFieldControlView.RIGHT;

            var scale;
            if (usableWidth < usableHeight)
                scale = usableWidth / Constants.SYSTEM_WIDTH;
            else
                scale = usableHeight / Constants.SYSTEM_WIDTH;

            if (AppView.windowIsShort()) {
                // Center between the two columns
                this.viewOriginX = Math.round(this.width / 2);
                this.viewOriginY = Math.round(40 + usableHeight / 2);
            }
            else {
                // Center in the usable area on the left
                this.viewOriginX = Math.round(m + usableWidth / 2);
                this.viewOriginY = Math.round(m + usableHeight / 2);
            }

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                this.simulation.center,
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initElectricFieldView: function() {
            this.electricFieldView = new ElectricFieldView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.stage.addChild(this.electricFieldView.displayObject);
        },

        initParticles: function() {
            this.particleViews = [];

            this.particles = new PIXI.Container();

            this.stage.addChild(this.particles);
        },

        initBoundsView: function() {
            this.boundsView = new BoundsView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.stage.addChild(this.boundsView.displayObject);
        },

        initExternalFieldControlView: function() {
            this.externalFieldControlView = new ExternalFieldControlView({
                mvt: this.mvt,
                model: this.simulation.fieldLaw,
                simulation: this.simulation
            });

            this.externalFieldControlView.displayObject.x = this.width  - ExternalFieldControlView.RIGHT;

            this.stage.addChild(this.externalFieldControlView.displayObject);
            this.$ui.append(this.externalFieldControlView.el);

            this.updateExternalFieldControlPosition();
        },

        reset: function() {
            this.externalFieldControlView.reset();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.electricFieldView.update(time, deltaTime);
        },

        updateExternalFieldControlPosition: function() {
            if (AppView.windowIsShort()) {
                this.externalFieldControlView.displayObject.y = 20 + ExternalFieldControlView.PANEL_HEIGHT;
                this.externalFieldControlView.$el.css({
                    'top': 20 + 'px'
                });
            }
            else {
                this.externalFieldControlView.displayObject.y = this.height - ExternalFieldControlView.BOTTOM;
                this.externalFieldControlView.$el.css({
                    'top': (this.height - ExternalFieldControlView.BOTTOM - ExternalFieldControlView.PANEL_HEIGHT) + 'px'
                });
            }
        },

        particlesReset: function(particles) {
            // Remove old particle views
            for (var i = this.particleViews.length - 1; i >= 0; i--) {
                this.particleViews[i].removeFrom(this.particles);
                this.particleViews.splice(i, 1);
            }

            // Add new particle views
            particles.each(function(particle) {
                this.createAndAddParticleView(particle);
            }, this);
        },

        particleAdded: function(particle, particles) {
            this.createAndAddParticleView(particle);
        },

        particleRemoved: function(particle, particles) {
            for (var i = this.particleViews.length - 1; i >= 0; i--) {
                if (this.particleViews[i].model === particle) {
                    this.particleViews[i].removeFrom(this.particles);
                    this.particleViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddParticleView: function(particle) {
            var particleView = new ParticleView({ 
                model: particle,
                mvt: this.mvt
            });
            this.particles.addChild(particleView.displayObject);
            this.particleViews.push(particleView);
        }

    });

    return EFDSceneView;
});
