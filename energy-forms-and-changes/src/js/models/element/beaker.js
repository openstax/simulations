define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Vector2   = require('vector2-node');
    var Rectangle = require('rectangle-node');
    var Functions = require('common/functions');

    var RectangularThermalMovableElement = require('models/rectangular-thermal-movable');
    var EnergyContainerCategory          = require('models/energy-container-category');
    var HorizontalSurface                = require('models/horizontal-surface');
    var EnergyChunkDistributor           = require('models/energy-chunk-distributor');

    /**
     * Constants
     */
    var Constants = require('models/constants');
    var Static = {};
    Static.MATERIAL_THICKNESS = 0.001; // In meters.
    Static.NUM_SLICES = 6;
    Static.RAND = new Random( 1 ); // This is seeded for consistent initial energy chunk distribution.
    Static.STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.

    // Constants that control the nature of the fluid in the beaker.
    Static.WATER_SPECIFIC_HEAT = 3000; // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
                                       //   aren't too many chunks and so that a chunk is needed as soon as heating starts.
    Static.WATER_DENSITY = 1000.0; // In kg/m^3, source = design document (and common knowledge).
    Static.INITIAL_FLUID_LEVEL = 0.5;

    /**
     * 
     */
    var Beaker = RectangularThermalMovableElement.extend({

        defaults: _.extend({}, RectangularThermalMovableElement.prototype.defaults, {
            // Property that is used to control and track the amount of fluid in the beaker.
            fluidLevel: 0,
            // Property that allows temperature changes to be monitored.
            temperature: Constants.ROOM_TEMPERATURE,
            // Indicator of how much steam is being emitted.  Ranges from 0 to 1, where
            //   0 is no steam, and 1 is the max amount (full boil).
            steamingProportion: 0,
            // Max height above water where steam still affects the temperature.
            maxSteamHeight: 0
        }),

        initialization: function(attributes, options) {
            RectangularThermalMovableElement.prototype.initialization.apply(this, [attributes, options]);
            this.set('maxSteamHeight', 2 * this.get('height'));

            this._rect = new Rectangle(
                this.get('position').x - SURFACE_WIDTH / 2,
                this.get('position').y,
                Block.SURFACE_WIDTH,
                Block.SURFACE_WIDTH
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

            // Surfaces used for stacking and thermal interaction.
            this.topSurface    = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().top(),    this);
            this.bottomSurface = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom(), this);

            this.on('change:position', this.updateSurfaces);
        },

        update: function(time, deltaTime) {

        },

        updateSurfaces: function() {
            this.topSurface.minX = this.getRect().left();
            this.topSurface.maxX = this.getRect().right();
            this.topSurface.posY = this.getRect().bottom() + Beaker.MATERIAL_THICKNESS;

            this.bottomSurface.minX = this.getRect().left();
            this.bottomSurface.maxX = this.getRect().right();
            this.bottomSurface.posY = this.getRect().bottom();
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
                slice.energyChunkList = [];
            });
            var targetNumChunks = Constants.ENERGY_TO_NUM_CHUNKS_MAPPER(this.get('energy'));
            var initialChunkBounds = this.getSliceBounds();
            while (this.getNumEnergyChunks() < targetNumChunks) {
                // Add a chunk at a random location in the beaker.
                this.addEnergyChunkToNextSlice(new EnergyChunk(
                    EnergyChunk.THERMAL, 
                    EnergyChunkDistributor.generateRandomLocation(initialChunkBounds), 
                    energyChunksVisible 
                ));
            }

            // Distribute the energy chunks within the container.
            for (var i = 0; i < 1000; i++) {
                if (!EnergyChunkDistributor.updatePositions(this.slices, Constants.SIM_TIME_PER_TICK_NORMAL))
                    break;
            }
        },

        addEnergyChunkToNextSlice: function(chunk) {
            var slice;
            var totalSliceArea = 0;
            for (var i = 0; i < this.slices.length; i++) {
                slice = this.slices[i];
                totalSliceArea += slice.bounds.w * slice.bounds.h;
            }
            var sliceSelectionValue = Math.random();
            var chosenSlice = this.slices[0];
            var accumulatedArea = 0;
            for (var i = 0; i < this.slices.length; i++) {
                slice = this.slices[i];
                accumulatedArea += slice.bounds.w * slice.bounds.h;
                if (accumulatedArea / totalSliceArea >= sliceSelectionValue) {
                    chosenSlice = slice;
                    break;
                }
            }
            chosenSlice.addEnergyChunk(chunk);
        },

        calculateWaterMass: function(width, height) {
            return Math.PI * Math.pow(width / 2, 2) * height * Beaker.WATER_DENSITY;
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
            var liquidWaterHeight = height * fluidLevel.get();
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
            return Math.max(this._steamTemperatureFunction(heightAboveWater), Constant.ROOM_TEMPERATURE);
        },

        addEnergyChunkSlices: function() {
            if (this.slices.length)
                return;

            this._fluidRect.set(
                this.get('position').x - this.get('width') / 2,
                this.get('position').y,
                this.get('width'),
                this.get('height') * Beaker.INITIAL_FLUID_LEVEL
            );
            var widthYProjection = Math.abs(this.get('width') * Constants.Z_TO_Y_OFFSET_MULTIPLIER);
            for (var i = 0; i < NUM_SLICES; i++) {
                var proportion = (i + 1) * (1 / (NUM_SLICES + 1));
                // Ah...crap, that's why they gave chunk slices a Shape instead of a Rectangle
            }
        },

    }, Static);

    return Beaker;
});
