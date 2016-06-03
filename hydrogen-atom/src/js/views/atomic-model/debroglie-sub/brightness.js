define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var DeBroglieModelSubView = require('hydrogen-atom/views/atomic-model/debroglie-sub');

    var Constants = require('constants');
    var plusRgb  = Colors.hexToRgb(Constants.DeBroglieModelBrightnessSubView.PLUS_COLOR);
    var minusRgb = Colors.hexToRgb(Constants.DeBroglieModelBrightnessSubView.MINUS_COLOR);
    var zeroRgb  = Colors.hexToRgb(Constants.DeBroglieModelBrightnessSubView.ZERO_COLOR);
    
    /**
     * DeBroglieBrightnessNode represents the deBroglie model
     *   as a standing wave. The amplitude (-1...+1) of the standing
     *   wave is represented by the brightness of color in a ring that 
     *   is positioned at the electron's orbit. The ring is approximated
     *   using a set of polygons.
     */
    var DeBroglieModelBrightnessSubView = DeBroglieModelSubView.extend({

        /**
         * Initializes the new DeBroglieModelBrightnessSubView.
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
            this.orbitalGraphics.x = viewPosition.x;
            this.orbitalGraphics.y = viewPosition.y;
        },

        update: function(time, deltaTime, paused) {
            DeBroglieModelSubView.prototype.update.apply(this, arguments);
        
            if (this.simulation.updated())
                this.drawRing();
        },

        drawRing: function() {
            var graphics = this.ringGraphics;
            graphics.clear();

            var radius = this.mvt.modelToViewDeltaX(this.atom.getElectronOrbitRadius());
            var circumference = Math.PI * 2 * radius;
            var numSegments = Math.floor(circumference / DeBroglieModelBrightnessSubView.SEGMENT_LENGTH) + 1;
            var ringWidth = DeBroglieModelBrightnessSubView.RING_WIDTH;
            var atom = this.getAtom();

            for (var i = 0; i < numSegments; i++) {
                var a1 = (2 * Math.PI) * (i / numSegments);
                var a2 = a1 + (2 * Math.PI / numSegments) + 0.001; // overlap!
                var r1 = radius - (ringWidth / 2);
                var r2 = radius + (ringWidth / 2);
                var cos1 = Math.cos(a1);
                var sin1 = Math.sin(a1);
                var cos2 = Math.cos(a2);
                var sin2 = Math.sin(a2);
                
                // Points that define the polygon
                var x1 = r1 * cos1;
                var y1 = r1 * sin1;
                var x2 = r2 * cos1;
                var y2 = r2 * sin1;
                var x3 = r2 * cos2;
                var y3 = r2 * sin2;
                var x4 = r1 * cos2;
                var y4 = r1 * sin2;

                var amplitude = atom.getAmplitude(a1);
                var color = this.amplitudeToColor(amplitude);
                
                // Shape for the polygon
                graphics.beginFill(color, 1);
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
                graphics.lineTo(x3, y3);
                graphics.lineTo(x4, y4);
                graphics.endFill();
            }
        },

        /**
         * Maps the specified amplitude to a color.
         * May be overridden by subclasses to provide different representations.
         */
        amplitudeToColor: function(amplitude) {
            if (!( amplitude >= -1 && amplitude <= 1 ))
                throw 'amplitude not in range';

            var rgba;
            if (amplitude > 0)
                rgba = Colors.interpolateRgba(plusRgb, zeroRgb, amplitude);
            else
                rgba = Colors.interpolateRgba(minusRgb, zeroRgb, -amplitude);

            return Colors.rgbToHexInteger(rgba);
        }

    }, Constants.DeBroglieModelBrightnessSubView);


    return DeBroglieModelBrightnessSubView;
});