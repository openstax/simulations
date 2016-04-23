define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var AppView           = require('common/v3/app/app');
    var VanillaCollection = require('common/collections/vanilla');
    var Vector2           = require('common/math/vector2');

    var NuclearPhysicsSimulation = require('models/simulation');
    var Uranium235Nucleus        = require('models/nucleus/uranium-235');
    var Uranium238Nucleus        = require('models/nucleus/uranium-238');
    var Nucleon                  = require('models/nucleon');
    var AlphaParticle            = require('models/alpha-particle');
    var AtomicNucleus            = require('models/atomic-nucleus');

    var ContainmentVessel = require('nuclear-fission/models/containment-vessel');
    var NeutronSource     = require('nuclear-fission/models/neutron-source');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base simulation model for multi-nucleus decay simulations
     */
    var ChainReactionSimulation = NuclearPhysicsSimulation.extend({

        defaults: _.extend({}, NuclearPhysicsSimulation.prototype.defaults, {
            numU235Nuclei: 1,
            numU238Nuclei: 0
        }),
        
        initialize: function(attributes, options) {
            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);

            // Cached objects
            this._point = new Vector2();

            // Bind these functions so we can pass them as function parameters
            _.bindAll(this, 'createU235Nucleus', 'createU238Nucleus');

            // Bind listeners
            this.on('change:numU235Nuclei', this.numU235NucleiChanged);
            this.on('change:numU238Nuclei', this.numU238NucleiChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // Add the neutron source to the side of the model.
            this.neutronSource = new NeutronSource({
                position: new Vector2(-30, 0)
            });

            this.containmentVessel = new ContainmentVessel({
                radius: ChainReactionSimulation.INITIAL_CONTAINMENT_VESSEL_RADIUS
            });

            this.u235Nuclei        = new VanillaCollection();
            this.u238Nuclei        = new VanillaCollection();
            this.u239Nuclei        = new VanillaCollection();
            this.daughterNuclei    = new VanillaCollection();
            this.freeNeutrons      = new VanillaCollection();
            this.containedElements = new VanillaCollection();

            // Daughter nuclei that have been removed from the model in order to save
            this.ghostDaughterNuclei = 0;

            // Bind listeners
            this.listenTo(this.neutronSource, 'neutron-generated', this.neutronGenerated);

            this.listenTo(this.containmentVessel, 'explode',        this.containmentVesselExploded);
            this.listenTo(this.containmentVessel, 'change:enabled', this.containmentVesselEnabledChanged);
            this.listenTo(this.containmentVessel, 'change:radius',  this.containmentVesselRadiusChanged);
        },

        /**
         * Resets the model components
         */
        reset: function() {
            
        },

        destroyFreeNucleons: function() {
            for (var i = this.freeNucleons.length - 1; i >= 0; i--)
                this.freeNucleons.at(i).destroy();
        },

        /**
         * Remove all nuclei and free neutrons from the model.
         */
        removeAllParticles: function() {
            var i;

            for (i = this.u235Nuclei.length - 1; i >= 0; i--)
                this.u235Nuclei[i].destroy();

            for (i = this.u238Nuclei.length - 1; i >= 0; i--)
                this.u238Nuclei[i].destroy();

            for (i = this.u239Nuclei.length - 1; i >= 0; i--)
                this.u239Nuclei[i].destroy();

            for (i = this.daughterNuclei.length - 1; i >= 0; i--)
                this.daughterNuclei[i].destroy();

            for (i = this.freeNeutrons.length - 1; i >= 0; i--)
                this.freeNeutrons[i].destroy();

            for (i = this.containedElements.length - 1; i >= 0; i--)
                this.containedElements[i].destroy();

            // Zero out the counter that keeps track of daughter nuclei that have
            //   been removed because they moved out of range of the model.
            this.ghostDaughterNuclei = 0;
        },

        /**
         * Remove any model elements that have moved outside the range of the
         *   simulation and have thus become irrelevant.
         */
        removeOutOfRangeElements: function() {
            var i;
            var numElements;

            // NOTE: There is an important assumption built into the code below.
            //   The assumption is that only neutrons and daughter nuclei move.
            //   It would be safer to test all collections of nuclei, but it would
            //   be far less efficient, which is why this is done.  If the other
            //   portions of this class are ever changed such that this assumption
            //   becomes invalid, this code must be changed.

            numElements = this.freeNeutrons.length;
            for (i = numElements - 1; i >= 0; i--) {
                var neutron = this.freeNeutrons.at(i);

                if (Math.abs(neutron.getX()) > (ChainReactionSimulation.MAX_NUCLEUS_RANGE_X / 2) ||
                    Math.abs(neutron.getY()) > (ChainReactionSimulation.MAX_NUCLEUS_RANGE_Y / 2)
                ) {
                    // Get rid of this element.
                    this.freeNeutrons.at(i).destroy();
                }
            }

            numElements = this.daughterNuclei.length;
            for (i = numElements - 1; i >= 0; i--) {
                var nucleus = this.daughterNuclei.at(i);
                if (Math.abs(nucleus.getX()) > (ChainReactionSimulation.MAX_NUCLEUS_RANGE_X / 2) ||
                    Math.abs(nucleus.getY()) > (ChainReactionSimulation.MAX_NUCLEUS_RANGE_Y / 2)
                ) {
                    // Get rid of this element.
                    this.daughterNuclei.at(i).destroy();
                    this.ghostDaughterNuclei++;
                }
            }
        },

        /**
         * Remove all the U235 nuclei that have decayed, which includes their
         *   daughter nuclei.
         */
        removeDecayedU235Nuclei: function() {
            if (this.daughterNuclei.length > 0) {
                for (var i = this.daughterNuclei.length - 1; i >= 0; i--)
                    this.daughterNuclei[i].destroy();
            }

            if (this.ghostDaughterNuclei > 0)
                this.ghostDaughterNuclei = 0;
        },

        createU235Nucleus: function(position) {
            return Uranium235Nucleus.create({
                simulation: this,
                position: position, 
                fissionInterval: 0 
            });
        },

        createU238Nucleus: function(position) {
            return Uranium238Nucleus.create({
                simulation: this,
                position: position
            });
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            // Move any free particles that exist.
            var numFreeNeutrons = this.freeNeutrons.length;
            for (var i = numFreeNeutrons - 1; i >= 0; i--) {
                var freeNeutron = this.freeNeutrons.at(i);
                freeNeutron.update();

                // Check if any of the free particles have collided with a nucleus
                //   and, if so, give the nucleus the opportunity to absorb the
                //   neutron (and possibly fission as a result).
                var particleAbsorbed = false;
                var j;
                var numNuclei;

                numNuclei = this.u235Nuclei.length;
                for (j = 0; (j < numNuclei) && (particleAbsorbed === false); j++) {
                    var nucleus = this.u235Nuclei.at(j);
                    if (freeNeutron.get('position').distance(nucleus.get('position')) <= nucleus.get('diameter') / 2) {
                        // The particle is within capture range - see if the nucleus can capture it.
                        particleAbsorbed = nucleus.captureParticle(freeNeutron);
                    }
                }

                numNuclei = this.u238Nuclei.length;
                for (j = 0; (j < numNuclei) && (particleAbsorbed === false); j++) {
                    var nucleus = this.u238Nuclei.at(j);
                    if (freeNeutron.get('position').distance(nucleus.get('position')) <= nucleus.get('diameter') / 2) {
                        // The particle is within capture range - see if the nucleus can capture it.
                        particleAbsorbed = nucleus.captureParticle(freeNeutron);
                    }
                }

                if (particleAbsorbed) {
                    // The particle has become part of a larger nucleus, so we
                    //   need to take it off the list of free particles and let the
                    //   view know that it has disappeared as a separate entity.
                    this.freeNeutrons.remove(freeNeutron);
                }
                else if (
                    !this.containedElements.contains(freeNeutron) &&
                    this.containmentVessel.isPositionContained(freeNeutron.get('position'))
                ) {
                    // This particle is contained by the containment vessel, so we
                    //   remove it from the model, since it is no longer significant.
                    this.containmentVessel.recordImpact(ChainReactionSimulation.NEUTRON_COLLISION_IMPACT);
                    this.freeNeutrons.remove(freeNeutron);
                }
            }

            if (this.containmentVessel.get('enabled')) {
                // The containment vessel is on, so we need to freeze any
                //   particles that are contained by it.
                this.checkContainment(this.u235Nuclei);
                this.checkContainment(this.daughterNuclei);
            }

            // Check for model elements that have moved out of the simulation scope.
            this.removeOutOfRangeElements();
        },

        triggerNucleusChange: function(nucleus, byProducts) {
            this.atomicWeightChanged(nucleus, byProducts);
            this.trigger('nucleus-change', nucleus, byProducts);
        },

        triggerNucleusAdded: function(nucleus) {
            this.trigger('nucleus-added', nucleus);
        },

        /**
         * Handle a change in atomic weight of the primary nucleus, which generally
         *   indicates a fission event.
         */
        atomicWeightChanged: function(nucleus, byProducts) {
            if (byProducts) {
                // There are some byproducts of this event that need to be
                //   managed by this object.
                for (var i = 0; i < byProducts.length; i++) {
                    var byProduct = byProducts[i];
                    if (byProduct instanceof Nucleon) {
                        // Set a direction and velocity for this element.
                        var angle = (Math.random() * Math.PI * 2);
                        var xVel = Math.sin(angle) * ChainReactionSimulation.FREED_NEUTRON_VELOCITY;
                        var yVel = Math.cos(angle) * ChainReactionSimulation.FREED_NEUTRON_VELOCITY;
                        byProduct.setVelocity(xVel, yVel);

                        // Add this new particle to our list.
                        this.freeNeutrons.add(byProduct);
                    }
                    else if (byProduct instanceof AtomicNucleus) {
                        // Save the new daughter and let any listeners
                        // know that it exists.
                        var daughterNucleus = byProduct;
                        this.daughterNuclei.add(daughterNucleus);
                        this.triggerNucleusAdded(daughterNucleus);

                        // Set random but opposite directions for the produced
                        // nuclei.
                        var angle = (Math.random() * Math.PI * 2);
                        var xVel = Math.sin(angle) * ChainReactionSimulation.INITIAL_DAUGHTER_NUCLEUS_VELOCITY;
                        var yVel = Math.cos(angle) * ChainReactionSimulation.INITIAL_DAUGHTER_NUCLEUS_VELOCITY;
                        var xAcc = Math.sin(angle) * ChainReactionSimulation.DAUGHTER_NUCLEUS_ACCELERATION;
                        var yAcc = Math.cos(angle) * ChainReactionSimulation.DAUGHTER_NUCLEUS_ACCELERATION;
                        nucleus.setVelocity(xVel, yVel);
                        nucleus.setAcceleration(xAcc, yAcc);
                        daughterNucleus.setVelocity(-xVel, -yVel);
                        daughterNucleus.setAcceleration(-xAcc, -yAcc);
                        
                        if (!(nucleus instanceof Uranium235Nucleus))
                            throw 'Nucleus in fission event expected to be Uranium-235';

                        // Move the 'parent' nucleus to the list of daughter
                        //   nuclei so that it doesn't continue to be involved in
                        //   the fission detection calculations.
                        this.u235Nuclei.remove(nucleus);
                        this.daughterNuclei.add(nucleus);
                    }
                    else {
                        // We should never get here, debug it if it does.
                        throw 'Error: Unexpected byproduct of decay event.';
                    }
                }
            }
            else if (nucleus instanceof Uranium238Nucleus) {

            }
        },

        /**
         * Reacts to a change in the number of U235 nuclei that are present in the model.
         *   Note that this can only be done before the chain reaction has been started.
         */
        numU235NucleiChanged: function(simulation, numU235Nuclei) {
            this.addOrRemoveNuclei(this.u235Nuclei, numU235Nuclei, this.previous('numU235Nuclei'), this.createU235Nucleus);
        },

        /**
         * Reacts to a change in the number of U238 nuclei that are present in the model.
         *   Note that this can only be done before the chain reaction has been started.
         */
        numU238NucleiChanged: function(simulation, numU238Nuclei) {
            this.addOrRemoveNuclei(this.u238Nuclei, numU238Nuclei, this.previous('numU238Nuclei'), this.createU238Nucleus);
        },

        /**
         * Adds or removes nuclei from a collection depending on the requested count.
         */
        addOrRemoveNuclei: function(collection, currentCount, previousCount, nucleusCreationFunction) {
            var difference = currentCount - previousCount;
            if (difference > 0) {
                // We need to add some new nuclei.
                for (var i = 0; i < difference; i++) {
                    var position;

                    if (previousCount === 0 && i === 0) {
                        // This is the first nucleus, so put it at the origin.
                        position = this._point.set(0, 0);
                    }
                    else {
                        position = this.findOpenNucleusLocation();
                    }

                    if (!position) {
                        // We were unable to find a spot for this nucleus.
                        continue;
                    }

                    var nucleus = nucleusCreationFunction(position);

                    collection.add(nucleus);

                    // Let listeners know that a nucleus has been added to the sim
                    this.triggerNucleusAdded(nucleus);
                }

                // Reset any impacts that may have accumulated in the containment
                //   vessel during previous reactions.
                this.containmentVessel.resetImpactAccumulation();
            }
            else {
                // We need to remove some nuclei.  Take them from the back of the
                //   list, since this leaves the nucleus at the origin for last.
                var numNucleiToRemove = Math.abs(difference);
                for (var i = 0; i < numNucleiToRemove; i++) {
                    if (collection.length > 0)
                        collection.last().destroy();
                }
            }
        },

        /**
         * Search for a location that is not already occupied by another nucleus.
         */
        findOpenNucleusLocation: function() {
            var i;
            var j;

            for (i = 0; i < 100; i++) {
                // Randomly select an x & y position
                var xPos = (ChainReactionSimulation.MAX_NUCLEUS_RANGE_X / 2) * (Math.random() - 0.5);
                var yPos = (ChainReactionSimulation.MAX_NUCLEUS_RANGE_Y / 2) * (Math.random() - 0.5);
                var position = this._point.set(xPos, yPos);

                // Check if this point is available.
                var pointAvailable = true;

                if (this.containmentVessel.get('enabled') &&
                    position.distance(0, 0) > this.containmentVessel.get('radius') - ChainReactionSimulation.CONTAINMENT_VESSEL_MARGIN
                ) {
                    pointAvailable = false;
                }
                else if (ChainReactionSimulation.NEUTRON_SOURCE_OFF_LIMITS_RECT.contains(position)) {
                    // Too close to the neutron source.
                    pointAvailable = false;
                }

                for (j = 0; (j < this.u235Nuclei.length) && (pointAvailable === true); j++) {
                    if (position.distance(this.u235Nuclei.at(j).get('position')) < ChainReactionSimulation.INTER_NUCLEUS_PROXIMITRY_LIMIT) {
                        // This point is taken.
                        pointAvailable = false;
                    }
                }
                for (j = 0; (j < this.u238Nuclei.length) && (pointAvailable === true); j++) {
                    if (position.distance(this.u238Nuclei.at(j).get('position')) < ChainReactionSimulation.INTER_NUCLEUS_PROXIMITRY_LIMIT) {
                        // This point is taken.
                        pointAvailable = false;
                    }
                }
                for (j = 0; (j < this.u239Nuclei.length) && (pointAvailable === true); j++) {
                    if (position.distance(this.u239Nuclei.at(j).get('position')) < ChainReactionSimulation.INTER_NUCLEUS_PROXIMITRY_LIMIT) {
                        // This point is taken.
                        pointAvailable = false;
                    }
                }

                if (pointAvailable) {
                    // We have found a usable location.  Return it.
                    return position;
                }
            }

            // If we get to this point in the code, it means that we were unable
            //   to locate a usable point.  Return null.
            return null;
        },

        /**
         * Checks an array of nuclei to see if any of them have come into contact
         *   with the containment vessel and "freezes" any that have.
         */
        checkContainment: function(nuclei) {
            var numNuclei = nuclei.length;
            for (var i = 0; i < numNuclei; i++) {
                var nucleus = nuclei.at(i);
                if (nucleus.getVelocity().length() !== 0 &&
                    this.containmentVessel.isPositionContained(nucleus.get('position'))
                ) {
                    // Freeze the nucleus at the edge of the containment vessel.
                    nucleus.setAcceleration(ChainReactionSimulation.ZERO_ACCELERATION);
                    nucleus.setVelocity(0, 0);
                    nucleus.setPosition(this.containmentVessel.getNearestContainmentPoint(nucleus.get('position')));

                    this.containedElements.add(nucleus);
                    this.containmentVessel.recordImpact(ChainReactionSimulation.NUCLEUS_COLLISION_IMPACT);

                    if (this.containmentVessel.get('exploded')) {
                        // The last impacted caused the vessel to explode, so stop
                        //   checking if nuclei are contained.
                        break;
                    }
                }
            }
        },

        neutronGenerated: function(neutron) {
            // Add this new neutron to the list of free particles.  It
            //   should already be represented in the view and thus does
            //   not need to be added to it.
            this.freeNeutrons.add(neutron);
        },

        containmentVesselExploded: function() {
            // Remove all the nuclei that had been contained by the containment
            // vessel from the model.
            this.removeContainedParticles();
        },

        containmentVesselEnabledChanged: function(model, enabled) {
            if (enabled) {
                // The containment vessel was just enabled, so we need to get rid
                // of existing nuclei and set up the initial conditions.
                this.removeAllParticles();
                setNumU235Nuclei( 1 );
            }
            else {
                // Containment vessel was turned off, so contained particles
                // should go away.
                removeContainedParticles();
            }
        },

        containmentVesselRadiusChanged: function(model, radius) {
            // Remove any nuclei that might now be outside the containment vessel.
            this.removeNucleiOutsideContainmentVessel(this.u235Nuclei);
            this.removeNucleiOutsideContainmentVessel(this.u238Nuclei);

            // Remove any particles or nuclei that might have been captured (i.e.
            //   contained) by the containment vessel.
            this.removeContainedParticles();
        }

    }, Constants.ChainReactionSimulation);

    return ChainReactionSimulation;
});
