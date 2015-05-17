define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var Photon         = require('models/photon');
    var Molecule       = require('models/molecule');

    /**
     * Constants
     */
    var Constants = require('constants');
    var PhotonTargets = Constants.PhotonTargets;

    var PHOTON_EMISSION_LOCATION = PhotonAbsorptionSimulation.PHOTON_EMISSION_LOCATION;
    var PHOTON_EMISSION_ANGLE_RANGE = PhotonAbsorptionSimulation.PHOTON_EMISSION_ANGLE_RANGE;
    var SINGLE_MOLECULE_LOCATION = PhotonAbsorptionSimulation.SINGLE_MOLECULE_LOCATION;
    var PHOTON_VELOCITY  = PhotonAbsorptionSimulation.PHOTON_VELOCITY;
    var MAX_PHOTON_DISTANCE = PhotonAbsorptionSimulation.MAX_PHOTON_DISTANCE;
    var CONTAINMENT_AREA_WIDTH = PhotonAbsorptionSimulation.CONTAINMENT_AREA_WIDTH;
    var CONTAINMENT_AREA_HEIGHT = PhotonAbsorptionSimulation.CONTAINMENT_AREA_HEIGHT;
    var CONTAINMENT_AREA_CENTER = PhotonAbsorptionSimulation.CONTAINMENT_AREA_CENTER;
    var CONTAINMENT_AREA_RECT = PhotonAbsorptionSimulation.CONTAINMENT_AREA_RECT;

    /**
     * The base simulation model for the "Photon Absorption" tab
     *
     * Original description from PhET:
     *
     *   Primary model for the Photon Absorption tab.  This models photons being
     *   absorbed (or often NOT absorbed) by various molecules.  The scale for this
     *   model is picometers (10E-12 meters).
     *   
     *   The basic idea for this model is that there is some sort of photon emitter
     *   that emits photons, and some sort of photon target that could potentially
     *   some of the emitted photons and react in some way.  In many cases, the
     *   photon target can re-emit one or more photons after absorption.
     *  
     *                                               - John Blanco
     */
    var PhotonAbsorptionSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            
        }),
        
        /**
         * 
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.photonWavelength = Constants.VISIBLE_WAVELENGTH;
            this.initialPhotonTarget = null;

            // The photon target is the thing that the photons are shot at, and based
            // on its particular nature, it may or may not absorb some of the photons.
            this.photonTarget = DEFAULT_PHOTON_TARGET;

            // Variables that control periodic photon emission.
            this.photonEmissionCountdownTimer = Double.POSITIVE_INFINITY;
            this.photonEmissionPeriodTarget = DEFAULT_PHOTON_EMISSION_PERIOD;
            this.previousEmissionAngle = 0;

            // Collection that contains the molecules that comprise the configurable
            //   atmosphere
            this.configurableAtmosphereMolecules = [];
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initPhotons();
            this.initMolecules();
        },

        /**
         * Initializes the photon collection
         */
        initPhotons: function() {
            this.photons = new Backbone.Collection([], { model: Photon });
        },

        /**
         * Initializes the photon collection
         */
        initMolecules: function() {
            this.molecules = new Backbone.Collection([], { model: Molecule });
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            
        },

        /**
         * Updates models
         */
        _update: function(time, deltaTime) {
            // Check if it is time to emit any photons
            if (this.photonEmissionCountdownTimer != Double.POSITIVE_INFINITY) {
                this.photonEmissionCountdownTimer -= deltaTime;
                if (this.photonEmissionCountdownTimer <= 0) {
                    // Time to emit
                    this.emitPhoton();
                    this.photonEmissionCountdownTimer = this.photonEmissionPeriodTarget;
                }
            }

            // Update the photons, removing any that have moved beyond
            //   the model bounds.
            var photon;
            for (var i = this.photons.length - 1; i >= 0; i--) {
                photon = this.photons.at(i);
                photon.update(deltaTime);
                if (photon.get('position').x - PHOTON_EMISSION_LOCATION.x <= MAX_PHOTON_DISTANCE) {
                    // See if any of the molecules wish to absorb this photon.
                    for (var j = 0; j < this.molecules.length; j++) {
                        if (this.molecules.at(j).queryAbsorbPhoton(photon))
                            this.photons.remove(photon);
                    }
                }
                else {
                    // The photon has moved beyond our simulation bounds,
                    //   so remove it from the model.
                    this.photons.remove(photon);
                }
            }

            // Update the molecules
            for (var m = 0; m < this.molecules.length; m++)
                this.molecules.at(m).update(deltaTime);
        },

        /**
         * Cause a photon to be emitted from the emission point. Emitted
         *   photons will travel toward the photon target, which will
         *   decide whether a given photon should be absorbed.
         */
        emitPhoton: function() {
            var Photon = new Photon({
                wavelength: this.photonWavelength,
                position: PHOTON_EMISSION_LOCATION
            });

            var emissionAngle = 0; // Straight to the right
            if (this.photonTarget == PhotonTargets.CONFIGURABLE_ATMOSPHERE) {
                // Photons can be emitted at an angle. In order to get a more
                //   even spread, we alternate emitting with an up or down angle.
                emissionAngle = Math.random() * PHOTON_EMISSION_ANGLE_RANGE / 2;
                if (this.previousEmissionAngle > 0)
                    emissionAngle = -emissionAngle;
                this.previousEmissionAngle = emissionAngle;
            }
            photon.setVelocity(
                PHOTON_VELOCITY * Math.cos(emissionAngle),
                PHOTON_VELOCITY * Math.sin(emissionAngle)
            );
            this.photons.add(photon);
        },

        /**
         * Sets the wavelength for the next emitted photon.
         */
        setEmittedPhotonWavelength: function(frequency) {
            if (this.photonWavelength != frequency) {
                // Set the new value and send out notification of
                //   change to listeners.
                this.photonWavelength = frequency;
            }
        },

        /**
         * Set the level of the specified gas in the configurable atmosphere.
         */
        setAtmosphericGasLevel: function(moleculeClass, targetQuantity) {
            var i;

            // Count the number of the specified type that currently exists.
            var numMoleculesOfSpecifiedType = 0;
            for (i = 0; i < this.configurableAtmosphereMolecules.length; i++) {
                if (this.configurableAtmosphereMolecules[i] instanceof moleculeClass)
                    numMoleculesOfSpecifiedType++;
            }

            // Calculate the difference.
            var numMoleculesToAdd = targetQuantity - numMoleculesOfSpecifiedType;

            // Make the changes
            if (numMoleculesToAdd > 0) {
                // Add the necessary number of the specified molecule
                for (i = 0; i < numMoleculesToAdd; i++) {
                    var molecule = new moleculeClass();
                    molecule.setPosition(this.findEmptyMoleculePosition(molecule));
                    // TODO: listen to molecule photon emissions molecule. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    this.configurableAtmosphereMolecules.push(moleclue);
                }
            }
            else if (numMoleculesToAdd < 0) {
                // Remove the necessary number of the specified molecule.
                var removedCount = 0;
                for (i = this.configurableAtmosphereMolecules.length - 1; i >= 0; i--) {
                    if (this.configurableAtmosphereMolecules[i] instanceof moleculeClass) {
                        this.configurableAtmosphereMolecules.splice(i, 1);
                        removedCount++;
                        if (removedCount >= Math.abs(numMoleculesToAdd))
                            break;
                    }
                }
            }
            else if (targetQuantity !== 0) {
                console.error('Warning: Ignoring call to set molecule levels to current level.');
            }

            // If the configurable atmosphere is the currently selected
            //   target, then these changes must be synchronized with
            //   the active molecules.
            if (this.photonTarget === PhotonTargets.CONFIGURABLE_ATMOSPHERE)
                this.syncConfigAtmosphereToActiveMolecules();
        },

        /**
         * Find a location in the atmosphere that has a minimal amount of overlap
         *   with other molecules.  This is assumed to be used only when multiple
         *   molecules are being shown.  Not that I've deemed it okay to create
         *   objects willy-nilly here because it's not being run in the update
         *   loop (only when the user wants to add a molecule).
         *
         * IMPORTANT: This assumes that the molecule in question is not already
         *   on the list of molecules, and may return weird results if it is.
         */
        findEmptyMoleculePosition: function(molecule) {
            // Generate a set of random locations
            var possibleLocations = [];

            var minDistWallToMolCenterX = MIN_DIST_FROM_WALL_X + molecule.getBoundingRect().w / 2;
            var minXPos                 = CONTAINMENT_AREA_RECT.left() + minDistWallToMolCenterX;
            var xRange                  = CONTAINMENT_AREA_RECT.w - 2 * minDistWallToMolCenterX;
            var minDistWallToMolCenterY = MIN_DIST_FROM_WALL_Y + molecule.getBoundingRect().h / 2;
            var minYPos                 = CONTAINMENT_AREA_RECT.bottom() + minDistWallToMolCenterY;
            var yRange                  = CONTAINMENT_AREA_RECT.h - 2 * minDistWallToMolCenterY;
            var center                  = CONTAINMENT_AREA_RECT.center();

            for (var i = 0; i < 20; i++) {
                // Randomly generate a position
                var proposedYPos = minYPos + Math.random() * yRange;
                var proposedXPos;
                if (Math.abs(proposedYPos - center.y) < EMITTER_AVOIDANCE_COMP_Y / 2) {
                    // Compensate in the X direction so that this position is not
                    //   too close to the photon emitter.
                    proposedXPos = minXPos + EMITTER_AVOIDANCE_COMP_X + Math.random() * (xRange - EMITTER_AVOIDANCE_COMP_X);
                }
                else {
                    proposedXPos = minXPos + Math.random() * xRange;
                }
                possibleLocations.push(new Vector2(proposedXPos, proposedYPos));
            }

            var width  = molecule.getBoundingRect().w;
            var height = molecule.getBoundingRect().h;

            // Figure out which point would position the molecule such that it had
            //   the least overlap with other molecules.
            possibleLocations.sort(function(p1, p2) {
                return this.getOverlapWithOtherMolecules(p1, width, height) - this.getOverlapWithOtherMolecules(p2, width, height);
            });

            var point = possibleLocations[0];
            if (point.x + width / 2 > CONTAINMENT_AREA_RECT.right())
                console.log('Whoa!', point);

            return point;
        },

        /**
         * Returns the amount of overlap of the given area with other molecules.
         */
        getOverlapWithOtherMolecules: function(point, width, height) {
            var overlap = 0;
            var testRect = this.createRectangleFromPoint(point, width, height);
            var intersection;
            var molecule;
            for (var i = 0; i < this.configurableAtmosphereMolecules.length; i++) {
                molecule = this.configurableAtmosphereMolecules[i];
                // Add in the overlap for each molecule. There may well
                //   be no overlap.
                intersection = molecule.getBoundingRect().intersection(testRect);
                overlap += Math.max(intersection.w, 0) * Math.max(intersection.h, 0);
            }
            if (overlap === 0) {
                // This point has no overlap.  Add some "bonus points" for
                //   the amount of distance from all other points. The reason
                //   that this is negative is that 0 is the least overlap that
                //   can occur, so it is even better if it is a long way from
                //   any other molecules.
                overlap = -this.getMinDistanceToOtherMolecules(point);
            }
            return overlap;
        },

        /**
         * Convenience method for creating a rectangle from a center point.
         */
        createRectangleFromPoint: function(point, width, height) {
            return new Rectangle(
                point.x - width / 2,
                point.y - height / 2,
                width,
                height
            );
        },

        /**
         * Returns the minimum distance from a point to other molecules.
         */
        getMinDistanceToOtherMolecules: function(point) {
            var minDistance = Number.POSITIVE_INFINITY;
            var molecule;
            for (var i = 0; i < this.configurableAtmosphereMolecules.length; i++) {
                molecule = this.configurableAtmosphereMolecules[i];
                if (molecule.get('position').distance(point) < minDistance)
                    minDistance = molecule.get('position').distance(point);
            }
            return minDistance;
        }

    }, Constants.PhotonAbsorptionSimulation);

    return PhotonAbsorptionSimulation;
});
