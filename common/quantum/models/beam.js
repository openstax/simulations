define(function (require) {

    'use strict';

    var _           = require('underscore');
    var gaussRandom = require('gauss-random');

    var Vector2            = require('common/math/vector2');
    var PositionableObject = require('common/models/positionable-object');

    var Photon = require('./photon');

    /**
     * A PhotonSource of photons that all have identical speeds. Their directions can
     *   vary by a specified fanout angle.
     *
     * The beam has a beamWidth, and the photons are randomly distributed across that
     *   beamWidth.
     *
     * Its position is at the midpoint of that beamWidth.
     *
     * The original Beam object extended Particle, but there's no reason for it to have
     *   motion capabilities or implement the Verlet method, so I'm limiting it to being
     *   positionable.
     */
    var Beam = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            wavelength: undefined,
            // Used to deterimine when photons should be produced
            photonsPerSecond: 0,
            // Maximum photon rate
            maxPhotonsPerSecond: undefined,
            // Angle at which the beam fans out, in radians
            fanout: 0,
            // Length of beam
            length: undefined,
            // Starting speed for photons
            speed: undefined,
            // Width of the beam
            beamWidth: undefined,
            // Whether or not we're firing photons
            enabled: false,
            // Flag to determine if photon production is Gaussian or fixed
            photonProductionIsGaussian: false
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            this.nextTimeToProducePhoton = 0;
            // The rate at which the beam produces photons
            this.timeSinceLastPhotonProduced = 0;

            if (options && options.direction)
                this.setVelocity(this.get('velocity').set(options.direction).normalize().scale(this.get('speed')));

            // Cached objects
            this._direction = new Vector2();
            this._generatedPosition = new Vector2();
            this._photonVelocity = new Vector2();

            this.on('change:photonsPerSecond', this.photonsPerSecondChanged);
            this.on('change:enabled', this.enabledChanged);
        },

        /**
         * 
         */
        update: function(deltaTime) {
            PositionableObject.prototype.update.apply(this, arguments);

            // Produce photons
            if (this.get('enabled')) {
                this.timeSinceLastPhotonProduced += deltaTime;
                if (this.nextTimeToProducePhoton < this.timeSinceLastPhotonProduced) {
                    var nPhotons = Math.floor(this.timeSinceLastPhotonProduced * this.get('photonsPerSecond') / 1E3);
                    for (var i = 0; i < nPhotons; i++) {
                        // Set the photon's velocity to a fanout angle proportional to its distance from
                        //   the center of the beam
                        var photonLoc = this.generatePosition();
                        var angle = (photonLoc.distance(this.get('position')) / this.get('beamWidth') / 2) * this.get('fanout');
                        var angleToPhoton = Math.atan2(
                            photonLoc.getY() - this.getY(),
                            photonLoc.getX() - this.getX()
                        );
                        var alpha = this.get('velocity').angle() - angleToPhoton;
                        if (alpha > 0)
                            angle *= -1;
                        
                        var photonVelocity = this._photonVelocity.set(this.get('velocity')).rotate(angle);
                        var newPhoton = new Photon({
                            wavelength: this.get('wavelength'),
                            position: photonLoc,
                            velocity: photonVelocity
                        });

                        this.trigger('photon-emitted', this, newPhoton);
                    }
                    
                    this.nextTimeToProducePhoton = this.getNextTimeToProducePhoton();
                    this.timeSinceLastPhotonProduced = 0;
                }
            }
        },

        setDirection: function(direction) {
            this._direction
                .set(direction)
                .normalize()
                .scale(this.get('speed'));

            this.setVelocity(this._direction);
        },

        generatePosition: function() {
            var r = Math.random();
            var inset = 10;  // inset from the edges of the "beam" that photons are emitted
            var d = r * ((this.get('beamWidth') - inset) / 2) * (Math.random() < 0.5 ? 1 : -1);
            var dx =  d * Math.sin(this.get('velocity').angle());
            var dy = -d * Math.cos(this.get('velocity').angle());
            return this._generatedPosition.set(this.getX() + dx, this.getY() + dy);
        },

        getNextTimeToProducePhoton: function() {
            var temp = this.get('photonProductionIsGaussian') ? (gaussRandom() + 1.0) : 1;
            return temp / (this.get('photonsPerSecond') / 1000);
        },

        photonsPerSecondChanged: function(photon, photonsPerSecond) {
            // The following if statement prevents the system from sending out a big
            //   wave of photons if it has been set at a rate of 0 for awhile.
            if (this.previous('photonsPerSecond') === 0)
                this.timeSinceLastPhotonProduced = 0;
            
            this.nextTimeToProducePhoton = this.getNextTimeToProducePhoton();
        },

        enabledChanged: function(photon, enabled) {
            this.timeSinceLastPhotonProduced = 0;
        }

    });

    return Beam;
});