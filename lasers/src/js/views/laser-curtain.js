define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                           require('common/v3/pixi/extensions');
    var PixiView         = require('common/v3/pixi/view');
    var Colors           = require('common/colors/colors');
    var WavelengthColors = require('common/colors/wavelength');
    var Rectangle        = require('common/math/rectangle');
    var PiecewiseCurve   = require('common/math/piecewise-curve');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var Constants = require('constants');

    /**
     * This is a color-filled overlay that increases in opacity as the
     *   internal laser power increases to show a build-up of energy.
     */
    var LaserCurtainView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            options = _.extend({
                maxAlpha: 0.7
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.modelShape = options.modelShape;
            this.maxAlpha = options.maxAlpha;

            this.listenTo(this.simulation, 'atomic-states-changed', this.energyLevelsChanged);
            this.energyLevelsChanged();

            this.updateMVT(options.mvt);
        },

        setMaxAlpha: function(maxAlpha) {
            this.maxAlpha = maxAlpha;
        },

        draw: function() {
            // Determine the proper opacity of the shape's fill color
            var numLasingPhotons = this.simulation.lasingPhotons.length;
            var level = (numLasingPhotons > Constants.LASING_THRESHOLD) ? numLasingPhotons : 0;
            var alpha = (level / Constants.KABOOM_THRESHOLD) * this.maxAlpha;
            alpha = 0.7;

            // Determine the proper color
            var deltaEnergy = this.middleState.getEnergyLevel() - this.groundState.getEnergyLevel();
            var hex = WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));
            var color = Colors.parseHex(hex);

            // Determine the bounds in view space
            var shape = this.mvt.modelToView(this.modelShape);

            // Draw it
            var graphics = this.displayObject;
            graphics.clear();
            graphics.beginFill(color, alpha);

            if (shape instanceof Rectangle)
                graphics.drawRect(shape.x, shape.y, shape.w, shape.h);
            else if (shape instanceof PiecewiseCurve)
                graphics.drawPiecewiseCurve(shape);

            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        energyLevelsChanged: function() {
            if (this.groundState)
                this.stopListening(this.groundState);
            if (this.middleState)
                this.stopListening(this.middleState);

            this.groundState = this.simulation.getGroundState();
            this.middleState = this.simulation.getMiddleEnergyState();

            this.listenTo(this.groundState, 'change:energyLevel', this.draw);
            this.listenTo(this.middleState, 'change:energyLevel', this.draw);
        }

    });
    
    return LaserCurtainView;
});
