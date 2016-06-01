define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var RutherfordScatteringSceneView = require('rutherford-scattering/views/scene');
    var AtomView                      = require('rutherford-scattering/views/atom');
    var RayGunView                    = require('rutherford-scattering/views/gun');

    var SpaceBoxView = require('hydrogen-atom/views/space-box');

    // Constants
    var Constants = require('constants');

    require('less!hydrogen-atom/styles/scene');

    /**
     *
     */
    var HydrogenAtomSceneView = RutherfordScatteringSceneView.extend({

        initGraphics: function() {
            this.bottomLayer = new PIXI.Container();
            this.topLayer    = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.topLayer);

            this.initBoxMVT();
            this.initParticleMVT();
            this.initRayGunMVT();

            this.initRayGunView();
            this.initSpaceBoxView();
            // this.initAtomView();
            this.drawProjectionLines();
        },

        initAtomView: function() {
            // this.atomNodeView = new AtomView({
            //     mvt: this.mvt,
            //     particleMVT: this.particleMVT,
            //     model: this.simulation.atomNode,
            //     simulation: this.simulation,
            //     scale: this.scale,
            //     maskBox: this.spaceBoxView.maskBox
            // });

            // this.bottomLayer.addChild(this.atomNodeView.displayObject);
        },

        initBoxMVT: function(){
            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 220) / 2);
                this.viewOriginY = Math.round((this.height - 50)/ 2);
                this.spaceBoxSize = Constants.BOX_SIZE_SMALL;
            }
            else {
                this.viewOriginX = 540;
                this.viewOriginY = 20 + Constants.BOX_SIZE + 0.5;
                this.spaceBoxSize = Constants.BOX_SIZE;
            }

            this.scale = this.spaceBoxSize / this.simulation.spaceRect.w;
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                this.scale
            );
        },

        initParticleMVT: function() {
            this.particleMVT = ModelViewTransform.createScaleMapping(Constants.PARTICLE_SCALE);
        },

        initRayGunMVT: function() {
            if (AppView.windowIsShort()) {
                this.rayGunOriginX = this.viewOriginX - Constants.BOX_SIZE_SMALL / 2 - 100;
                this.rayGunOriginY = Math.round((this.height + 200) / 2);
            }
            else {
                this.rayGunOriginX = this.viewOriginX - Constants.BOX_SIZE / 2 - 81;
                this.rayGunOriginY = Math.round(this.height / 2) + 20;
            }

            var pixelsPerCentimeter = 5;

            this.rayGunMVT = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.rayGunOriginX, this.rayGunOriginY),
                pixelsPerCentimeter
            );
        },

        initRayGunView: function() {
            this.simulation.gun.set('scale', this.scale);
            this.rayGunView = new RayGunView({
                mvt: this.rayGunMVT,
                model: this.simulation.gun,
                squareTarget: true
            });

            this.topLayer.addChild(this.rayGunView.displayObject);
        },

        initSpaceBoxView: function() {
            this.spaceBoxView = new SpaceBoxView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.spaceBoxView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.spaceBoxView.update(time, deltaTime, paused);
        }

    });

    return HydrogenAtomSceneView;
});

