define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                           require('common/v3/pixi/extensions');
    var PixiView         = require('common/v3/pixi/view');
    var WavelengthColors = require('common/colors/wavelength');
    var Vector2          = require('common/math/vector2');
    var PhysicsUtil      = require('common/quantum/models/physics-util');

    var StandingWaveView     = require('views/wave/standing');
    var TravelingWaveView    = require('views/wave/traveling');
    var NonLasingWaveGraphic = require('views/wave/non-lasing');

    var Constants = require('constants');

    /**
     * A graphic that shows a standing wave whose amplitude is proportional to the number of photons
     *   that are traveling more-or-less horizontally. It has a separate standing wave for inside the
     *   cavity and a travelling wave for outside. It doesn't really work as a CompositePhetGraphic,
     *   however, because it doesn't get added to the ApparatusPanel itself. Its two components do.
     *   This is necessary because they need to be on different levels.
     */
    var LaserWaveView = PixiView.extend({

        // This factor controls the visual amplitude of the waves inside and outside of the cavity
        scaleFactor: 10,
        cyclesInCavity: 10,
        // The waves that are shown when the thins is not lasing
        numNonLasingExternalWaveGraphics: 5,

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.simulation, 'atomic-states-changed', this.energyLevelsChanged);
            this.energyLevelsChanged();
        },

        initGraphics: function() {
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();

            var tube = this.simulation.tube;
            var internalWaveOrigin = new Vector2(tube.getMinX(), tube.getMinY() + tube.getHeight() / 2);
            var externalWaveOrigin = new Vector2(tube.getMinX() + tube.getWidth(), tube.getMinY() + tube.getHeight() / 2);

            this.internalStandingWaveView = new StandingWaveView({
                mvt: this.mvt,
                simulation: this.simulation,
                origin: internalWaveOrigin,
                extent: tube.getWidth(),
                lambda: tube.getWidth() / this.cyclesInCavity,
                period: 100,
                amplitude: this.getNumLasingPhotons(),
                color: '#fff'
            });

            this.externalTravelingWaveView = new TravelingWaveView({
                mvt: this.mvt,
                simulation: this.simulation,
                origin: externalWaveOrigin,
                extent: 400,
                lambda: tube.getWidth() / this.cyclesInCavity,
                period: 100,
                amplitude: this.getNumLasingPhotons(),
                color: '#fff'
            });

            this.foregroundLayer.addChild(this.internalStandingWaveView.displayObject);
            this.backgroundLayer.addChild(this.externalTravelingWaveView.displayObject);

            // Create the non-lasing wave graphics
            var dTheta = 20;
            var dy = tube.getHeight() / this.numNonLasingExternalWaveGraphics;
            var j = Math.floor(this.numNonLasingExternalWaveGraphics / 2);
            this.nonLasingExternalWaveViews = [];

            for (var i = 0; i < this.numNonLasingExternalWaveGraphics; i++) {
                var theta = (i - j) * dTheta;
                var yOffset = (i - j) * dy;

                var nonLasingWaveOrigin = new Vector2(
                    tube.getMinX() + tube.getWidth(),
                    tube.getMinY() + (tube.getHeight() / 2) + yOffset
                );

                var waveView = new NonLasingWaveGraphic({
                    mvt: this.mvt,
                    simulation: this.simulation,
                    origin: nonLasingWaveOrigin,
                    extent: tube.getWidth(),
                    lambda: tube.getWidth() / this.cyclesInCavity,
                    period: 100,
                    amplitude: this.getNumLasingPhotons(),
                    color: '#fff',
                    angle: theta * (Math.PI / 180)
                });

                this.nonLasingExternalWaveViews[i] = waveView;
                this.backgroundLayer.addChild(waveView.displayObject);
            }

            this.updateMVT(this.mvt);
        },

        getColor: function() {
            var deltaEnergy = this.middleState.getEnergyLevel() - this.groundState.getEnergyLevel();
            var hex = WavelengthColors.nmToHex(PhysicsUtil.energyToWavelength(deltaEnergy));
            return hex;
        },

        getNumLasingPhotons: function() {
            return this.simulation.lasingPhotons.length;
        },

        getExternalAmplitude: function() {
            var n = this.getInternalAmplitude();
            if (this.simulation.rightMirror)
                return n * Math.sqrt(1 - this.simulation.rightMirror.getReflectivity());
            else
                return 0;
        },

        getInternalAmplitude: function() {
            var n = 4 * Math.sqrt(Math.max(0, this.getNumLasingPhotons() - Constants.LASING_THRESHOLD));

            return n;
        },

        update: function(time, deltaTime, paused) {
            this.internalStandingWaveView.setAmplitude(this.getInternalAmplitude());
            this.externalTravelingWaveView.setAmplitude(this.getExternalAmplitude());

            this.internalStandingWaveView.update(time, deltaTime, paused);
            this.externalTravelingWaveView.update(time, deltaTime, paused);

            var amp = this.getNumLasingPhotons() > Constants.LASING_THRESHOLD ? 0 : (this.getNumLasingPhotons() / 6);
            for (var i = 0; i < this.nonLasingExternalWaveViews.length; i++) {
                this.nonLasingExternalWaveViews[i].setAmplitude(amp);
                this.nonLasingExternalWaveViews[i].update(time, deltaTime, paused);
            }
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.internalStandingWaveView.updateMVT(mvt);
            this.externalTravelingWaveView.updateMVT(mvt);
        },

        /**
         * Updates the color to be used for the wave graphics. This is the wavelength
         *   associated with the energy differential between the ground state and the
         *   next state up.
         */
        updateColor: function() {
            var color = this.getColor();

            this.internalStandingWaveView.setColor(color);
            this.externalTravelingWaveView.setColor(color);

            for (var i = 0; i < this.nonLasingExternalWaveViews.length; i++)
                this.nonLasingExternalWaveViews[i].setColor(color);
        },

        energyLevelsChanged: function() {
            if (this.groundState)
                this.stopListening(this.groundState);
            if (this.middleState)
                this.stopListening(this.middleState);

            this.groundState = this.simulation.getGroundState();
            this.middleState = this.simulation.getMiddleEnergyState();

            this.listenTo(this.groundState, 'change:energyLevel', this.updateColor);
            this.listenTo(this.middleState, 'change:energyLevel', this.updateColor);

            this.updateColor();
        },

        show: function() {
            this.backgroundLayer.visible = true;
            this.foregroundLayer.visible = true;
        },

        hide: function() {
            this.backgroundLayer.visible = false;
            this.foregroundLayer.visible = false;
        }

    });
    
    return LaserWaveView;
});
