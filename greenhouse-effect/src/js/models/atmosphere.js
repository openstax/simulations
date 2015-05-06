define(function (require) {

    'use strict';

    var Annulus        = require('models/annulus');
    var BandpassFilter = require('models/filter/bandpass');

    /**
     * Model representation of an atmosphere.
     */
    var Atmosphere = Annulus.extend({

        defaults: _.extend({}, Annulus.prototype.defaults, {
            greenhouseGasConcentration: Atmosphere.DEFAULT_GREENHOUSE_GAS_CONCENTRATION
        }),

        /**
         * Requires an Earth instance to be specified in the options
         *   under the key 'earth'.
         */
        initialize: function(attributes, options) {
            Annulus.prototype.initialize.apply(this, [attributes, options]);

            // this.troposphereThickness  = Atmosphere.TROPOSPHERE_THICKNESS;
            // this.stratosphereThickness = Atmosphere.STRATOSPHERE_THICKNESS;

            this.troposphere = new Annulus({
                center: options.earth.get('position'),
                innerDiameter: 2 *  options.earth.get('radius'),
                outerDiameter: 2 * (options.earth.get('radius') + Atmosphere.TROPOSPHERE_THICKNESS)
            });

            this.greenhouseGasFilter = new BandpassFilter(
                Constants.IR_WAVELENGTH,
                Constants.IR_WAVELENGTH
            );
        },

        /**
         * Scatters a photon or lets it pass depending on its
         *   altitude and the greenhouse gasses and probability.
         */
        interactWithPhoton: function(photon) {
            // Is the photon of a wavelength that is affected by greenhouse gasses?
            if (this.greenhouseGasFilter.passes(photon.get('wavelength'))) {
                // The likelihood of being scattered is dependent on the altitude
                var altitude = this.troposphere.distanceFromInnerDiameter(photon.getPosition());
                var probability = (Atmosphere.TROPOSPHERE_THICKNESS - altitude) * this.get('greenhouseGasConcentration');
                if (Math.random() <= probability) {
                    // Scatter the photon in a random direction.
                    var dispersionAngle = Math.PI / 4;
                    var theta = Math.random() * dispersionAngle + (Math.PI * 3 / 2) - (dispersionAngle / 2);
                    theta += Math.random() < 0.5 ? 0 : Math.PI;

                    var vBar = photon.get('velocity').length();
                    photon.setVelocity(
                        vBar * Math.cos(theta),
                        vBar * Math.sin(theta)
                    );
                }
            }
        }

    }, Constants.Atmosphere);

    return Atmosphere;
});