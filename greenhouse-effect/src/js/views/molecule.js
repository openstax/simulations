define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');

    var AtomView       = require('views/atom');
    var AtomicBondView = require('views/atomic-bond');

    var Constants = require('constants');

    /**
     * A view that represents a molecule
     */
    var MoleculeView = PixiView.extend({

        /**
         * Initializes the new MoleculeView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.initBonds();
            this.initAtoms();
        },

        initBonds: function() {
            this.bondLayer = new PIXI.DisplayObjectContainer();
            this.atomicBondViews = [];

            var atomicBonds = this.model.getAtomicBonds();
            for (var i = 0; i < atomicBonds.length; i++) {
                var atomicBondView = new AtomicBondView({
                    model: atomicBonds[i],
                    mvt: this.mvt
                });
                this.atomicBondViews.push(atomicBondView);
                this.bondLayer.addChild(atomicBondView.displayObject);
            }

            this.displayObject.addChild(this.bondLayer);
        },

        initAtoms: function() {
            this.atomLayer = new PIXI.DisplayObjectContainer();
            this.atomViews = [];

            var atoms = this.model.getAtoms();
            for (var i = 0; i < atoms.length; i++) {
                var atomView = new AtomView({
                    model: atoms[i],
                    mvt: this.mvt
                });
                this.atomViews.push(atomView);
                this.atomLayer.addChild(atomView.displayObject);
            }

            this.displayObject.addChild(this.atomLayer);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBonds();
            this.updateAtoms();
        },

        updateBonds: function() {
            for (var i = 0; i < this.atomicBondViews.length; i++)
                this.atomicBondViews[i].updateMVT(this.mvt);
        },

        updateAtoms: function() {
            for (var i = 0; i < this.atomViews.length; i++)
                this.atomViews[i].updateMVT(this.mvt);
        }

    });

    return MoleculeView;
});