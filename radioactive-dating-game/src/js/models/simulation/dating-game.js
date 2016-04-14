define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var HalfLifeInfo = require('models/half-life-info');

    var ItemDatingSimulation   = require('radioactive-dating-game/models/simulation/item-dating');
    var RadiometricDatingMeter = require('radioactive-dating-game/models/radiometric-dating-meter');
    var DatableItem            = require('radioactive-dating-game/models/datable-item');

    /**
     * Constants
     */
    var Constants = require('constants');
    var Assets = require('assets');

    /**
     * Simulation model for multi-nucleus radioactive-dating-game simulation
     */
    var DatingGameSimulation = ItemDatingSimulation.extend({

        defaults: _.extend({}, ItemDatingSimulation.prototype.defaults, {
            
        }),

        /**
         * Initializes the models used in the simulation
         */
        initialize: function(attributes, options) {
            ItemDatingSimulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            ItemDatingSimulation.prototype.initComponents.apply(this, arguments);

            this.items = new Backbone.Collection();

            var Images = Assets.Images;
            var PI = Math.PI;
                
            // Add the datable objects.
            // Params:    name,                 image file,              position,              width, rotation, age,                                isOrganic
            this.addItem('House',               Images.HOUSE,            new Vector2(780, 400),   130,      0, HalfLifeInfo.convertYearsToMs(75),      true);
            this.addItem('Trilobyte',           Images.TRILOBYTE_FOSSIL, new Vector2(740,  78),    40,      0, HalfLifeInfo.convertYearsToMs(309.6E6), true);
            this.addItem('Animal Skull',        Images.SKULL_ANIMAL,     new Vector2(140, 310),    70, PI/4-1, HalfLifeInfo.convertYearsToMs(150),     true);
            this.addItem('Living Tree',         Images.TREE_1,           new Vector2(240, 400),   130,      0, 0,                                      true);
            this.addItem('Distant Living Tree', Images.TREE_1,           new Vector2(530, 378),    30,      0, 0,                                      true);
            this.addItem('Fish Fossil',         Images.FISH_FOSSIL,      new Vector2(300, 134),   100,      0, HalfLifeInfo.convertYearsToMs(28E6),    true);
            this.addItem('Dead Tree',           Images.DEAD_TREE,        new Vector2(400, 320),    26,   PI/2, HalfLifeInfo.convertYearsToMs(220),     true);
            this.addItem('Fish Bones',          Images.FISH_BONES,       new Vector2(800, 190),    90,      0, HalfLifeInfo.convertYearsToMs(16E3),    true);
            this.addItem('Rock 1',              Images.ROCK_E,           new Vector2(580, 134),    50,      0, HalfLifeInfo.convertYearsToMs(137E6),   false);
            this.addItem('Rock 2',              Images.ROCK_F,           new Vector2(400,  80),    40,      0, HalfLifeInfo.convertYearsToMs(261E6),   false);
            this.addItem('Rock 3',              Images.ROCK_A,           new Vector2(240,  24),    50,      0, HalfLifeInfo.convertYearsToMs(448.5E6), false);
            this.addItem('Rock 4',              Images.ROCK_B,           new Vector2(600,  24),    46,      0, HalfLifeInfo.convertYearsToMs(723E6),   false);
            this.addItem('Rock 5',              Images.ROCK_C,           new Vector2(900,  24),    46,      0, HalfLifeInfo.convertYearsToMs(1.25E9),  false);
            this.addItem('Dinosaur Skull',      Images.DINOSAUR_SKULL,   new Vector2(900, 134),    80,      0, HalfLifeInfo.convertYearsToMs(155E6),   true);
            this.addItem('Human Skull',         Images.HUMAN_SKULL,      new Vector2(960, 250),    30,      0, HalfLifeInfo.convertYearsToMs(2200),    true);
            this.addItem('Wooden Cup',          Images.CUP,              new Vector2(700, 246),    30,  -PI/3, HalfLifeInfo.convertYearsToMs(1035),    true);
            this.addItem('Bone',                Images.BONE,             new Vector2(330, 246),    70,      0, HalfLifeInfo.convertYearsToMs(1450),    true);
            this.addItem('Human Skull',         Images.HUMAN_SKULL,      new Vector2(450, 190),    30,      1, HalfLifeInfo.convertYearsToMs(40E3),    true);
            
            this.meter = new RadiometricDatingMeter({
                position: DatingGameSimulation.INITIAL_METER_POSITION
            });

            this.estimates = [];
        },

        addItem: function(name, image, position, width, rotation, age, isOrganic) {
            this.items.add(new DatableItem({
                name: name,
                image: image,
                position: position,
                width: width,
                rotation: rotation,
                age: age,
                isOrganic: isOrganic
            }));
        },

        reset: function() {
            this.estimates = [];
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            this.updateMeter(time, deltaTime);
        },

        updateMeter: function(time, deltaTime) {
            this.meter.determineItemBeingTouched(this.items.models);
        },

        getEstimate: function(item) {
            return this.estimates[item.cid];
        },

        setEstimate: function(item, estimate) {
            this.estimates[item.cid] = estimate;

            if (this.estimatePasses(item, HalfLifeInfo.convertYearsToMs(estimate)))
                this.trigger('estimate-passed', item, estimate);
            else
                this.trigger('estimate-failed', item, estimate);

            if (this.allEstimatesPass())
                this.trigger('win');
        },

        /**
         * Returns whether or not the given age estimate is close enough
         *   for the given item.
         */
        estimatePasses: function(item, estimatedAge) {
            var actualAge = item.getRadiometricAge();

            return (
                (estimatedAge <= actualAge * (1 + DatingGameSimulation.AGE_GUESS_TOLERANCE_PERCENTAGE)) &&
                (estimatedAge >= actualAge * (1 - DatingGameSimulation.AGE_GUESS_TOLERANCE_PERCENTAGE))
            );
        },

        allEstimatesPass: function() {
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items.at(i);
                var estimate = HalfLifeInfo.convertYearsToMs(this.estimates[item.cid]);

                if (estimate === undefined || !this.estimatePasses(item, estimate))
                    return false;
            }

            return true;
        }

    }, Constants.DatingGameSimulation);

    return DatingGameSimulation;
});
