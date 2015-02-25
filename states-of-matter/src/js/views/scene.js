define(function(require) {

    'use strict';

    var PixiSceneView    = require('common/pixi/view/scene');
    var HeaterCoolerView = require('common/pixi/view/heater-cooler');
    var Vector2          = require('common/math/vector2');

    var ParticleTankView = require('views/particle-tank');

    var Assets = require('assets');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var SOMSceneView = PixiSceneView.extend({

        events: {
            
        },

        heaterCoolerPosition: new Vector2(),
        particleTankPosition: new Vector2(),
        particleTankInteractive: false,

        initialize: function(options) {
            this.$ui = $('<div class="scene-ui">');

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initHeaterCoolerView();
            this.initParticleTankView();
        },

        initHeaterCoolerView: function() {
            var viewModel = new HeaterCoolerView.HeaterCoolerViewModel();
            this.listenTo(viewModel, 'change:heatCoolLevel', function(model, heatCoolLevel) {
                this.simulation.set('heatingCoolingAmount', heatCoolLevel);
            });

            this.heaterCoolerView = new HeaterCoolerView({
                model: viewModel,
                width: 100,
                height: 76,
                openingHeight: 0, // Make it look flat
                lineWidth: 0,
                lineColor: '#999',
                iceAssetReference:  Assets.Images.ICE,
                fireAssetReference: Assets.Images.FLAME
            });
            this.heaterCoolerView.displayObject.x = Math.floor(this.width  * this.heaterCoolerPosition.x);
            this.heaterCoolerView.displayObject.y = Math.floor(this.height * this.heaterCoolerPosition.y);
            this.stage.addChild(this.heaterCoolerView.displayObject);
        },

        initParticleTankView: function() {
            this.particleTankView = new ParticleTankView({
                simulation: this.simulation,
                lidDraggable: this.particleTankInteractive,
                showFinger: this.particleTankInteractive
            });

            this.particleTankView.displayObject.x = Math.floor(this.width  * this.particleTankPosition.x);
            this.particleTankView.displayObject.y = Math.floor(this.height * this.particleTankPosition.y);
            this.$ui.append(this.particleTankView.el);

            this.stage.addChild(this.particleTankView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.particleTankView.update(time, deltaTime);
        },

    });

    return SOMSceneView;
});
