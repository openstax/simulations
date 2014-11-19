define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Backbone  = require('backbone');
    var Vector2   = require('vector2-node');
    var Rectangle = require('rectangle-node');
    var Pool      = require('object-pool');

    /**
     * Constants
     */
    var Constants = require('models/constants');

    /**
     * 
     */
    var EnergyChunkDistributor = function() {
        this._boundingRect    = new Rectangle();
        this._lengthBounds    = new Rectangle();
        this._vectorToEdge    = new Vector2();
        this._edgePosition    = new Vector2();
        this._edgeForce       = new Vector2();
        this._vectorToOther   = new Vector2();
        this._vectorToCenter  = new Vector2();
        this._dragForceVector = new Vector2();
        this._randomLocation  = new Vector2();

        this._forceVectorPool = Pool({
            init: function() {
                return new Vector2();
            },
            enable: function(vector) {
                vector.set(0, 0);
            }
        });
    };

    /**
     * Apply static constants
     */
    _.extend(EnergyChunkDistributor, Constants.EnergyChunkDistributor);

    /**
     * Functions
     */
    _.extend(EnergyChunkDistributor.prototype, {

        /**
         * Redistribute a set of energy chunks that are contained in energy chunk
         *   "slices".  This is done in this way because all of the energy chunks in
         *   a set of slices interact with each other, but the container for each is
         *   defined by the boundary of its containing slice.
         */
        updatePositions: function(slices, deltaTime) {
            var i;
            var j;
            var pool = this._forceVectorPool;

            // Determine a rectangle that bounds all of the slices.
            var bounds = this.calculateBounds(slices);

            // Create a map that tracks the force applied to each energy chunk.
            var energyChunkForceVectors = [];
            var chunks = [];
            var empty = true;
            for (i = 0; i < slices.length; i++) {
                energyChunkForceVectors[i] = [];
                for (j = 0; j < slices[i].energyChunkList.length; j++) {
                    energyChunkForceVectors[i][j] = pool.create();
                    chunks.push(slices.energyChunkList[i][j]);
                    empty = false;
                }
            }

            // Make sure that there is actually something to distribute.
            if (!empty)
                return;

            // Determine the minimum distance that is allowed to be used in the
            //   force calculations.  This prevents hitting infinities that can
            //   cause run time issues or unreasonably large forces.
            var minDistance = Math.min(bounds.w, bounds.h) / 20; // Divisor empirically determined.

            // The particle repulsion force varies inversely with the density of
            //   particles so that we don't end up with hugely repulsive forces that
            //   tend to push the particles out of the container.  This formula was
            //   made up, and can be adjusted if needed.
            var forceConstant = EnergyChunkDistributor.ENERGY_CHUNK_MASS * bounds.w * bounds.h * 0.1 / energyChunkForceVectors.length;

            // Loop once for each max time step plus any remainder.
            var slice;
            var containerShape;
            var chunk;
            var forceVector;
            var dragForceVector = this._dragForceVector;

            var particlesRedistributed = false;
            var numForceCalcSteps = deltaTime / EnergyChunkDistributor.MAX_TIME_STEP;
            var extraTime = deltaTime - numForceCalcSteps * EnergyChunkDistributor.MAX_TIME_STEP;

            for (var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++) {
                var timeStep = forceCalcStep < numForceCalcSteps ? EnergyChunkDistributor.MAX_TIME_STEP : extraTime;

                // Update the forces acting on the particle due to its bounding
                //   container, other particles, and drag.
                for (i = 0; i < slices.length; i++) {
                    slice = slices[i];
                    containerShape = slice.getShape();

                    // Determine the max possible distance to an edge.
                    double maxDistanceToEdge = Math.sqrt( 
                        Math.pow(containerShape.getBounds().w, 2) +
                        Math.pow(containerShape.getBounds().h, 2) 
                    );

                    // Determine the max possible distance to an edge.
                    for (j = 0; j < slice.energyChunkList.length; j++) {
                        chunk = slice.energyChunkList[j];
                        forceVector = energyChunkForceVectors[i][j];

                        // Reset accumulated forces.
                        forceVector.set(0, 0);

                        if (containerShape.contains(chunk.position)) {
                            this.addContainerEdgeForces(chunk, forceVector, containerShape, minDistance, maxDistanceToEdge, forceConstant);
                            this.addForcesFromOtherChunks(chunk, forceVector, chunks, minDistance, forceConstant);
                        }
                        else {
                            // Point is outside container, move it towards center of shape.
                            var vectorToCenter = this._vectorToCenter
                                .set(
                                    bounds.center().x,
                                    bounds.center().y
                                )
                                .sub(chunk.position);
                            forceVector.set(
                                vectorToCenter
                                    .normalize()
                                    .scale(EnergyChunkDistributor.OUTSIDE_CONTAINER_FORCE)
                            );
                        }
                    }
                }

                // Update energy chunk velocities, drag force, and position.
                var maxEnergy = 0;
                var dragMagnitude;
                for (i = 0; i < slices.length; i++) {
                    for (j = 0; j < slice.energyChunkList.length; j++) {
                        chunk = slice.energyChunkList[j];
                        forceVector = energyChunkForceVectors[i][j];

                        // Calculate the energy chunk's velocity as a result of forces acting on it.
                        chunk.velocity.add(forceVector.scale(timeStep / EnergyChunkDistributor.ENERGY_CHUNK_MASS));

                        // Calculate drag force.  Uses standard drag equation.
                        dragMagnitude = 0.5 
                            * EnergyChunkDistributor.FLUID_DENSITY 
                            * EnergyChunkDistributor.DRAG_COEFFICIENT 
                            * EnergyChunkDistributor.ENERGY_CHUNK_CROSS_SECTIONAL_AREA 
                            * chunk.velocity.lengthSq();

                        if (dragMagnitude > 0) {
                            dragForceVector
                                .set(chunk.velocity)
                                .rotate(Math.PI)
                                .normalize()
                                .scale(dragMagnitude);
                        }
                        else
                            dragForceVector.set(0, 0);

                        // Update velocity based on drag force.
                        chunk.velocity.add(
                            dragForceVector.scale(timeStep / EnergyChunkDistributor.ENERGY_CHUNK_MASS)
                        );

                        // Update max energy.
                        var totalParticleEnergy = 0.5
                            * EnergyChunkDistributor.ENERGY_CHUNK_MASS
                            * chunk.velocity.lengthSq()
                            + forceVector.length() * Math.PI / 2;
                        if (totalParticleEnergy > maxEnergy)
                            maxEnergy = totalParticleEnergy;

                        // Clean pool
                        pool.remove(forceVector);
                    }
                }

                // See if anything actually changed
                particlesRedistributed = maxEnergy > EnergyChunkDistributor.REDISTRIBUTION_THRESHOLD_ENERGY;

                if (particlesRedistributed) {
                    // Update position of each energy chunk
                    _.each(chunks, function(chunk) {
                        chunk.position.add(chunk.velocity.scale(timeStep));
                    });
                }
            }

            return particlesRedistributed;
        },

        /**
         * Returns the bounding box that contains all slices
         */
        calculateBounds: function(slices) {
            var bounds;

            var minX = Number.POSITIVE_INFINITY;
            var minY = Number.POSITIVE_INFINITY;
            var maxX = Number.NEGATIVE_INFINITY;
            var maxY = Number.NEGATIVE_INFINITY;

            for (var i = 0; i < slices.length; i++) {
                bounds = slices[i].getBounds();
                minX  = Math.min(bounds.left(),   minX);
                maxX  = Math.max(bounds.right(),  maxX);
                minY  = Math.min(bounds.bottom(), minY);
                maxY  = Math.max(bounds.top(),    maxY);
            }

            bounds = this._boundingRect.set(
                minX,
                minY,
                maxX - minX,
                maxY - minY
            );
        },

        /**
         * Applies forces exerted by the container's edge to each energy
         *   chunk contained in the container's shape.
         */
        addContainerEdgeForces: function(chunk, forceVector, containerShape, minDistance, maxDistanceToEdge, forceConstant) {
            var lengthBounds = this._lengthBounds;
            var vectorToEdge = this._vectorToEdge;
            var edgePosition = this._edgePosition;
            var edgeForce    = this._edgeForce;

            // Loop on several angles, calculating the forces from the
            //   edges at the given angle.
            for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                var edgeDetectSteps = 8;

                lengthBounds.x = 0;
                lengthBounds.w = maxDistanceToEdge;

                for (var step = 0; step < edgeDetectSteps; step++) {
                    vectorToEdge
                        .set(lengthBounds.center().x, 0)
                        .rotate(angle);

                    edgePosition
                        .set(chunk.position)
                        .add(vectorToEdge);

                    if (containerShape.contains(edgePosition)) {
                        lengthBounds.x = lengthBounds.center().x;
                        lengthBounds.w = lengthBounds.right();
                    }
                    else {
                        lengthBounds.x = lengthBounds.left();
                        lengthBounds.w = lengthBounds.center().x;
                    }
                }

                // Handle case where point is too close to the container's edge.
                if (lengthBounds.center().x < minDistance) {
                    lengthBounds.x = minDistance;
                    lengthBounds.w = minDistance;
                }

                // Apply the force due to this edge.
                edgeForce.set(forceConstant / Math.pow(lengthBounds.center().x, 2).rotate(angle + Math.PI);
                forceVector.plus(edgeForce);
            }
        },

        /**
         * Adds forces exerted by other chunks to this chunk but
         *   has limits on the maximum force that can be applied.
         */
        addForcesFromOtherChunks: function(chunk, forceVector, chunks, minDistance, forceConstant) {
            var vectorToOther = this._vectorToOther;
            // Now apply the force from each of the other
            //   particles, but set some limits on the max force
            //   that can be applied.
            _.each(chunks, function(otherChunk) {
                if (chunk === otherChunk)
                    return;

                // Calculate force vector, but handle cases where too close.
                vectorToOther
                    .set(chunk.position)
                    .sub(otherChunk.position);

                if (vectorToOther.length() < minDistance) {
                    if (vectorToOther.length() === 0) {
                        // Create a random vector of min distance
                        var randomAngle = Math.random() * Math.PI * 2;
                        vectorToOther.set(
                            minDistance * Math.cos(randomAngle), 
                            minDistance * Math.sin(randomAngle)
                        );
                    }
                    else {
                        // Give it a magnitude equal to the min distance
                        vectorToOther
                            .normalize()
                            .scale(minDistance);
                    }
                }

                // Add the force to the accumulated forces on this energy chunk.
                forceVector.add(
                    vectorToOther
                        .normalize()
                        .scale(forceConstant / vectorToOther.lengthSq())
                );
            });
        },

        /**
         * Returns a random location within the specified rectangle.
         */
        generateRandomLocation: function(rect) {
            return this._randomLocation.set(
                rect.left()   + (Math.random() * rect.w),
                rect.bottom() + (Math.random() * rect.h)
            );
        }

    });

    return EnergyChunkDistributor;
});
