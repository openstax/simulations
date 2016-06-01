define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _    = require('underscore');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');
    
    /**
     * Represents the zoomed in view of the scene and what's happening at the atomic level
     */
    var AtomicModelView = PixiView.extend({

        /**
         * Initializes the new AtomicModelView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.simulation = options.simulation;

            this.initGraphics();
            // this.updateMVT(this.mvt);
            this.hide();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            // var graphics = new PIXI.Graphics();
            // graphics.beginFill(Math.random() * 0xFFFFFF, 1);
            // graphics.drawCircle(500, 300, 20);
            // graphics.endFill();
            // this.displayObject.addChild(graphics);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        getViewPosition: function() {
            return this.mvt.modelToView(this.simulation.atom.get('position'));
        },

        getViewDiameter: function() {
            return this.mvt.modelToViewDeltaX(this.simulation.atom.get('radius') * 2);
        },

        update: function(time, deltaTime, paused) {
            
        },

        activate: function() {
            this.atom = this.simulation.atom;
            this.updateMVT(this.mvt);
            this.show();
        },

        deactivate: function() {
            this.hide();
        }

    });


    return AtomicModelView;
});