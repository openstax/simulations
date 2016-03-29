define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Constants = require('constants');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    /**
     * A view that represents an electron
     */
    var AtomNodeView = PixiView.extend({

        /**
         * Initializes the new AtomNodeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.model = options.model;
            this.simulation = options.simulation;
            this.scale = options.scale;

            this.initGraphics();

            this.listenTo(this.model, 'change:radius', this.updateAtomNode);
            this.listenTo(this.simulation.rayGun, 'change:hold', this.updateAtomNode);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.atomBoundary = new PIXI.Graphics();
            this.atoms = new PIXI.Graphics();


            this.proton = ParticleGraphicsGenerator.generateProton(this.particleMVT);
            this.neutron = ParticleGraphicsGenerator.generateNeutron(this.particleMVT);

            this.displayObject.addChild(this.atoms);
            this.displayObject.addChild(this.atomBoundary);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        update: function() {
            this.updateAtomNode();
        },

        updateAtomNode: function(){
            if(this.simulation.rayGun.get('hold')){
                this.drawSimple();
            } else {
                this.drawAtoms();
            }
        },

        drawSimple: function(){
            this.atoms.visible = false;
            this.atomBoundary.visible = true;
            this.atomBoundary.clear();
            this.atomBoundary.lineStyle(1, 0XFFFFFF, 0.5);

            this.atomBoundary.drawCircle(
                this.mvt.modelToViewX(AtomNodeView.center.x),
                this.mvt.modelToViewY(AtomNodeView.center.y),
                this.model.get('radius')
            );
        },

        drawAtoms: function(){
            this.atoms.visible = true;
            this.atomBoundary.visible = false;

            this.atoms.removeChildren();
            this.atoms.clear();
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
                    this.atoms.addChild(newProton);
                }

                // neutrons
                if ( i < this.model.get('neutronCount') ) {
                    var randomN = this.getRandomPointWithinRadius(maxNeutronRadius);

                    var newNeutron = ParticleGraphicsGenerator.generateNeutron(this.particleMVT);
                    newNeutron.x = randomN.x;
                    newNeutron.y = randomN.y;
                    this.atoms.addChild(newNeutron);
                }
            }

        },

        getRandomPointWithinRadius: function(radius) {
            var delta = radius * Math.sqrt( Math.random() ); // random from center distance
            var theta = 2 * Math.PI * Math.random(); // random angle around center
            var x = ( AtomNodeView.center.x ) + ( delta * Math.cos( theta ) );
            var y = ( AtomNodeView.center.y ) + ( delta * Math.sin( theta ) );

            return this.mvt.modelToView({x: x, y: y});
        }

    }, {center: {x: 0, y: 0}});


    return AtomNodeView;
});