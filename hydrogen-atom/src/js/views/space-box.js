define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _    = require('underscore');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var AtomicModels = require('hydrogen-atom/models/atomic-models');
    
    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var PhotonCollectionView  = require('hydrogen-atom/views/photon-collection');
    var ExperimentModelView   = require('hydrogen-atom/views/atomic-model/experiment');
    var BilliardBallModelView = require('hydrogen-atom/views/atomic-model/billiard-ball');
    var BohrModelView         = require('hydrogen-atom/views/atomic-model/bohr');
    var DeBroglieModelView    = require('hydrogen-atom/views/atomic-model/debroglie');
    var PlumPuddingModelView  = require('hydrogen-atom/views/atomic-model/plum-pudding');
    var SchrodingerModelView  = require('hydrogen-atom/views/atomic-model/schroedinger');
    var SolarSystemModelView  = require('hydrogen-atom/views/atomic-model/solar-system');

    var Assets = require('assets');
    var Constants = require('constants');
    
    /**
     * Represents the zoomed in view of the scene and what's happening at the atomic level
     */
    var SpaceBoxView = PixiView.extend({

        /**
         * Initializes the new SpaceBoxView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.simulation, 'atom-added', this.atomicModelChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.bottomLayer = new PIXI.Container();
            this.middleLayer = new PIXI.Container();
            this.topLayer    = new PIXI.Container();

            this.displayObject.addChild(this.bottomLayer);
            this.displayObject.addChild(this.middleLayer);
            this.displayObject.addChild(this.topLayer);

            this.initMask();
            this.initParticles();
            this.initBox();
            this.initAtomicModelViews();
            
            this.updateMVT(this.mvt);
        },

        initMask: function() {
            this.boxMask = new PIXI.Graphics();
            
            this.displayObject.addChild(this.boxMask);
        },

        initParticles: function() {
            this.particlesLayer = new PIXI.Container();
            this.particlesLayer.mask = this.boxMask;

            this.photonCollectionView = new PhotonCollectionView({
                mvt: this.mvt,
                collection: this.simulation.photons
            });

            this.particlesLayer.addChild(this.photonCollectionView.displayObject);
            this.middleLayer.addChild(this.particlesLayer);
        },

        initBox: function() {
            this.box = new PIXI.Graphics();
            
            this.displayObject.addChild(this.box);
        },

        initAtomicModelViews: function() {
            this.atomicModelViews = [];

            var options = {
                mvt: this.mvt,
                particleMVT: this.particleMVT,
                simulation: this.simulation
            };

            this.atomicModelViews[0]               = new ExperimentModelView(options);
            this.atomicModelViews['BILLIARD_BALL'] = new BilliardBallModelView(options);
            this.atomicModelViews['PLUM_PUDDING']  = new PlumPuddingModelView(options);
            this.atomicModelViews['SOLAR_SYSTEM']  = new DeBroglieModelView(options);
            this.atomicModelViews['BOHR']          = new BohrModelView(options);
            this.atomicModelViews['DEBROGLIE']     = new SchrodingerModelView(options);
            this.atomicModelViews['SCHROEDINGER']  = new SolarSystemModelView(options);

            // "Experiment" atom is in front of particles
            this.topLayer.addChild(this.atomicModelViews[0].displayObject);

            // All other atoms are behind particles
            this.bottomLayer.addChild(this.atomicModelViews['BILLIARD_BALL'].displayObject);
            this.bottomLayer.addChild(this.atomicModelViews['PLUM_PUDDING'].displayObject);
            this.bottomLayer.addChild(this.atomicModelViews['SOLAR_SYSTEM'].displayObject);
            this.bottomLayer.addChild(this.atomicModelViews['BOHR'].displayObject);
            this.bottomLayer.addChild(this.atomicModelViews['DEBROGLIE'].displayObject);
            this.bottomLayer.addChild(this.atomicModelViews['SCHROEDINGER'].displayObject);

            this.currentAtomicModelViewIndex = 0;
            this.atomicModelChanged();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Update the mask
            this.boxMask.clear();
            this.boxMask.beginFill(0x000000, 1);
            this.drawBox(this.boxMask);
            this.boxMask.endFill();

            // Update the box outline
            this.box.clear();
            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.drawBox(this.box);
        },

        drawBox: function(box) {
            var spaceRect = this.simulation.spaceRect;
            this.boxWidth  = Math.abs(this.mvt.modelToViewDeltaX(this.simulation.spaceRect.w));
            this.boxHeight = Math.abs(this.mvt.modelToViewDeltaY(this.simulation.spaceRect.h));

            this.boxCorner = this.mvt.modelToView({
                x: spaceRect.x,
                y: spaceRect.y
            });

            box.drawRect(this.boxCorner.x, this.boxCorner.y, this.boxWidth, this.boxHeight);
        },

        getLeft: function() {
            return this.boxCorner.x;
        },

        getTop: function() {
            return this.boxCorner.y;
        },

        getBottom: function() {
            return this.boxCorner.y + this.boxHeight;
        },

        update: function(time, deltaTime, paused) {
            this.photonCollectionView.update(time, deltaTime, paused);
            this.atomicModelViews[this.currentAtomicModelViewIndex].update(time, deltaTime, paused);
        },

        reset: function() {
            
        },

        atomicModelChanged: function() {
            // Deactivate old view
            this.atomicModelViews[this.currentAtomicModelViewIndex].deactivate();
            
            // Find current view
            if (this.simulation.get('experimentSelected')) {
                this.currentAtomicModelViewIndex = 0;
            }
            else {
                var currentAtomicModel = this.simulation.get('atomicModel');
                this.currentAtomicModelViewIndex = _.findKey(AtomicModels, function(atomicModel) {
                    return (atomicModel === currentAtomicModel);
                });
            }

            // Activate current view
            this.atomicModelViews[this.currentAtomicModelViewIndex].activate();
        }

    });


    return SpaceBoxView;
});