define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');
    var WavelengthColors   = require('common/colors/wavelength');
    var range              = require('common/math/range');
    var Vector2            = require('common/math/vector2');

    var BohrModel = require('hydrogen-atom/models/atomic-model/bohr');
    
    var Constants = require('constants');

    /**
     * Gun is the model of a gun that can fire either photons or alpha particles.
     * It is located at a point in space with a specific orientation and it 
     * has a nozzle with a specific width.
     * The gun's local origin is at the center of its nozzle.
     * When firing photons, it shoots a beam of light that wavelength and intensity.
     * When firing alpha particles, it shoots alpha particles with some intensity.
     */
    var Gun = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            orientation: 0, // In radians
            enabled: false, // is the gun on or off?
            mode: Constants.Gun.MODE_PHOTONS, // is the gun firing photons or alpha particles?
            nozzleWidth: 0, // width of the beam
            lightType: Constants.Gun.LIGHT_MONOCHROME, // type of light (white or monochromatic)
            lightIntensity: Constants.Gun.DEFAULT_LIGHT_INTENSITY, // intensity of the light, 0.0-1.0
            wavelength: Constants.Gun.DEFAULT_WAVELENGTH, // wavelength of the light
            minWavelength: 0, 
            maxWavelength: 0, // range of wavelength
            alphaParticlesIntensity: Constants.Gun.DEFAULT_ALPHA_PARTICLE_INTENSITY, // intensity of the alpha particles, 0.0-1.0
            maxParticles: undefined // particles in the animation box when gun intensity is 100%
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            this.dtPerGunFired = 0;
            this.dtSinceGunFired = 0;
            // Get transition wavelengths for state 1, which are all UV.
            this.transitionWavelengths = BohrModel.getTransitionWavelengths(this.get('minWavelength'), WavelengthColors.MIN_WAVELENGTH);
            this.visibleWavelengthRange = range({ min: WavelengthColors.MIN_WAVELENGTH, max: WavelengthColors.MAX_WAVELENGTH });

            // Cached objects
            this._point    = new Vector2();
            this._position = new Vector2();

            this.on('change:maxParticles', this.maxParticlesChanged);

            this.set('maxParticles', 20);
        },

        /**
         * Is the gun in the mode to fire photons (light)?
         */
        isPhotonsMode: function() {
            return (this.get('mode') === Gun.MODE_PHOTONS);
        },
        
        /**
         * Is the gun in the mode to fire alpha particles?
         */
        isAlphaParticlesMode: function() {
            return (this.get('mode') === Gun.MODE_ALPHA_PARTICLES);
        },
        
        /**
         * Is the gun configured to fire white light?
         */
        isWhiteLightType: function() {
            return (this.get('lightType') == Gun.LIGHT_WHITE);
        },
        
        /**
         * Is the gun configured to fire monochromatic light?
         */
        isMonochromaticLightType: function() {
            return (this.get('lightType') == Gun.LIGHT_MONOCHROMATIC);   
        },
        
        /**
         * Gets the color assoociate with the gun's monochromatic wavelength.
         */
        getWavelengthColor: function() {
            var wavelength = this.get('wavelength');

            if (wavelength === Constants.WHITE_WAVELENGTH) {
                // Special case: white light.
                return Color.WHITE;
            }
            else if (wavelength < WavelengthColors.MIN_WAVELENGTH) {
                return Constants.UV_COLOR;
            }
            else if (wavelength > WavelengthColors.MAX_WAVELENGTH) {
                return Constants.IR_COLOR;
            }
            else {
                return WavelengthColors.nmToHex(wavelength);
            }
        },
        
        /**
         * Gets the color of the gun's beam.
         * The alpha component of the Color returned corresponds to the intensity.
         * If the gun is disabled, null is returned.
         * If the gun is shooting alpha particles, HAConstants.ALPHA_PARTICLES_COLOR is returned.
         * If the gun is shooting white light, Color.WHITE is returned.
         * If the gun is shooting monochromatic light, a Color corresponding to the wavelength is returned.
         */
        getBeamColor: function() {
            if (this.get('enabled')) {
                if (this.isPhotonsMode()) {
                    if (this.isWhiteLightType())
                        return '#fff';
                    else
                        return this.getWavelengthColor();
                }
                else {
                    return Constants.ALPHA_PARTICLES_COLOR;
                }
            }
            
            return null;
        },

        getBeamAlpha: function() {
            var beamColor = this.getBeamColor();
            if (beamColor) {
                return (this.isPhotonsMode() ?
                    this.get('lightIntensity') : 
                    this.get('alphaParticlesIntensity')
                );
            }

            return null;
        },

        /**
         * Gets a wavelength that would be appropriate for a new photon.
         * 
         * For monochromatic light, we simply use the value of the gun's
         * monochromatic wavelength.
         * 
         * For white light, the wavelength is randomly chosen.
         * Instead of simply picking a wavelength from the gun's entire range,
         * we give a higher weight to those wavelengths that are would cause 
         * a transition from state 1 to some other state.  We consider only
         * the wavelengths relevant to state=1 because all of the other 
         * transitions are very improbably in practice. This increases the
         * probability that the photon we fire will interact with the atom.
         */
        getRandomWavelength: function() {
            var wavelength = 0;

            if (this.isMonochromaticLightType()) {
                wavelength = this.get('wavelength');
            }
            else { 
                // White light
                if (Math.random() < Gun.TRANSITION_WAVELENGTHS_WEIGHT) {
                    // Choose a random transition wavelength
                    wavelength = _.sample(this.transitionWavelengths);
                }
                else {
                    // choose a random visible wavelength
                    wavelength = this.visibleWavelengthRange.random();
                }
            }
            
            if (!(wavelength >= this.get('minWavelength') && wavelength <= this.get('maxWavelength')))
                throw 'Random wavelength is not within the required range.';

            return wavelength;
        },
        
        /**
         * Gets a random point along the gun's nozzle.
         * This is based on the nozzle width, gun position, and gun orientation.
         */
        getRandomNozzlePoint: function() {
            // Start with the gun's origin at zero, gun pointing to the right
            var x = 1;
            var y = 0;
            if (Math.random() > Gun.CENTER_FIRE_PROBABILITY)
                y = (Math.random() * this.get('nozzleWidth')) - (this.get('nozzleWidth') / 2);

            // Rotate by gun's orientation
            var p = this._point.set(x, y);
            p.rotate(this.get('orientation'));
            // Translate by the gun's position
            p.add(this.getPosition());
            
            return p;
        },

        /**
         * Fires photons or alpha particles each time that time advances.
         * If the gun is disabled, do nothing.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled')) {
                if (this.isPhotonsMode() && this.get('lightIntensity') > 0)
                    this.firePhoton(deltaTime);
                else if (this.isAlphaParticlesMode() && this.get('alphaParticlesIntensity') > 0)
                    this.fireAlphaParticle(deltaTime);
            }
        },
        
        /**
         * Fires one photon from the center of the gun.
         */
        fireOnePhotonFromCenter: function(wavelength) {
            // Fire from the center of the gun's nozzle
            var position = this._position.set(1, 0);
            
            // Rotate by the gun's orientation
            position.rotate(this.get('orientation'));
            // Translate by the gun's position
            position.add(this.getPosition());
            
            // Other photon properties
            var orientation = this.get('orientation');
            var speed = Constants.PHOTON_INITIAL_SPEED;

            // Fire a new photon
            this.firePhotonFired(Photon.create({
                wavelength: wavelength, 
                position: position, 
                orientation: orientation, 
                speed: speed
            }));
        },
        
        /**
         * Fires a photon when it's time to do so.
         * Each photon is fired from a random location along the gun's nozzle.
         */
        firePhoton: function(deltaTime) {
            this.dtSinceGunFired += (this.get('lightIntensity') * deltaTime);
            
            // Fire a photon?
            if (this.dtSinceGunFired >= this.dtPerGunFired) {
                this.dtSinceGunFired = this.dtSinceGunFired % this.dtPerGunFired;
                
                // Photon properties
                var position = this.getRandomNozzlePoint();
                var orientation = this.getOrientation();
                var speed = Constants.PHOTON_INITIAL_SPEED;
                var wavelength = this.getRandomWavelength();

                // Fire a new photon
                this.firePhotonFired(Photon.create({
                    wavelength: wavelength, 
                    position: position, 
                    orientation: orientation, 
                    speed: speed
                }));
            }
        },
        
        /**
         * Fires an alpha particle when it's time to do so.
         * Each alpha particle is fired from a random location along the gun's nozzle.
         */
        fireAlphaParticle: function(deltaTime) {
            this.dtSinceGunFired += (this.get('alphaParticlesIntensity') * deltaTime);

            if (this.dtSinceGunFired >= this.dtPerGunFired) {
                this.dtSinceGunFired = this.dtSinceGunFired % this.dtPerGunFired;
                
                // Pick a randon location along the gun's nozzle width
                var position = this.getRandomNozzlePoint();
                // Direction of alpha particle is same as gun's orientation.
                var orientation = this.getOrientation();
                var speed = Constants.ALPHA_PARTICLE_INITIAL_SPEED;

                // Fire a new alpha particle
                this.fireAlphaParticleFired(AlphaParticle.create({
                    position: position, 
                    orientation: orientation, 
                    speed: speed
                }));
            }
        },

        // Fires when a photon is fired.
        firePhotonFired: function(photon) {
            this.trigger('photon-fired', photon);
        },
        
        // Fires when an alpha particle is fired.
        fireAlphaParticleFired: function(alphaParticle) {
            this.trigger('alpha-particle-fired', alphaParticle);
        },

        maxParticlesChanged: function(model, maxParticles) {
            this.dtPerGunFired = (Constants.ANIMATION_BOX_SIZE.height / Constants.PHOTON_INITIAL_SPEED) / maxParticles;
        }

    }, Constants.Gun);

    return Gun;
});