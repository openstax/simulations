define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Rectangle        = require('common/math/rectangle');
    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');

    var BendingLightSimulation = require('models/simulation');
    var Medium                 = require('models/medium');
    var LightRay               = require('models/light-ray');

    /**
     * Constants
     */
    var Constants = require('constants');
    var MediumPropertiesPresets = require('medium-properties-presets');

    /**
     * Wraps the update function in 
     */
    var IntroSimulation = BendingLightSimulation.extend({

        // defaults: _.extend(BendingLightSimulation.prototype.defaults, {
        // }),
        
        initialize: function(attributes, options) {
            BendingLightSimulation.prototype.initialize.apply(this, [attributes, options]);

            

            this._bottom = new Rectangle(-10, -10, 20, 10);
            this._top    = new Rectangle(-10,   0, 20, 10);
            this._vec = new Vector2();
            this._distVec = new Vector2();
            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BendingLightSimulation.prototype.initComponents.apply(this, arguments);

            this.topMedium = new Medium({
                shape: new Rectangle(-1, 0, 2, 1), // In Meters, very large compared to visible model region in the stage
                mediumProperties: MediumPropertiesPresets.AIR
            });

            this.bottomMedium = new Medium({
                shape: new Rectangle(-1, -1, 2, 1),
                mediumProperties: MediumPropertiesPresets.WATER
            });

            this.listenTo(this.topMedium,    'change', this.mediumChanged);
            this.listenTo(this.bottomMedium, 'change', this.mediumChanged);
        },

        /**
         * Light rays were cleared from model before propagateRays was called, 
         *   this creates them according to the laser and mediums
         */
        propagateRays: function() {
            // Relatively large regions to keep track of which side the light is on
            var bottom = this._bottom;
            var top = this._top;

            if (this.laser.get('on')) {
                var tail = this.laser.get('emissionPoint');

                // Snell's law, see http://en.wikipedia.org/wiki/Snell's_law 
                //   for definition of n1, n2, theta1, theta2
                var n1 = this.getN1(); // Index in top medium
                var n2 = this.getN2(); // Index of bottom medium

                var theta1 = this.laser.getAngle() - Math.PI / 2;   // Angle from the up vertical
                var theta2 = Math.asin(n1 / n2 * Math.sin(theta1)); // Angle from the down vertical

                var sourcePower = 1.0; // Start with full strength laser
                var a = Constants.CHARACTERISTIC_LENGTH * 5; // Cross section of incident light, used to compute wave widths

                var sourceWaveWidth = a / 2; // This one fixes the input beam to be a fixed width independent of angle

                // According to http://en.wikipedia.org/wiki/Wavelength
                var wavelength = this.laser.get('wavelength');
                var wavelengthInTopMedium = wavelength / n1;

                // Since the n1 depends on the wavelength, when you change the wavelength, the
                //   wavelengthInTopMedium also changes (seemingly in the opposite direction).
                var incidentRay = LightRay.create(
                    tail,                  // tail
                    null,                  // tip
                    n1,                    // indexOfRefraction
                    wavelengthInTopMedium, // wavelength
                    sourcePower,           // powerFraction
                    wavelength,            // wavelength
                    sourceWaveWidth,       // waveWidth
                    0.0,                   // numWavelengthsPhaseOffset
                    bottom,                // oppositeMedium
                    true,                  // extend
                    false                  // extendBackwards
                );

                var rayAbsorbed = this.addAndAbsorb(incidentRay);
                if (!rayAbsorbed) {
                    var thetaOfTotalInternalReflection = Math.asin(n2 / n1);
                    var hasTransmittedRay = isNaN(thetaOfTotalInternalReflection) || theta1 < thetaOfTotalInternalReflection;

                    // Reflected
                    // Assuming perpendicular beam polarization, compute percent power
                    var reflectedPowerRatio;
                    if (hasTransmittedRay)
                        reflectedPowerRatio = IntroSimulation.getReflectedPower(n1, n2, Math.cos(theta1), Math.cos(theta2));
                    else
                        reflectedPowerRatio = 1.0;
                    
                    var reflectedWaveWidth = sourceWaveWidth;
                    this.addAndAbsorb(LightRay.create(
                        null, 
                        this._vec.set(1, 0).rotate(Math.PI - this.laser.getAngle()),
                        n1, 
                        wavelengthInTopMedium, 
                        reflectedPowerRatio * sourcePower, 
                        wavelength, 
                        reflectedWaveWidth, 
                        incidentRay.getNumberOfWavelengths(), 
                        bottom, 
                        true, 
                        false 
                    ));

                    // Fire a transmitted ray if there wasn't total internal reflection
                    if (hasTransmittedRay) {
                        // Transmitted
                        // n2/n1 = L1/L2 => L2 = L1*n2/n1
                        var transmittedWavelength = incidentRay.getWavelength() / n2 * n1;

                        if (!isNaN(theta2) && Number.isFinite(theta2)) {
                            var transmittedPowerRatio = IntroSimulation.getTransmittedPower(n1, n2, Math.cos(theta1), Math.cos(theta2));

                            // Make the beam width depend on the input beam width, so that
                            //   the same beam width is transmitted as was intercepted
                            var beamHalfWidth = a / 2;
                            var extentInterceptedHalfWidth = beamHalfWidth / Math.sin(Math.PI / 2 - theta1) / 2;
                            var transmittedBeamHalfWidth = Math.cos(theta2) * extentInterceptedHalfWidth;
                            var transmittedWaveWidth = transmittedBeamHalfWidth * 2;

                            var transmittedRay = LightRay.create(
                                null,
                                this._vec.set(1, 0).rotate(theta2 - Math.PI / 2), 
                                n2, 
                                transmittedWavelength,
                                transmittedPowerRatio * sourcePower, 
                                wavelength, 
                                transmittedWaveWidth, 
                                incidentRay.getNumberOfWavelengths(), 
                                top, 
                                true, 
                                true
                            );
                            this.addAndAbsorb(transmittedRay);
                        }
                    }
                }
                incidentRay.moveToFront();//For wave view
            }
        },

        /**
         * Get the top medium index of refraction
         */
        getN1: function() {
            return this.topMedium.getIndexOfRefraction(this.laser.getWavelength());
        },

        /**
         * Get the bottom medium index of refraction
         */
        getN2: function() {
            return this.bottomMedium.getIndexOfRefraction(this.laser.getWavelength());
        },

        /**r
         * Checks whether the intensity meter should absorb the ray, and if so adds a truncated ray.
         *   If the intensity meter misses the ray, the original ray is added.
         */
        addAndAbsorb: function(ray) {
            var sx = this.intensityMeter.get('sensorPosition').x;
            var sy = this.intensityMeter.get('sensorPosition').y;
            var sr = this.intensityMeter.get('sensorRadius');
            var intersects = ray.intersectsCircle(sx, sy, sr);
            var rayAbsorbed = intersects && this.intensityMeter.get('enabled');
            if (rayAbsorbed) {
                
                // Find intersection points with the intensity sensor
                var line = ray.toLine();
                var intersections = LineIntersection.lineCircleIntersection(line.start.x, line.start.y, line.end.x, line.end.y, sx, sy, sr);
                // If it intersected, then absorb the ray
                if (intersections && intersections[0] && intersections[1]) {
                    var x = intersections[0].x + intersections[1].x;
                    var y = intersections[0].y + intersections[1].y;
                    var interruptedRay = LightRay.create(
                        ray.tail,
                        this._vec.set(x / 2, y / 2), 
                        ray.indexOfRefraction, 
                        ray.getWavelength(),
                        ray.getPowerFraction(), 
                        this.laser.get('wavelength'), 
                        ray.getWaveWidth(), 
                        ray.getNumWavelengthsPhaseOffset(), 
                        ray.getOppositeMedium(), 
                        false, 
                        ray.extendBackwards
                    );

                    // Don't let the wave intersect the intensity meter if it is behind the
                    //   laser emission point
                    var isForward = ray.getVector().dot(interruptedRay.getVector()) > 0;
                    if (interruptedRay.getLength() < ray.getLength() && isForward) {
                        this.addRay(interruptedRay);
                    }
                    else {
                        this.addRay(ray);
                        rayAbsorbed = false;
                    }
                }
            }
            else {
                this.addRay(ray);
            }

            if (rayAbsorbed)
                this.intensityMeter.addRayReading(ray.getPowerFraction());
            else
                this.intensityMeter.addRayReading(null);

            return rayAbsorbed;
        },

        /**
         * Determine the velocity of the topmost light ray at the specified position,
         *   if one exists, otherwise None
         */
        getVelocity: function(position) {
            var ray = this.getRayAt(position);
            if (ray)
                return ray.getVelocityVector();

            return null;
        },

        /**
         * Determine the wave value of the topmost light ray at the specified position,
         *   or None if none exists
         */
        getWaveValue: function(position) {
            var ray = this.getRayAt(position);
            if (ray) {
                // Map power to displayed amplitude
                var amplitude = Math.sqrt(ray.getPowerFraction());

                // Find out how far the light has come, so we can compute the remainder of phases
                var distVec = this._distVec.set(position).sub(ray.tail);
                var distanceAlongRay = ray.getUnitVector().dot(distVec);
                var phase = ray.getCosArg(distanceAlongRay);

                // Wave is a*cos(theta)
                return amplitude * Math.cos(phase + Math.PI);
            }

            return null;
        },

        /**
         * Responds to changes in mediums by telling the simulation to update
         */
        mediumChanged: function() {
            this.updateOnNextFrame();
        }

    });

    return IntroSimulation;
});
