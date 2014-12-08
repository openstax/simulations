define(function (require) {

    'use strict';

    var _              = require('underscore');
    var Vector2        = require('common/math/vector2');
    var Rectangle      = require('common/math/rectangle');
    var Functions      = require('common/math/functions');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var RectangularThermalMovableElement = require('models/element/rectangular-thermal-movable');
    var HorizontalSurface                = require('models/horizontal-surface');
    var ThermalContactArea               = require('models/thermal-contact-area');
    var EnergyChunk                      = require('models/energy-chunk');
    var EnergyChunkDistributor           = require('models/energy-chunk-distributor');
    var EnergyChunkContainerSlice        = require('models/energy-chunk-container-slice');
    

    /**
     * Constants
     */
    var Constants = require('constants');
    var EnergyContainerCategory = Constants.EnergyContainerCategory;

    var Static = {};

    Static.calculateWaterMass = function(width, height) {
        return Math.PI * Math.pow(width / 2, 2) * height * Beaker.WATER_DENSITY;
    };

    /**
     * 
     */
    var Beaker = RectangularThermalMovableElement.extend({

        defaults: _.extend({}, RectangularThermalMovableElement.prototype.defaults, {
            // Property that is used to control and track the amount of fluid in the beaker.
            fluidLevel: Constants.Beaker.INITIAL_FLUID_LEVEL,
            // Property that allows temperature changes to be monitored.
            temperature: Constants.ROOM_TEMPERATURE,
            // Indicator of how much steam is being emitted.  Ranges from 0 to 1, where
            //   0 is no steam, and 1 is the max amount (full boil).
            steamingProportion: 0,
            // Max height above water where steam still affects the temperature.
            maxSteamHeight: 0,

            specificHeat: Constants.Beaker.WATER_SPECIFIC_HEAT
        }),

        initialize: function(attributes, options) {
            this.set('mass', Beaker.calculateWaterMass(this.get('width'), this.get('height') * this.get('fluidLevel')));

            // Cached objects
            this._rect = new Rectangle(
                this.get('position').x - this.get('width') / 2,
                this.get('position').y,
                this.get('width'),
                this.get('height')
            );

            this._outlineRect = new Rectangle(
                -this.get('width') / 2,
                0,
                this.get('width'),
                this.get('height')
            );

            this._steamRect = new Rectangle();

            this._fluidRect = new Rectangle();

            this._thermalContactArea = new ThermalContactArea(this._rect, true);

            this._steamTemperatureFunction = Functions.createLinearFunction(
                0, 
                this.get('maxSteamHeight') * this.get('steamingProportion'),
                this.get('temperature'),
                Constants.ROOM_TEMPERATURE
            );

            // Calling the parent's initialize function
            Beaker.__super__.initialize.apply(this, arguments);
            
            this.set('maxSteamHeight', 2 * this.get('height'));

            // Surfaces used for stacking and thermal interaction.
            this.topSurface    = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom() + Beaker.MATERIAL_THICKNESS, this);
            this.bottomSurface = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom(), this);

            this.on('change:position', this.updateSurfaces);
            this.updateSurfaces();
        },

        update: function(time, deltaTime) {

        },

        updateSurfaces: function() {
            this.topSurface.xMin = this.getRect().left();
            this.topSurface.xMax = this.getRect().right();
            this.topSurface.yPos = this.getRect().bottom() + Beaker.MATERIAL_THICKNESS;
            this.topSurface.trigger('change');

            this.bottomSurface.xMin = this.getRect().left();
            this.bottomSurface.xMax = this.getRect().right();
            this.bottomSurface.yPos = this.getRect().bottom();
            this.bottomSurface.trigger('change');
        },

        /**
         * Get the untranslated rectangle that defines the shape of the beaker.
         */
        getRawOutlineRect: function() {
            return this._outlineRect;
        },

        getRect: function() {
            this._rect.x = this.get('position').x - this.get('width') / 2;
            this._rect.y = this.get('position').y;
            return this._rect;
        },

        getTopSurface: function() {
            return this.topSurface;
        },

        getBottomSurface: function() {
            return this.bottomSurface;
        },

        addInitialEnergyChunks: function() {
            _.each(this.slices, function(slice) {
                slice.energyChunkList.reset();
            });
            var targetNumChunks = Constants.energyToNumChunks(this.get('energy'));
            var initialChunkBounds = this.getSliceBounds();
            while (this.getNumEnergyChunks() < targetNumChunks) {
                // Add a chunk at a random location in the beaker.
                var chunk = new EnergyChunk({
                    energyType: EnergyChunk.THERMAL, 
                    position:   EnergyChunkDistributor.generateRandomLocation(initialChunkBounds)
                });
                //console.log(EnergyChunkDistributor.generateRandomLocation(initialChunkBounds));
                this.addEnergyChunkToNextSlice(chunk);
                this.on('change:position', function(model, position) {
                    
                });
            }

            // Distribute the energy chunks within the container.
            for (var i = 0; i < 1000; i++) {
                if (!EnergyChunkDistributor.updatePositions(this.slices, Constants.SIM_TIME_PER_TICK_NORMAL))
                    break;
            }
        },

        addEnergyChunkToNextSlice: function(chunk) {
            var i;
            var slice;
            var sliceBounds;
            var totalSliceArea = 0;
            for (i = 0; i < this.slices.length; i++) {
                slice = this.slices[i];
                sliceBounds = slice.getBounds();
                totalSliceArea += sliceBounds.w * sliceBounds.h;
            }
            var sliceSelectionValue = Math.random();
            var chosenSlice = this.slices[0];
            var accumulatedArea = 0;
            for (i = 0; i < this.slices.length; i++) {
                slice = this.slices[i];
                sliceBounds = slice.getBounds();
                accumulatedArea += sliceBounds.w * sliceBounds.h;
                if (accumulatedArea / totalSliceArea >= sliceSelectionValue) {
                    chosenSlice = slice;
                    break;
                }
            }
            chosenSlice.addEnergyChunk(chunk);
        },

        getThermalContactArea: function() {
            this._thermalContactArea.setBounds(
                this.get('position').x - this.get('width') / 2,
                this.get('position').y,
                this.get('width'),
                this.get('height') * this.get('fluidLevel')
            );
            return this._thermalContactArea;
        },

        /**
         * Get the area where the temperature of the steam can be sensed.
         */
        getSteamArea: function() {
            // Height of steam rectangle is based on beaker height and steamingProportion.
            var liquidWaterHeight = this.get('height') * this.get('fluidLevel');
            return this._steamRect.set(
                this.get('position').x - this.get('width') / 2,
                this.get('position').y + liquidWaterHeight,
                this.get('width'),
                this.get('maxSteamHeight')
            );
        },

        getSteamTemperature: function(heightAboveWater) {
            this._steamTemperatureFunction.set(
                0, 
                this.get('maxSteamHeight') * this.get('steamingProportion'),
                this.get('temperature'),
                Constants.ROOM_TEMPERATURE
            );
            return Math.max(this._steamTemperatureFunction(heightAboveWater), Constants.ROOM_TEMPERATURE);
        },

        addEnergyChunkSlices: function() {
            if (this.slices.length)
                return;

            var fluidRect = this._fluidRect.set(
                this.get('position').x - this.get('width') / 2,
                this.get('position').y,
                this.get('width'),
                this.get('height') * Beaker.INITIAL_FLUID_LEVEL
            );

            var widthYProjection = Math.abs(this.get('width') * Constants.Z_TO_Y_OFFSET_MULTIPLIER);
            var proportion;
            var slicePath;
            var sliceWidth;
            var bottomY;
            var topY;
            var centerX;
            var controlPointYOffset;

            for (var i = 0; i < Beaker.NUM_SLICES; i++) {
                proportion = (i + 1) * (1 / (Beaker.NUM_SLICES + 1));
                slicePath  = new PiecewiseCurve();

                // The slice width is calculated to fit into the 3D projection.
                //   It uses an exponential function that is shifted in order to
                //   yield width value proportional to position in Z-space.
                sliceWidth = (-Math.pow((2 * proportion - 1), 2) + 1) * fluidRect.w;
                bottomY = fluidRect.bottom() - (widthYProjection / 2) + (proportion * widthYProjection);
                topY = bottomY + fluidRect.h;
                centerX = fluidRect.center().x;
                controlPointYOffset = (bottomY - fluidRect.bottom()) * 0.5;

                slicePath.moveTo( centerX - sliceWidth / 2,    bottomY);
                slicePath.curveTo(centerX - sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth / 2, bottomY);
                slicePath.lineTo( centerX + sliceWidth / 2,    topY);
                slicePath.curveTo(centerX + sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth / 2, topY);
                slicePath.lineTo( centerX - sliceWidth / 2,    bottomY);

                this.slices.push(new EnergyChunkContainerSlice(slicePath, -proportion * this.get('width'), this.get('position')));
            }
        },

        getEnergyContainerCategory: function() {
            return EnergyContainerCategory.WATER;
        },

        getEnergyBeyondMaxTemperature: function() {
            return Math.max(this.get('energy') - (Constants.BOILING_POINT_TEMPERATURE * this.get('mass') * this.get('specificHeat')), 0);
        },

        getTemperature: function() {
            return Math.min(Beaker.__super__.getTemperature.apply(this), Constants.BOILING_POINT_TEMPERATURE);
        },

        /*
         * This override handles the case where the point is above the beaker.
         *   In this case, we want to pull from all slices evenly, and not favor
         *   the slices the bump up at the top in order to match the 3D look of the
         *   water surface.
         */
        extractClosestEnergyChunk: function(point) {
            var i;
            var slice;
            var pointIsAboveWaterSurface = true;
            for (i = 0; i < this.slices.length; i++) {
                if (point.y < this.slices[i].getBounds().top()) {
                    pointIsAboveWaterSurface = false;
                    break;
                }
            }

            if (!pointIsAboveWaterSurface) {
                return Beaker.__super__.extractClosestEnergyChunk(point);
            }

            // Point is above water surface.  Identify the slice with the highest
            //   density, since this is where we will get the energy chunk.
            var maxSliceDensity = 0;
            var densestSlice = null;
            for (i = 0; i < this.slices.length; i++) {
                slice = this.slices[i];
                var sliceDensity = slice.energyChunkList.length / (slice.getBounds().w * slice.getBounds().h);
                if (sliceDensity > maxSliceDensity) {
                    maxSliceDensity = sliceDensity;
                    densestSlice = slice;
                }
            }

            if (!densestSlice || !densestSlice.energyChunkList.length) {
                console.error('Beaker - Warning: No energy chunks in the beaker, can\'t extract any.');
                return null;
            }

            var chunk;
            var highestEnergyChunk = densestSlice.energyChunkList.at(0);
            densestSlice.energyChunkList.each(function(chunk) {
                if (chunk.get('position').y > highestEnergyChunk.get('position').y)
                    highestEnergyChunk = chunk;
            });

            this.removeEnergyChunk(highestEnergyChunk);
            return highestEnergyChunk;
        }

    }, _.extend(Static, Constants.Beaker));

    return Beaker;
});
