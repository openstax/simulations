define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _    = require('underscore');

    var HybridView = require('common/v3/pixi/view/hybrid');

    var BohrModel = require('hydrogen-atom/models/atomic-model/bohr');

    var Constants = require('constants');
    
    /**
     * Represents the zoomed in view of the scene and what's happening at the atomic level
     */
    var AtomicModelView = HybridView.extend({

        /**
         * Initializes the new AtomicModelView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.simulation = options.simulation;

            this.initGraphics();

            this.hide();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {},

        /**
         * Draws the orbital paths to a given graphics object
         */
        drawOrbitals: function(graphics) {
            graphics.clear();
            graphics.lineStyle(1, 0xFFFFFF, 1);

            var dashStyle = [2, 2];
            var viewPosition = this.getViewPosition();
            var x = viewPosition.x;
            var y = viewPosition.y;
            var groundState = BohrModel.getGroundState();
            var numberOfStates = BohrModel.getNumberOfStates();
            for (var state = groundState; state < (groundState + numberOfStates); state++) {
                var radius = this.mvt.modelToViewDeltaX(BohrModel.getOrbitRadius(state));
                graphics.dashCircle(x, y, radius, dashStyle);
            }
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        getViewPosition: function() {
            return this.mvt.modelToView(this.getAtom().get('position'));
        },

        getViewDiameter: function() {
            return this.mvt.modelToViewDeltaX(this.getAtom().get('radius') * 2);
        },

        update: function(time, deltaTime, paused) {},

        activate: function() {
            this.atom = this.simulation.atom;
            this.updateMVT(this.mvt);
            this.show();
        },

        deactivate: function() {
            this.hide();
        },

        show: function() {
            HybridView.prototype.show.apply(this, arguments);

            this.$el.show();
        },

        hide: function() {
            HybridView.prototype.hide.apply(this, arguments);

            this.$el.hide();
        },

        getAtom: function() {
            return this.simulation.atom;
        }

    });


    return AtomicModelView;
});