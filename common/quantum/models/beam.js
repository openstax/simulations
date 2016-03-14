define(function (require) {

    'use strict';

    var _           = require('underscore');
    var gaussRandom = require('gauss-random');

    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Particle       = require('common/mechanics/models/particle');

    var VanillaPhoton = require('./photon-vanilla');

    /**
     * A PhotonSource of photons that all have identical speeds. Their directions can
     *   vary by a specified fanout angle.
     *
     * The beam has a beamWidth, and the photons are randomly distributed across that
     *   beamWidth.
     *
     * Its position is at the midpoint of that beamWidth.
     */
    var Beam = Particle.extend({

        defaults: _.extend({}, Particle.prototype.defaults, {
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
            Particle.prototype.initialize.apply(this, [attributes, options]);

            this.nextTimeToProducePhoton = 0;
            // The rate at which the beam produces photons
            this.timeSinceLastPhotonProduced = 0;

            if (options && options.direction)
                this.photonVelocity = new Vector2(options.direction).normalize().scale(this.get('speed'));

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
        update: function(time, deltaTime) {
            Particle.prototype.update.apply(this, arguments);
            
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
                            photonLoc.y - this.getY(),
                            photonLoc.x - this.getX()
                        );
                        var alpha = this.photonVelocity.angle() - angleToPhoton;
                        if (alpha > 0)
                            angle *= -1;
                        
                        var photonVelocity = this._photonVelocity.set(this.photonVelocity).rotate(angle);
                        var newPhoton = VanillaPhoton.create({
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

            this.photonVelocity.set(this._direction);
        },

        getDirection: function() {
            return this.photonVelocity.angle();
        },

        generatePosition: function() {
            var r = Math.random();
            var inset = 10;  // inset from the edges of the "beam" that photons are emitted
            var d = r * ((this.get('beamWidth') - inset) / 2) * (Math.random() < 0.5 ? 1 : -1);
            var dx =  d * Math.sin(this.photonVelocity.angle());
            var dy = -d * Math.cos(this.photonVelocity.angle());
            return this._generatedPosition.set(this.getX() + dx, this.getY() + dy);
        },

        getNextTimeToProducePhoton: function() {
            var temp = this.get('photonProductionIsGaussian') ? (gaussRandom() + 1.0) : 1;
            return temp / (this.get('photonsPerSecond') / 1000);
        },

        getBounds: function() {
            var alpha = this.get('fanout') / 2;
            var x = this.getX();
            var y = this.getY();
            var length = this.get('length');
            var beamWidth = this.get('beamWidth');

            var curve = new PiecewiseCurve();
            curve.moveTo(x, y);
            curve.lineToRelative(0, -beamWidth / 2);
            curve.lineToRelative(length * Math.cos(alpha), -length * Math.sin(alpha) / 2);
            curve.lineToRelative(0, beamWidth + length * Math.sin(alpha));
            curve.lineToRelative(-length * Math.cos(alpha), -length * Math.sin(alpha) / 2);
            curve.close();

            // Rotate it around the position
            curve.translate(-x, -y);
            curve.rotate(this.getDirection());
            curve.translate(x, y);

            return curve;
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