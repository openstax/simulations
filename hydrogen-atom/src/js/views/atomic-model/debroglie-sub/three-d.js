define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Matrix3D = require('common/math/matrix-3d');

    var DeBroglieModelSubView = require('hydrogen-atom/views/atomic-model/debroglie-sub');

    var Constants = require('constants');
    
    /**
     * Represents the scene for the DeBroglieModel
     */
    var DeBroglieModel3DSubView = DeBroglieModelSubView.extend({

        /**
         * Initializes the new DeBroglieModel3DSubView.
         */
        initialize: function(options) {
            DeBroglieModelSubView.prototype.initialize.apply(this, arguments);

            this.viewAngle = 0;
            this.viewMatrix = new Matrix3D();
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            DeBroglieModelSubView.prototype.updateMVT.apply(this, arguments);

            var viewPosition = this.getViewPosition();
            this.orbitalGraphics.x = viewPosition.x;
            this.orbitalGraphics.y = viewPosition.y;
            this.drawOrbitals(this.orbitalGraphics);
        },

        update: function(time, deltaTime, paused) {
            DeBroglieModelSubView.prototype.update.apply(this, arguments);

            if (this.simulation.updated()) {
                if (this.viewAngle < DeBroglieModel3DSubView.FINAL_VIEW_ANGLE) {
                    this.viewAngle += DeBroglieModel3DSubView.VIEW_ANGLE_DELTA;
                    if (this.viewAngle > DeBroglieModel3DSubView.FINAL_VIEW_ANGLE)
                        this.viewAngle = DeBroglieModel3DSubView.FINAL_VIEW_ANGLE;

                    this.updateOrbitalScale();
                    this.updateMatrix();
                }
            }
        },

        updateOrbitalScale: function() {
            var t = this.viewAngle / DeBroglieModel3DSubView.FINAL_VIEW_ANGLE;
            var yScale = 1 - (t * (1 - DeBroglieModel3DSubView.ORBIT_Y_SCALE));
            this.orbitalGraphics.scale.y = yScale;
        },

        updateMatrix: function() {
            this.viewMatrix.unit();
            this.viewMatrix.xrot(this.viewAngle);
        },

        activate: function() {
            this.viewAngle = 0;

            DeBroglieModelSubView.prototype.activate.apply(this, arguments);
        },

    }, Constants.DeBroglieModel3DSubView);


    return DeBroglieModel3DSubView;
});