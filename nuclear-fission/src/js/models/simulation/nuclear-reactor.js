define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var AppView           = require('common/v3/app/app');
    var VanillaCollection = require('common/collections/vanilla');
    var Vector2           = require('common/math/vector2');
    var Rectangle         = require('common/math/rectangle');

    var NuclearPhysicsSimulation = require('models/simulation');
    var Uranium235Nucleus        = require('models/nucleus/uranium-235');
    var Uranium238Nucleus        = require('models/nucleus/uranium-238');
    var Nucleon                  = require('models/nucleon');
    var AtomicNucleus            = require('models/atomic-nucleus');

    var ControlRod = require('nuclear-fission/models/control-rod');

    /**
     * Constants
     */
    var Constants = require('constants');

    var REACTOR_POSITION                   = Constants.NuclearReactorSimulation.REACTOR_POSITION;
    var OVERALL_REACTOR_WIDTH              = Constants.NuclearReactorSimulation.OVERALL_REACTOR_WIDTH;
    var OVERALL_REACTOR_HEIGHT             = Constants.NuclearReactorSimulation.OVERALL_REACTOR_HEIGHT;
    var REACTOR_WALL_WIDTH                 = Constants.NuclearReactorSimulation.REACTOR_WALL_WIDTH;
    var NUMBER_OF_REACTION_CHAMBERS        = Constants.NuclearReactorSimulation.NUMBER_OF_REACTION_CHAMBERS;
    var CHAMBER_TO_CONTROL_ROD_WIDTH_RATIO = Constants.NuclearReactorSimulation.CHAMBER_TO_CONTROL_ROD_WIDTH_RATIO;
    var MIN_DISTANCE_FROM_NUCLEI_TO_WALLS  = Constants.NuclearReactorSimulation.MIN_DISTANCE_FROM_NUCLEI_TO_WALLS;
    var MIN_INTER_NUCLEI_DISTANCE          = Constants.NuclearReactorSimulation.MIN_INTER_NUCLEI_DISTANCE;

    /**
     * Base simulation model for multi-nucleus decay simulations
     */
    var NuclearReactorSimulation = NuclearPhysicsSimulation.extend({

        defaults: _.extend({}, NuclearPhysicsSimulation.prototype.defaults, {
            temperature: 0,
            energyReleasedPerSecond: 0,
            totalEnergyReleased: 0,
            reactionStarted: false
        }),
        
        initialize: function(attributes, options) {
            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // Add the collections
            this.u235Nuclei     = new VanillaCollection();
            this.u238Nuclei     = new VanillaCollection();
            this.daughterNuclei = new VanillaCollection();
            this.freeNeutrons   = new VanillaCollection();

            this.controlRods = [];
            this.reactionChamberRects = [];

            this.stepsPerSecond = 1000 / Constants.DELTA_TIME_PER_FRAME;
            this.u235FissionEventCount = 0;
            this.fissionEventBins = [];
            this.currentBin = 0;

            // Set the initial values of the bins to 0
            this.initFissionEventBins();

            // Create the reaction chambers (which are modeled as simple 
            //   rectangles) and the control rods.
            this.initRodsAndReactionChambers();
            
            // Create a rectangle that represents the inner boundary of the
            //   reactor.  This is used to test when particles have effectively
            //   gone outside the bounds of the reactor.
            this.innerReactorRect = new Rectangle(
                REACTOR_POSITION.x + REACTOR_WALL_WIDTH,
                REACTOR_POSITION.y + REACTOR_WALL_WIDTH, 
                OVERALL_REACTOR_WIDTH - (2 * REACTOR_WALL_WIDTH),
                OVERALL_REACTOR_HEIGHT - (2 * REACTOR_WALL_WIDTH)
            );

            this.outerReactorRect = new Rectangle(
                REACTOR_POSITION.x,
                REACTOR_POSITION.y, 
                OVERALL_REACTOR_WIDTH,
                OVERALL_REACTOR_HEIGHT
            );

            this.addNuclei();
        },

        initRodsAndReactionChambers: function() {
            var reactionChamberWidth = (
                OVERALL_REACTOR_WIDTH - (2 * REACTOR_WALL_WIDTH)
            ) / NUMBER_OF_REACTION_CHAMBERS;
            var controlRodWidth = reactionChamberWidth / CHAMBER_TO_CONTROL_ROD_WIDTH_RATIO;
            reactionChamberWidth -= controlRodWidth * (NUMBER_OF_REACTION_CHAMBERS - 1) / NUMBER_OF_REACTION_CHAMBERS;
            var reactionChamberHeight = (OVERALL_REACTOR_HEIGHT - (REACTOR_WALL_WIDTH * 2));

            for (var i = 0; i < NUMBER_OF_REACTION_CHAMBERS; i++) {
                var xPos = REACTOR_POSITION.x + REACTOR_WALL_WIDTH + (i * (reactionChamberWidth + controlRodWidth));
                var yPos = REACTOR_POSITION.y + REACTOR_WALL_WIDTH;
                var chamberRect = new Rectangle(xPos, yPos, reactionChamberWidth, reactionChamberHeight);
                this.reactionChamberRects.push(chamberRect);
                
                if (i < NUMBER_OF_REACTION_CHAMBERS - 1) {
                    // Create a control rod.
                    var controlRod = new ControlRod({
                        position: new Vector2(xPos + reactionChamberWidth, yPos),
                        width: controlRodWidth, 
                        height: OVERALL_REACTOR_HEIGHT
                    });
                    this.controlRods.push(controlRod);
                }
            }
        },

        initFissionEventBins: function() {
            for (var i = 0; i < this.stepsPerSecond; i++)
                this.fissionEventBins[i] = 0;
        },

        addNuclei: function() {
            // Add the unfissioned nuclei to the model.  The first step is to see
            //   how many nuclei can fit in each chamber and their relative
            //   positions.
            var reactionChamberWidth = this.reactionChamberRects[0].w;
            var reactionChamberHeight = this.reactionChamberRects[0].h;
            var numNucleiAcross = Math.floor(((reactionChamberWidth - (2 * MIN_DISTANCE_FROM_NUCLEI_TO_WALLS)) / MIN_INTER_NUCLEI_DISTANCE) + 1);
            var numNucleiDown = Math.floor(((reactionChamberHeight - (2 * MIN_DISTANCE_FROM_NUCLEI_TO_WALLS)) / MIN_INTER_NUCLEI_DISTANCE) + 1);
            
            // Add the U235 and U238 nuclei to each chamber.  Note that the U238
            //   nuclei are present to moderate the reaction, but the educators
            //   have requested that they don't appear visually to the user since
            //   this makes the reactor look too cluttered, so they are not added
            //   to the view.
            var nucleusPosition = new Vector2();
            for (var i = 0; i < this.reactionChamberRects.length; i++) {
                var reactionChamberRect = this.reactionChamberRects[i];
                var xStartPos = reactionChamberRect.x + MIN_DISTANCE_FROM_NUCLEI_TO_WALLS;
                var yStartPos = reactionChamberRect.y + MIN_DISTANCE_FROM_NUCLEI_TO_WALLS;
                
                for (var j = 0; j < numNucleiDown; j++) {
                    for (var k = 0; k < numNucleiAcross; k++) {
                        // Add the U235 nucleus.
                        nucleusPosition.set(
                            xStartPos + (k * MIN_INTER_NUCLEI_DISTANCE), 
                            yStartPos + (j * MIN_INTER_NUCLEI_DISTANCE)
                        );

                        var u235Nucleus = Uranium235Nucleus.create({
                            position: nucleusPosition,
                            fissionInterval: 0,
                            simulation: this
                        });

                        this.u235Nuclei.add(u235Nucleus);
                        
                        // Add the U238 nucleus.  We don't need to listen for
                        // changes to atomic weight.  These exist primarily to
                        // moderate the overall reaction.
                        if (k < numNucleiAcross - 1) {
                            nucleusPosition.set(
                                xStartPos + ((k + 0.5) * MIN_INTER_NUCLEI_DISTANCE), 
                                yStartPos + ((j + 0.5) * MIN_INTER_NUCLEI_DISTANCE)
                            );

                            var u238Nucleus = Uranium238Nucleus.create({
                                position: nucleusPosition,
                                simulation: this
                            });

                            this.u238Nuclei.add(u238Nucleus);
                        }
                    }
                }
            }
        },

        /**
         * Resets the model components
         */
        reset: function() {
            
        },

        /**
         * Get a rectangle that represents the size and position of the reactor in
         *   model coordinates.  Note that this allocates a new rectangle object,
         *   so it should not be called too frequently or performance issues could
         *   result.
         */
        getReactorRect: function() {
            return this.outerReactorRect;
        },

        getReactorWallWidth: function() {
            return REACTOR_WALL_WIDTH;
        },

        getControlRodsMinY: function() {
            return this.innerReactorRect.bottom();
        },

        getControlRodsMaxY: function() {
            return this.innerReactorRect.top();
        },

        /**
         * Fires neutrons into the reaction chambers, which is how the reaction
         *   can be initiated.
         * 
         */
        fireNeutrons: function() {
            var chamberIndicesUsed = [];
            for (var i = 0; i < NuclearReactorSimulation.NUMBER_OF_NEUTRONS_TO_FIRE; i++) {
                // Select the chamber into which this neutron will be fired.
                var chamberIndex = null;
                do {
                    chamberIndex = Math.floor(Math.random() * NUMBER_OF_REACTION_CHAMBERS);
                } while (chamberIndicesUsed.indexOf(chamberIndex) !== -1);
                chamberIndicesUsed.push(chamberIndex);
                var chamberRect = this.reactionChamberRects[chamberIndex];
                
                // Select the initial position along the edge of the chamber.
                var startPosX;
                var startPosY;
                if (Math.random() < 0.5) {
                    // Launch neutron from the side of the chamber.
                    if (Math.random() < 0.5){
                        // Left side.
                        startPosX = chamberRect.left();
                    }
                    else{
                        // Right side.
                        startPosX = chamberRect.right();
                    }
                    startPosY = chamberRect.y + (Math.random() * chamberRect.h);   
                }
                else {
                    // Launch neutron from top or bottom of chamber.
                    if (Math.random() < 0.5){
                        // Top.
                        startPosY = chamberRect.top();
                    }
                    else{
                        // Bottom.
                        startPosY = chamberRect.bottom();
                    }
                    startPosX = chamberRect.x + (Math.random() * chamberRect.w); 
                }
                
                // Calculate a path toward the center of the chamber.
                var center = chamberRect.center();
                var angle = Math.atan2(center.y - startPosY, center.x - startPosX);
                var startVelX = NuclearReactorSimulation.NEUTRON_VELOCITY * Math.cos(angle);
                var startVelY = NuclearReactorSimulation.NEUTRON_VELOCITY * Math.sin(angle);
                
                // Create the neutron and let any listeners know about it.
                var firedNeutron = Nucleon.create({
                    type: Nucleon.NEUTRON, 
                    position: new Vector2(startPosX, startPosY),
                    velocity: new Vector2(startVelX, startVelY),
                    tunnelingEnabled: false
                });
                this.freeNeutrons.add(firedNeutron);
                
                // Make sure we don't get stuck in this loop if we need to fire
                // more neutrons than we have reaction chambers.
                if ((NuclearReactorSimulation.NUMBER_OF_NEUTRONS_TO_FIRE > NuclearReactorSimulation.NUMBER_OF_REACTION_CHAMBERS) &&
                    (chambersUsed.length === NUMBER_OF_REACTION_CHAMBERS)
                ) {
                    // Clear the list of chambers used.
                    chambersUsed = [];
                }
            }
        },

        /**
         * Adjust the position of the control rods.  The control rods can only be
         *   moved up or down.
         */
        moveControlRods: function(yDelta) {
            var numControlRods = this.controlRods.length;
            
            // Make sure that we don't move the control rods where they can't go.
            var minY = this.getControlRodsMinY();
            var maxY = this.getControlRodsMaxY();
            if (numControlRods > 0) {
                var controlRod = this.controlRods[0];
                if (controlRod.getY() + yDelta < minY)
                    yDelta = minY - controlRod.getY();
                else if (controlRod.getY() + yDelta > maxY)
                    yDelta = maxY - controlRod.getY();
            }
            
            // Set the actual position.
            for (var i = 0; i < numControlRods; i++)
                this.controlRods[i].translate(0, yDelta);
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            // Move any free particles that exist and check them for absorption.
            this.updateFreeNeutrons(time, deltaTime);
            // Update nuclei
            this.updateNuclei(time, deltaTime);
            // Update energy properties
            this.updateEnergy(time, deltaTime);
        },

        updateFreeNeutrons: function(time, deltaTime) {
            var i;
            var j;

            // We work from back to front to avoid any problems with removing
            // particles as we go along.
            var numFreeNeutrons = this.freeNeutrons.length;
            for (i = numFreeNeutrons - 1; i >= 0; i--) {
                var freeNucleon = this.freeNeutrons.at(i);
                var particleAbsorbed = false;
                
                // Move the neutron.
                freeNucleon.update();
                
                // Check if the particle has gone outside the bounds of the
                // reactor and, if so, remove it from the model.
                if (!(this.innerReactorRect.contains(freeNucleon.getPosition()))){
                    // Particle is outside the bounds of the reactor, so consider
                    // it to be absorbed by the wall.
                    particleAbsorbed = true;
                }
                
                // Check if the particle has been absorbed by a control rod and, if
                // so, remove it.
                var numControlRods = this.controlRods.length;
                for (j = 0; (j < numControlRods) && (particleAbsorbed == false); j++) {
                    var controlRod = this.controlRods[j];
                    if (controlRod.particleAbsorbed(freeNucleon)) {
                        // The particle is absorbed by the control rod.
                        particleAbsorbed = true;
                    }
                }
                
                // Check if any of the free particles have collided with a U238
                // nucleus.
                var numU238Nuclei = this.u238Nuclei.length;
                for (j = 0; (j < numU238Nuclei) && (particleAbsorbed == false); j++) {
                    var nucleus = this.u238Nuclei.at(j);
                    if (freeNucleon.getPosition().distance(nucleus.getPosition()) <= nucleus.get('diameter') / 2) {
                        // The particle is within capture range - see if the nucleus can capture it.
                        particleAbsorbed = nucleus.captureParticle(freeNucleon, time);
                    }
                }

                // Check if any of the free particles have collided with a U235
                // nucleus and, if so, give the nucleus the opportunity to absorb
                // the neutron (and possibly fission as a result).
                var numU235Nuclei = this.u235Nuclei.length;
                for (j = 0; (j < numU235Nuclei) && (particleAbsorbed == false); j++) {
                    var nucleus = this.u235Nuclei.at(j);
                    if (freeNucleon.getPosition().distance(nucleus.getPosition()) <= nucleus.get('diameter') / 2) {
                        // The particle is within capture range - see if the nucleus can capture it.
                        particleAbsorbed = nucleus.captureParticle(freeNucleon, time);
                    }
                }
                
                if (particleAbsorbed){
                    // The particle has become part of a larger nucleus, so we
                    // need to take it off the list of free particles and let the
                    // view know that it has disappeared as a separate entity.
                    freeNucleon.destroy();
                }
            }
        },

        updateNuclei: function(time, deltaTime) {
            var i;

            for (i = 0; i < this.u235Nuclei.length; i++)
                this.u235Nuclei.at(i).update(time, deltaTime);
            
            for (i = 0; i < this.u238Nuclei.length; i++)
                this.u238Nuclei.at(i).update(time, deltaTime);
        },

        updateEnergy: function(time, deltaTime) {
            // Accumulate the total amount of energy release so far.
            var totalEnergyReleased = this.get('totalEnergyReleased') + (this.u235FissionEventCount * NuclearReactorSimulation.JOULES_PER_FISSION_EVENT);
            
            // Update the bins used for calculating the energy produced per second.
            var energyPerSecond = this.get('energyReleasedPerSecond') + ((this.u235FissionEventCount - this.fissionEventBins[this.currentBin]) * NuclearReactorSimulation.JOULES_PER_FISSION_EVENT);
            this.fissionEventBins[this.currentBin] = this.u235FissionEventCount;
            this.currentBin = (this.currentBin + 1) % this.stepsPerSecond;
            
            // Clear out any accumulated errors.
            if (energyPerSecond < NuclearReactorSimulation.JOULES_PER_FISSION_EVENT)
                energyPerSecond = 0;
            
            // Reset the fission event counter.
            this.u235FissionEventCount = 0;
            
            // See if the internal temperature has changed and, if so, notify any
            // listeners.
            var temperature = energyPerSecond * (1 / NuclearReactorSimulation.JOULES_PER_FISSION_EVENT);
            if (this.get('temperature') !== temperature) {
                // Adjust the temperature, but not instantaneously.
                if (Math.abs(this.get('temperature') - temperature) < NuclearReactorSimulation.MAX_TEMP_CHANGE_PER_TICK)
                    this.set('temperature', temperature);
                else if (this.get('temperature') < temperature)
                    this.set('temperature', this.get('temperature') + NuclearReactorSimulation.MAX_TEMP_CHANGE_PER_TICK);
                else
                    this.set('temperature', this.get('temperature') - NuclearReactorSimulation.MAX_TEMP_CHANGE_PER_TICK);
            }
            
            if ((energyPerSecond !== this.get('energyReleasedPerSecond')) || 
                (totalEnergyReleased !== this.get('totalEnergyReleased'))
            ) {
                // Update our energy-related variables.
                this.set('energyReleasedPerSecond', energyPerSecond);
                this.set('totalEnergyReleased', totalEnergyReleased);
            }
        },

        triggerNucleusChange: function(nucleus, byProducts) {
            this.atomicWeightChanged(nucleus, byProducts);
            this.trigger('nucleus-change', nucleus, byProducts);
        },

        triggerNucleusAdded: function(nucleus) {
            this.trigger('nucleus-added', nucleus);
        },

        triggerNucleusRemoved: function(nucleus) {
            this.trigger('nucleus-removed', nucleus);
        },

        /**
         * Handle a change in atomic weight of the primary nucleus, which generally
         *   indicates a fission event.
         */
        atomicWeightChanged: function(nucleus, byProducts) {
            if (byProducts) {
                // There are some byproducts of this event that need to be
                //   managed by this object.
                
                if (!this.get('reactionStarted')) 
                    this.set('reactionStarted', true);
                
                // Handle the by products.
                for (var i = 0; i < byProducts.length; i++) {
                    var byProduct = byProducts[i];
                    if (byProduct instanceof Nucleon) {
                        // Set a direction and velocity for this neutron.
                        var angle = (Math.random() * Math.PI * 2);
                        var xVel = Math.sin(angle) * NuclearReactorSimulation.FREED_NEUTRON_VELOCITY;
                        var yVel = Math.cos(angle) * NuclearReactorSimulation.FREED_NEUTRON_VELOCITY;
                        byProduct.setVelocity(xVel, yVel);
                        
                        // Add this new particle to our list.
                        this.freeNeutrons.add(byProduct);
                    }
                    else if (byProduct instanceof AtomicNucleus) {
                        // Save the new daughter and let any listeners
                        //   know that it exists.
                        var daughterNucleus = byProduct;

                        this.triggerNucleusAdded(daughterNucleus);

                        // In this model, we just move the daughter nuclei a little
                        //   and then stop them, creating an effect that illustrates
                        //   the split but doesn't have too much stuff flying around.
                        var angle = (Math.random() * Math.PI * 2);
                        var xDistance = Math.sin(angle) * NuclearReactorSimulation.DAUGHTER_NUCLEI_SPLIT_DISTANCE;
                        var yDistance = Math.cos(angle) * NuclearReactorSimulation.DAUGHTER_NUCLEI_SPLIT_DISTANCE;
                        nucleus.setPosition(
                            daughterNucleus.getX() + xDistance,
                            daughterNucleus.getY() + yDistance
                        );
                        daughterNucleus.setPosition(
                            daughterNucleus.getX() - xDistance,
                            daughterNucleus.getY() - yDistance
                        );
                        
                        // Add the daughter nucleus to our collection.
                        this.daughterNuclei.add(daughterNucleus);
                        
                        // Move the 'parent' nucleus to the list of daughter nuclei 
                        //  so that it doesn't continue to be involved in the
                        //  fission detection calculations.
                        this.u235Nuclei.remove(nucleus);
                        this.daughterNuclei.add(nucleus);
                        
                        // Increment the count of fission events.  This will be
                        //   cleared when a total tally is made.
                        this.u235FissionEventCount++;
                    }
                    else {
                        // We should never get here, debug it if it does.
                        throw 'Error: Unexpected byproduct of decay event.';
                    }
                }
            }
        },

        neutronGenerated: function(neutron) {
            // Add this new neutron to the list of free particles.  It
            //   should already be represented in the view and thus does
            //   not need to be added to it.
            this.freeNeutrons.add(neutron);
        }

    }, Constants.NuclearReactorSimulation);

    return NuclearReactorSimulation;
});
