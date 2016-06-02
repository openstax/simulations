define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var DeBroglieModel = require('hydrogen-atom/models/atomic-model/debroglie');

    var DeBroglieModelSubView = require('hydrogen-atom/views/atomic-model/debroglie-sub');

    var Constants = require('constants');
    var RING_COLOR = Colors.parseHex(Constants.ELECTRON_COLOR);

    
    /**
     * DeBroglieRadialDistanceNode represents the deBroglie model
     *   as a standing wave whose amplitude is proportional to the
     *   radial distance from the electron's orbit.
     */
    var DeBroglieModelRadialSubView = DeBroglieModelSubView.extend({

        /**
         * Initializes the new DeBroglieModelRadialSubView.
         */
        initialize: function(options) {
            DeBroglieModelSubView.prototype.initialize.apply(this, arguments);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DeBroglieModelSubView.prototype.initGraphics.apply(this, arguments);

            this.ringGraphics = new PIXI.Graphics();
            this.displayObject.addChild(this.ringGraphics);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            DeBroglieModelSubView.prototype.updateMVT.apply(this, arguments);

            this.drawOrbitals(this.orbitalGraphics);

            var viewPosition = this.getViewPosition();
            this.ringGraphics.x = viewPosition.x;
            this.ringGraphics.y = viewPosition.y;
        },

        update: function(time, deltaTime, paused) {
            DeBroglieModelSubView.prototype.update.apply(this, arguments);

            this.drawRing();
        },

        drawRing: function() {
            var graphics = this.ringGraphics;
            graphics.clear();
            graphics.lineStyle(2, RING_COLOR, 1);

            var atom = this.getAtom();
            var radius = this.mvt.modelToViewDeltaX(atom.getElectronOrbitRadius());
            var groundRadius = this.mvt.modelToViewDeltaX(DeBroglieModel.getOrbitRadius(DeBroglieModel.getGroundState()));
            var startX;
            var startY;

            for (var i = 0; i < DeBroglieModelRadialSubView.NUMBER_OF_SEGMENTS; i++) {
                var angle = (2 * Math.PI) * (i / DeBroglieModelRadialSubView.NUMBER_OF_SEGMENTS);
                var amplitude = atom.getAmplitude(angle);

                var maxRadialOffset = DeBroglieModelRadialSubView.RADIAL_OFFSET_FACTOR * groundRadius;
                var radialOffset = maxRadialOffset * amplitude;
                var x = ((radius + radialOffset) * Math.cos(angle));
                var y = ((radius + radialOffset) * Math.sin(angle));
                if (i === 0) {
                    graphics.moveTo(x, y);
                    startX = x;
                    startY = y;
                }
                else
                    graphics.lineTo(x, y);
            }

            graphics.lineTo(startX, startY);
        }

    }, Constants.DeBroglieModelRadialSubView);


    return DeBroglieModelRadialSubView;
});