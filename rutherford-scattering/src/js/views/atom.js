define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    
    var Constants = require('constants');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * A view that represents an electron
     */
    var AtomView = PixiView.extend({

        /**
         * Initializes the new AtomView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.model = options.model;
            this.scale = options.scale;
            this.boundWidth = options.simulation.boundWidth;
            this.maskBox = options.maskBox;

            this.initGraphics();

            this.listenTo(this.model, 'change:radius change:hold', this.updateAtom);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.nucleusBoundary = new PIXI.Graphics();
            this.nucleus = new PIXI.Graphics();


            this.proton = ParticleGraphicsGenerator.generateProton(this.particleMVT);
            this.neutron = ParticleGraphicsGenerator.generateNeutron(this.particleMVT);

            this.initElectron();

            this.displayObject.addChild(this.nucleus);
            this.displayObject.addChild(this.nucleusBoundary);
            this.displayObject.addChild(this.electronContainer);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateAtom();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.drawElectron(deltaTime);
        },

        updateAtom: function(){
            if(this.model.get('hold')){
                this.drawSimple();
            } else {
                this.drawAtom();
            }
        },

        drawSimple: function(){
            this.nucleus.visible = false;
            this.nucleusBoundary.visible = true;
            this.nucleusBoundary.clear();
            this.nucleusBoundary.lineStyle(1, 0XFFFFFF, 0.5);

            this.nucleusBoundary.drawCircle(
                this.mvt.modelToViewX(AtomView.center.x),
                this.mvt.modelToViewY(AtomView.center.y),
                this.model.get('radius')
            );
        },

        drawAtom: function(){
            this.nucleus.visible = true;
            this.nucleusBoundary.visible = false;

            this.nucleus.removeChildren();
            this.nucleus.clear();

            this.drawNucleus();
        },

        drawNucleus: function(){
            // Randomly place protons and neutrons inside a circle
            var maxProtonRadius = (this.model.get('radius') - ( this.proton.width / 2 ))/ this.scale;
            var maxNeutronRadius = (this.model.get('radius') - ( this.neutron.width / 2 ))/ this.scale;
            var maxParticles = Math.max( this.model.get('protonCount'), this.model.get('neutronCount') );

            for ( var i = 0; i < maxParticles; i++ ) {
                // protons
                if ( i < this.model.get('protonCount') ) {
                    var randomP = this.getRandomPointWithinRadius(maxProtonRadius);

                    var newProton = ParticleGraphicsGenerator.generateProton(this.particleMVT);
                    newProton.x = randomP.x;
                    newProton.y = randomP.y;
                    this.nucleus.addChild(newProton);
                }

                // neutrons
                if ( i < this.model.get('neutronCount') ) {
                    var randomN = this.getRandomPointWithinRadius(maxNeutronRadius);

                    var newNeutron = ParticleGraphicsGenerator.generateNeutron(this.particleMVT);
                    newNeutron.x = randomN.x;
                    newNeutron.y = randomN.y;
                    this.nucleus.addChild(newNeutron);
                }
            }

        },

        initElectron: function() {
            var atomCenter = _.clone(this.mvt.modelToView(AtomView.center));

            this.boundDiagonal = this.boundWidth * this.scale * Math.sqrt(2);
            this.electronOrbitRadius = 0.9 * this.boundDiagonal / 2;

            this.electronPath = new PIXI.Graphics();
            this.electronPath.lineStyle(0.5, 0XFFFFFF, 0.25);
            this.electronPath.drawCircle(
                atomCenter.x,
                atomCenter.y,
                this.electronOrbitRadius
            );

            this.electron = ParticleGraphicsGenerator.generateElectron(this.particleMVT);
            this.electron.x = this.mvt.modelToViewX(AtomView.center.x + this.electronOrbitRadius/this.scale);
            this.electron.y = atomCenter.y;

            this.electronContainer = new PIXI.Container();
            this.electronContainer.pivot.x = atomCenter.x;
            this.electronContainer.pivot.y = atomCenter.y;

            this.electronContainer.x = this.electronContainer.pivot.x;
            this.electronContainer.y = this.electronContainer.pivot.y;

            this.electronContainer.addChild(this.electronPath);
            this.electronContainer.addChild(this.electron);
            this.electronContainer.mask = this.maskBox;
        },

        drawElectron: function(deltaTime) {
            // Advance the electron along its orbit
            var deltaAngle = deltaTime * AtomView.ELECTRON_ANGULAR_SPEED;
            this.electronContainer.rotation += deltaAngle;
        },

        getRandomPointWithinRadius: function(radius) {
            var delta = radius * Math.sqrt( Math.random() ); // random from center distance
            var theta = 2 * Math.PI * Math.random(); // random angle around center
            var x = ( AtomView.center.x ) + ( delta * Math.cos( theta ) );
            var y = ( AtomView.center.y ) + ( delta * Math.sin( theta ) );

            return this.mvt.modelToView({x: x, y: y});
        }

    }, _.extend({center: {x: 0, y: 0}}, Constants.AtomView));


    return AtomView;
});