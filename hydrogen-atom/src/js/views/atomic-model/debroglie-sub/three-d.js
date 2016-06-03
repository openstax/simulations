define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Matrix3D = require('common/math/matrix-3d');

    var DeBroglieModelSubView = require('hydrogen-atom/views/atomic-model/debroglie-sub');
    var Wireframe3DView       = require('hydrogen-atom/views/wireframe-3d');

    var Constants = require('constants');
    
    /**
     * Represents the scene for the DeBroglieModel
     */
    var DeBroglieModel3DSubView = DeBroglieModelSubView.extend({

        /**
         * Initializes the new DeBroglieModel3DSubView.
         */
        initialize: function(options) {
            this.viewAngle = 0;
            this.viewMatrix = new Matrix3D();

            DeBroglieModelSubView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DeBroglieModelSubView.prototype.initGraphics.apply(this, arguments);

            this.wireframeView = new Wireframe3DView({
                matrix3D: this.viewMatrix,
                color: DeBroglieModel3DSubView.WAVE_COLOR,
                width: DeBroglieModel3DSubView.WAVE_LINE_WIDTH
            });
            this.displayObject.addChild(this.wireframeView.displayObject);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            DeBroglieModelSubView.prototype.updateMVT.apply(this, arguments);

            var viewPosition = this.getViewPosition();
            this.orbitalGraphics.x = viewPosition.x;
            this.orbitalGraphics.y = viewPosition.y;

            this.wireframeView.displayObject.x = viewPosition.x;
            this.wireframeView.displayObject.y = viewPosition.y;

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

                this.updateWireframe();
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

        updateWireframe: function() {
            var atom = this.getAtom();
            var numberOfVerticies = DeBroglieModel3DSubView.WAVE_VERTICIES;
            var deltaAngle = (2 * Math.PI) / numberOfVerticies;
            var radius = this.mvt.modelToViewDeltaX(atom.getElectronOrbitRadius());
            var maxHeight = DeBroglieModel3DSubView.MAX_HEIGHT;

            this.wireframeView.reset();
            
            for (var i = 0; i < numberOfVerticies; i++) {
                var angle = i * deltaAngle;
                var x = radius * Math.cos(angle);
                var y = radius * Math.sin(angle);
                var z = maxHeight * atom.getAmplitude(angle);
                this.wireframeView.addVertex(x, y, z);
            }

            this.wireframeView.connectVerticesAsLoop();
            this.wireframeView.draw();
        },

        activate: function() {
            this.viewAngle = 0;
            this.updateOrbitalScale();
            this.updateMatrix();
            this.updateWireframe();

            DeBroglieModelSubView.prototype.activate.apply(this, arguments);
        },

    }, Constants.DeBroglieModel3DSubView);


    return DeBroglieModel3DSubView;
});