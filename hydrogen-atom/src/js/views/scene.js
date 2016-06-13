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
            this.drawProjectionLines();
        },

        initBoxMVT: function(){
            if (AppView.windowIsShort()) {
                this.viewOriginX = 540 + 12;
                this.viewOriginY = 12 + Constants.BOX_SIZE + 0.5;
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
                squareTarget: true,
                targetColor: '#DA7900',
                alpha: 0.8//this.simulation.gun.getBeamAlpha()
            });

            this.listenTo(this.simulation.gun, 'change:wavelength change:lightType', function(gun, wavelength) {
                this.rayGunView.setColor(gun.getBeamColor());
            });

            var boxPosition = this.rayGunMVT.modelToView(this.simulation.gun.get('position'));
            var boxLabel = new PIXI.Text('Box of\nHydrogen', {
                font: '14px Helvetica Neue',
                fill: '#fff',
                align: 'center'
            });
            boxLabel.anchor.x = 0.5;
            boxLabel.anchor.y = 1;
            boxLabel.resolution = this.rayGunView.getResolution();
            boxLabel.x = boxPosition.x;
            boxLabel.y = boxPosition.y - this.rayGunView.displayObject.height * 0.8;
            boxLabel.alpha = 0.6;

            this.topLayer.addChild(this.rayGunView.displayObject);
            this.topLayer.addChild(boxLabel);
        },

        initSpaceBoxView: function() {
            this.spaceBoxView = new SpaceBoxView({
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.spaceBoxView.displayObject);
            this.$ui.append(this.spaceBoxView.el);
        },

        postRender: function() {
            RutherfordScatteringSceneView.prototype.postRender.apply(this, arguments);

            this.$ui.find('select').selectpicker();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.spaceBoxView.update(time, deltaTime, paused);
        }

    });

    return HydrogenAtomSceneView;
});

