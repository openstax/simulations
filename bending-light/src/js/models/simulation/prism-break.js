define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Rectangle        = require('common/math/rectangle');
    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');
    var clamp            = require('common/math/clamp');

    var BendingLightSimulation = require('models/simulation');
    var Medium                 = require('models/medium');
    var LightRay               = require('models/light-ray');
    var Ray                    = require('models/ray');
    var Prism                  = require('models/prism');
    var Polygon                = require('models/shape/polygon');
    var Circle                 = require('models/shape/circle');
    var ShapeIntersection      = require('models/shape/shape-intersection');
    var ShapeDifference        = require('models/shape/shape-difference');

    /**
     * Constants
     */
    var Constants = require('constants');
    var MediumPropertiesPresets = require('medium-properties-presets');
    var WAVELENGTH_RED = Constants.WAVELENGTH_RED;

    /**
     * Wraps the update function in 
     */
    var PrismBreakSimulation = BendingLightSimulation.extend({

        defaults: _.extend(BendingLightSimulation.prototype.defaults, {
            manyRays: false,       // Show multiple beams to help show how lenses work
            showReflections: false // If false, will hide non TIR reflections
        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                laserDistanceFromPivot: Constants.DEFAULT_LASER_DISTANCE_FROM_PIVOT * 0.9, 
                laserAngle: Math.PI, 
                topLeftQuadrant: false
            }, options);

            this.initPrismPrototypes();

            BendingLightSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:manyRays',        this.updateOnNextFrame);
            this.on('change:showReflections', this.updateOnNextFrame);
        },

        initPrismPrototypes: function() {
            var prismPrototypes = [];

            var a = Constants.CHARACTERISTIC_LENGTH * 10; // characteristic length scale
            var b = a / 4; // characteristic length scale
            var h = a * Math.sqrt(3) / 2;

            // Square
            var square = new Prism({}, {
                referencePointIndex: 3, // Attach at bottom right
                points: [
                    new Vector2(),
                    new Vector2(0, a),
                    new Vector2(a, a),
                    new Vector2(a, 0)
                ]
            });
            square.shape.centerOnCentroid();
            prismPrototypes.push(square);

            // Triangle
            var triangle = new Prism({}, {
                referencePointIndex: 1, // Attach at bottom right
                points: [
                    new Vector2(0,     0),
                    new Vector2(a,     0),
                    new Vector2(a / 2, h)
                ]
            });
            triangle.shape.centerOnCentroid();
            prismPrototypes.push(triangle);

            // Trapezoid
            var trapezoid = new Prism({}, {
                referencePointIndex: 1, // Attach at bottom right
                points: [
                    new Vector2(),
                    new Vector2(a, 0),
                    new Vector2(a / 2 + b, h),
                    new Vector2(a / 2 - b, h)
                ]
            });
            trapezoid.shape.centerOnCentroid();
            prismPrototypes.push(trapezoid);

            var radius = a / 2;

            // Continuous Circle
            prismPrototypes.push(new Prism({}, {
                shape: new Circle(radius)
            }));

            // Continuous Semicircle
            var semicircle = new Prism({}, {
                shape: new ShapeIntersection(
                    new Circle(radius), 
                    new Polygon([
                        new Vector2(0,        radius),
                        new Vector2(0,       -radius),
                        new Vector2(-radius, -radius),
                        new Vector2(-radius,  radius)
                    ], 1 /* Attach at bottom right */)
                )
            });
            // The only problem with calculating these centroids from the polygons
            //   is that, because the circle approximations have a lot of points,
            //   the circles end up biasing the centroid calculation towards the
            //   circle edges.
            semicircle.shape.centerOnCentroid();
            prismPrototypes.push(semicircle);

            // Continuous Diverging Lens
            var divergingLens = new Prism({}, {
                shape: new ShapeDifference(
                    new Polygon([
                        new Vector2(0,                    -radius),
                        new Vector2(radius * (0.6 / 0.5), -radius),
                        new Vector2(radius * (0.6 / 0.5),  radius),
                        new Vector2(0,                     radius)
                    ], 1 /* Attach at bottom right */),
                    new Circle(radius)
                )
            });
            divergingLens.shape.centerOnCentroid();
            prismPrototypes.push(divergingLens);

            this.prismPrototypes = prismPrototypes;
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BendingLightSimulation.prototype.initComponents.apply(this, arguments);

            this.intersections = [];
            this.prisms = new Backbone.Collection();

            this.environment = new Medium({
                shape: new Rectangle(-1, 0, 2, 1), // In Meters, very large compared to visible model region in the stage
                mediumProperties: MediumPropertiesPresets.AIR
            });

            this.prismMedium = new Medium({
                shape: new Rectangle(-1, -1, 2, 1), // In Meters, very large compared to visible model region in the stage
                mediumProperties: MediumPropertiesPresets.GLASS
            });

            this._from       = new Vector2();
            this._offset     = new Vector2();
            this._point      = new Vector2();
            this._dirUnit    = new Vector2();
            this._direction  = new Vector2();
            this._scratchVec = new Vector2();
            this._scratchL   = new Vector2();
            this._scratchN   = new Vector2();
            this._scratchP   = new Vector2();
            this._scratchU   = new Vector2();
            this._vReflect   = new Vector2();
            this._vRefract   = new Vector2();

            this._intersectionCompare = this._intersectionCompare.bind(this);

            this.listenTo(this.environment, 'change',           this.mediumChanged);
            this.listenTo(this.prisms,      'change',           this.prismChanged);
            this.listenTo(this.prisms,      'add remove reset', this.prismChanged);
        },

        resetComponents: function() {
            BendingLightSimulation.prototype.resetComponents.apply(this, arguments);

            this.prisms.reset();

            this.environment.set({
                mediumProperties: MediumPropertiesPresets.AIR
            });

            this.prismMedium.set({
                mediumProperties: MediumPropertiesPresets.GLASS
            });
        },

        createPrismFromPrototype: function(prototypeIndex) {
            return this.prismPrototypes[prototypeIndex].clone();
        },

        addPrism: function(prism) {
            this.prisms.add(prism);
        },

        removePrism: function() {
            this.prisms.remove(prism);
        },

        /**
         * Clear the model in preparation for another ray propagation update phase
         */
        clear: function() {
            BendingLightSimulation.prototype.clear.apply(this, arguments);

            for (var i = this.intersections.length - 1; i >= 0; i--) {
                this.intersections[i].destroy();
                this.intersections.splice(i, 1);
            }
        },

        /**
         * Algorithm that computes the trajectories of the rays throughout the system
         */
        propagateRays: function() {
            if (this.laser.get('on')) {console.log('-----------------')
                var tail = this.laser.get('emissionPoint');
                var laserInPrism = this.isLaserInPrism();
                var directionUnitVector = this._dirUnit.set(this.laser.getDirectionUnitVector());
                if (!this.get('manyRays')) {
                    // Just one main, central ray
                    this.propagateFrom(tail, directionUnitVector, 1.0, laserInPrism);
                }
                else {
                    // Many parallel rays
                    var offset = this._offset;
                    for (var x = -WAVELENGTH_RED; x <= WAVELENGTH_RED * 1.1; x += WAVELENGTH_RED / 2) {
                        var offset = this._offset
                            .set(directionUnitVector)
                            .rotate(Math.PI / 2)
                            .scale(x);

                        this.propagateFrom(offset.add(tail), directionUnitVector, 1.0, laserInPrism);
                    }
                }
            }
        },

        /**
         * Starts the ray propagation from a new starting location
         */
        propagateFrom: function(tail, directionUnitVector, power, laserInPrism) {
            if (this.laser.getWavelength() === Constants.WHITE_LIGHT) {
                var min = Constants.MIN_WAVELENGTH / Constants.METERS_TO_NANOMETERS;
                var max = Constants.MAX_WAVELENGTH / Constants.METERS_TO_NANOMETERS;
                // This number sets the number of (equally spaced wavelength) rays to
                //   show in a white beam.  More rays looks better but is more 
                //   computationally intensive.
                var dw = (max - min) / 16;
                for (var wavelength = min; wavelength <= max; wavelength += dw) {
                    var mediumIndexOfRefraction = laserInPrism ? 
                        this.prismMedium.getIndexOfRefraction(wavelength) : 
                        this.environment.getIndexOfRefraction(wavelength);

                    var ray = Ray.create(
                        tail, 
                        directionUnitVector, 
                        power, 
                        wavelength, 
                        mediumIndexOfRefraction, 
                        Constants.SPEED_OF_LIGHT / wavelength
                    );

                    this.propagateRay(ray, 0);

                    ray.destroy();
                }
            }
            else {
                var mediumIndexOfRefraction = laserInPrism ? 
                    this.prismMedium.getIndexOfRefraction(this.laser.getWavelength()) : 
                    this.environment.getIndexOfRefraction(this.laser.getWavelength());

                var ray = Ray.create(
                    tail, 
                    directionUnitVector, 
                    power, 
                    this.laser.getWavelength(), 
                    mediumIndexOfRefraction, 
                    this.laser.getFrequency()
                );

                this.propagateRay(ray, 0);

                ray.destroy();
            }
        },

        /**
         * Recursive algorithm to compute the pattern of rays in the system.  This is
         *   the main computation of this model, rays are cleared beforehand and this
         *   algorithm adds them as it goes
         */
        propagateRay: function(incidentRay, count) {
            var waveWidth = Constants.CHARACTERISTIC_LENGTH * 5;

            // Termination condition of we have reached too many iterations or if the
            //   ray is very weak
            if (count > 50 || incidentRay.power < 0.001)
                return;

            // Check for an intersection
            var intersection = this.getIntersection(incidentRay, this.prisms);
            var L = incidentRay.directionUnitVector;
            var n1 = incidentRay.mediumIndexOfRefraction;
            var wavelengthInN1 = incidentRay.wavelength / n1;
            if (intersection) {
                // There was an intersection, so reflect and refract the light

                // Add the incident ray itself
                console.log(incidentRay.tail, ' --> ', intersection.getPoint())
                this.addRay(LightRay.create(
                    incidentRay.tail, 
                    intersection.getPoint(), 
                    n1, 
                    wavelengthInN1, 
                    incidentRay.power, 
                    incidentRay.wavelength, 
                    waveWidth, 
                    0, 
                    null, 
                    true, 
                    false
                ));

                // List the intersection in the model
                this.addIntersection(intersection);

                var pointOnOtherSide = this._point
                    .set(intersection.getPoint())
                    .add(this._direction
                        .set(incidentRay.directionUnitVector)
                        .scale(1E-12)
                    );

                var outputInsidePrism = false;
                for (var i = 0; i < this.prisms.length; i++) {
                    if (this.prisms.at(i).contains(pointOnOtherSide)) {
                        outputInsidePrism = true;
                        break;
                    }
                }

                // Index of refraction of the other medium
                var n2 = outputInsidePrism ? 
                    this.prismMedium.getIndexOfRefraction(incidentRay.getBaseWavelength()) : 
                    this.environment.getIndexOfRefraction(incidentRay.getBaseWavelength());

                // Precompute for readability
                var point = intersection.getPoint();
                var n = intersection.getUnitNormal();
                var scratchL = this._scratchL;
                var scratchN = this._scratchN;
                var scratchP = this._scratchP;
                var scratchU = this._scratchU;

                // Clean up; we don't need this anymore
                intersection.destroy();

                // Compute the output rays; see http://en.wikipedia.org/wiki/Snell's_law#Vector_form
                var cosTheta1 = n.dot(scratchL.set(L).scale(-1));
                var cosTheta2Radicand = 1 - Math.pow(n1 / n2, 2) * (1 - Math.pow(cosTheta1, 2));
                var cosTheta2 = Math.sqrt(cosTheta2Radicand);
                var shouldTotalInternalReflection = cosTheta2Radicand < 0;

                var vReflect = this._vReflect.set(L).add(scratchN.set(n).scale(2 * cosTheta1));
                var vRefract = cosTheta1 > 0 ?
                    this._vRefract.set(L).scale(n1 / n2).add(scratchN.set(n).scale(n1 / n2 * cosTheta1 - cosTheta2)) :
                    this._vRefract.set(L).scale(n1 / n2).add(scratchN.set(n).scale(n1 / n2 * cosTheta1 + cosTheta2));

                var reflectedPower   = shouldTotalInternalReflection ? 1 : clamp(0, this.getReflectedPower(  n1, n2, cosTheta1, cosTheta2), 1);
                var transmittedPower = shouldTotalInternalReflection ? 0 : clamp(0, this.getTransmittedPower(n1, n2, cosTheta1, cosTheta2), 1);

                // Create the new rays and propagate them recursively
                var reflected = Ray.create(scratchP.set(point).add(scratchU.set(incidentRay.directionUnitVector).scale(-1E-12)), vReflect, incidentRay.power * reflectedPower,   incidentRay.wavelength, incidentRay.mediumIndexOfRefraction, incidentRay.frequency);
                var refracted = Ray.create(scratchP.set(point).add(scratchU.set(incidentRay.directionUnitVector).scale(+1E-12)), vRefract, incidentRay.power * transmittedPower, incidentRay.wavelength, n2,                                  incidentRay.frequency);
                
                if (this.get('showReflections') || shouldTotalInternalReflection)
                    this.propagateRay(reflected, count + 1);
                
                this.propagateRay(refracted, count + 1);

                // Clean up; we don't need this anymore
                reflected.destroy();
                refracted.destroy();
            }
            else {console.log(incidentRay.tail, ' =-> ', this._scratchVec.set(incidentRay.tail).add(incidentRay.directionUnitVector))
                // No intersection, so the light ray should just keep going
                this.addRay(LightRay.create(
                    incidentRay.tail, 
                    this._scratchVec.set(incidentRay.tail).add(incidentRay.directionUnitVector), // 1 meter long ray (long enough to seem like infinity for the sim which is at nm scale)
                    n1, 
                    wavelengthInN1, 
                    incidentRay.power, 
                    incidentRay.wavelength, 
                    waveWidth, 
                    0, 
                    null, 
                    true, 
                    false
                ));
            }
        },

        /**
         * Find the nearest intersection between a light ray and the set of prisms
         *   in the play area and return it or return null.
         */
        getIntersection: function(incidentRay, prisms) {
            // Get all the intersections
            var allIntersections = [];
            for (var i = 0; i < this.prisms.length; i++){
                var intersections = this.prisms.at(i).getIntersections(incidentRay);
                for (var j = 0; j < intersections.length; j++)
                    allIntersections.push(intersections[j]);
            }

            if (allIntersections.length) {
                // Get the closest one (which would be hit first)
                this._incidentRay = incidentRay;
                allIntersections.sort(this._intersectionCompare);

                var keeper = allIntersections[0];
                this.destroyIntersections(allIntersections, keeper);

                return keeper;
            }
            else {
                return null;
            }
        },

        _intersectionCompare: function(i1, i2) {
            return i1.getPoint().distance(this._incidentRay.tail) - i2.getPoint().distance(this._incidentRay.tail);
        },

        destroyIntersections: function(intersections, except) {
            for (var i = 0; i < intersections.length; i++) {
                if (intersections[i] !== except)
                    intersections[i].destroy();
            }
        },

        /**
         * Signify that another ray/interface collision occurred
         */
        addIntersection: function(intersection) {
            this.intersections.push(intersection);
        },

        isLaserInPrism: function() {
            for (var i = 0; i < this.prisms.length; i++) {
                if (this.prisms.at(i).contains(this.laser.get('emissionPoint')))
                    return true;
            }
            return false;
        },

        /**
         * Responds to changes in mediums by telling the simulation to update
         */
        mediumChanged: function() {
            this.updateOnNextFrame();
        },

        prismChanged: function() {
            this.updateOnNextFrame();
        }

    });

    return PrismBreakSimulation;
});
