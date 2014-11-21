define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Vector2   = require('vector2-node');
    var Rectangle = require('rectangle-node');
    var Pool      = require('object-pool');

    /**
     * Constants
     */
    var Constants = require('models/constants');

    /**
     * Static caching objects
     */
    var boundingRect    = new Rectangle();
    var lengthBounds    = new Rectangle();
    var vectorToEdge    = new Vector2();
    var edgePosition    = new Vector2();
    var edgeForce       = new Vector2();
    var vectorToOther   = new Vector2();
    var vectorToCenter  = new Vector2();
    var dragForceVector = new Vector2();
    var randomLocation  = new Vector2();

    var forceVectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var EnergyChunkDistributor = {};

    /**
     * Apply static constants
     */
    _.extend(EnergyChunkDistributor, Constants.EnergyChunkDistributor);

    /**
     * Functions
     */
    _.extend(EnergyChunkDistributor, {

        /**
         * Redistribute a set of energy chunks that are contained in energy chunk
         *   "slices".  This is done in this way because all of the energy chunks in
         *   a set of slices interact with each other, but the container for each is
         *   defined by the boundary of its containing slice.
         */
        updatePositions: function(slices, deltaTime) {
            var i;
            var j;

            // Determine a rectangle that bounds all of the slices.
            var bounds = EnergyChunkDistributor.calculateBounds(slices);

            // Create a map that tracks the force applied to each energy chunk.
            var energyChunkForceVectors = EnergyChunkDistributor.initEnergyChunkForceVectors(slices);

            // Get list of all the chunks so we can easily cycle through them.
            var chunks = EnergyChunkDistributor.getChunksFromSlices(slices);

            // Make sure that there is actually something to distribute.
            if (!chunks.length)
                return;

            // Determine the minimum distance that is allowed to be used in the
            //   force calculations.  This prevents hitting infinities that can
            //   cause run time issues or unreasonably large forces.
            var minDistance = Math.min(bounds.w, bounds.h) / 20; // Divisor empirically determined.

            // The particle repulsion force varies inversely with the density of
            //   particles so that we don't end up with hugely repulsive forces that
            //   tend to push the particles out of the container.  This formula was
            //   made up, and can be adjusted if needed.
            var forceConstant = EnergyChunkDistributor.ENERGY_CHUNK_MASS * bounds.w * bounds.h * 0.1 / chunks.length;

            // Loop once for each max time step plus any remainder.
            var slice;
            var containerShape;
            var chunk;
            var forceVector;

            var particlesRedistributed = false;
            var numForceCalcSteps = deltaTime / EnergyChunkDistributor.MAX_TIME_STEP;
            var extraTime = deltaTime - numForceCalcSteps * EnergyChunkDistributor.MAX_TIME_STEP;

            for (var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++) {
                var timeStep = forceCalcStep < numForceCalcSteps ? EnergyChunkDistributor.MAX_TIME_STEP : extraTime;

                // The energy of the chunk with the highest energy
                var maxEnergy = 0;

                // Update the forces acting on the particle due to its bounding
                //   container, other particles, and drag.
                for (i = 0; i < slices.length; i++) {
                    slice = slices[i];
                    containerShape = slice.getShape();

                    // Determine the max possible distance to an edge.
                    var maxDistance = Math.sqrt( 
                        Math.pow(containerShape.getBounds().w, 2) +
                        Math.pow(containerShape.getBounds().h, 2) 
                    );

                    for (j = 0; j < slice.energyChunkList.length; j++) {
                        chunk = slice.energyChunkList[j];
                        forceVector = energyChunkForceVectors[i][j];

                        // Determine forces on each energy chunk.
                        EnergyChunkDistributor.calculateEnergyChunkForces(chunk, forceVector, chunks, bounds, containerShape, minDistance, maxDistance, forceConstant);

                        // Update energy chunk velocities, drag force, and position.
                        var energy = EnergyChunkDistributor.updateChunk(chunk, timeStep, forceVector);

                        if (energy > maxEnergy)
                            maxEnergy = energy;

                        // Clean the pool now that we're done with it.
                        forceVectorPool.remove(forceVector);
                    }
                }

                // See if anything actually changed
                particlesRedistributed = maxEnergy > EnergyChunkDistributor.REDISTRIBUTION_THRESHOLD_ENERGY;

                if (particlesRedistributed) {
                    // Update position of each energy chunk
                    for (j = 0; j < chunks.length; j++) {
                        chunk = chunks[j];
                        chunk.position.add(chunk.velocity.scale(timeStep));
                    }
                }
            }

            return particlesRedistributed;
        },

        initEnergyChunkForceVectors: function(slices) {
            var energyChunkForceVectors = [];
            for (var i = 0; i < slices.length; i++) {
                energyChunkForceVectors[i] = [];
                for (var j = 0; j < slices[i].energyChunkList.length; j++)
                    energyChunkForceVectors[i][j] = forceVectorPool.create();
            }
            return energyChunkForceVectors;
        },

        getChunksFromSlices: function(slices) {
            var chunks = [];
            for (var i = 0; i < slices.length; i++) {
                for (var j = 0; j < slices[i].energyChunkList.length; j++) {
                    chunks.push(slices.energyChunkList[i][j]);
                }
            }
            return chunks;
        },

        calculateEnergyChunkForces: function(chunk, forceVector, chunks, bounds, containerShape, minDistance, maxDistance, forceConstant) {
            // Reset accumulated forces.
            forceVector.set(0, 0);

            if (containerShape.contains(chunk.position)) {
                EnergyChunkDistributor.addContainerEdgeForces(chunk, forceVector, containerShape, minDistance, maxDistance, forceConstant);
                EnergyChunkDistributor.addForcesFromOtherChunks(chunk, forceVector, chunks, minDistance, forceConstant);
            }
            else {
                // Point is outside container, move it towards center of shape.
                vectorToCenter
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
        },

        updateChunk: function(chunk, timeStep, forceVector) {
            // Calculate the energy chunk's velocity as a result of forces acting on it.
            chunk.velocity.add(forceVector.scale(timeStep / EnergyChunkDistributor.ENERGY_CHUNK_MASS));

            // Calculate drag force.  Uses standard drag equation.
            var dragMagnitude = 0.5 
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

            // Return the new total energy
            return 0.5
                * EnergyChunkDistributor.ENERGY_CHUNK_MASS
                * chunk.velocity.lengthSq()
                + forceVector.length() * Math.PI / 2;
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

            return boundingRect.set(
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
        addContainerEdgeForces: function(chunk, forceVector, containerShape, minDistance, maxDistance, forceConstant) {
            // Loop on several angles, calculating the forces from the
            //   edges at the given angle.
            for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                var edgeDetectSteps = 8;

                lengthBounds.x = 0;
                lengthBounds.w = maxDistance;

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
                edgeForce
                    .set(forceConstant / Math.pow(lengthBounds.center().x, 2))
                    .rotate(angle + Math.PI);
                forceVector.plus(edgeForce);
            }
        },

        /**
         * Adds forces exerted by other chunks to this chunk but
         *   has limits on the maximum force that can be applied.
         */
        addForcesFromOtherChunks: function(chunk, forceVector, chunks, minDistance, forceConstant) {
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
            return randomLocation.set(
                rect.left()   + (Math.random() * rect.w),
                rect.bottom() + (Math.random() * rect.h)
            );
        }

    });

    return EnergyChunkDistributor;
});
