define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var Battery  = require('models/components/battery');
    var Junction = require('models/junction');

    var BatteryView          = require('views/components/battery');
    var ComponentToolboxIcon = require('views/component-toolbox-icon');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A visual representation of some kind of object supply.  The
     *   user creates new objects with this view.  Dragging from 
     *   the view creates a new object and places it in the scene,
     *   while dragging an existing object back onto this view
     *   destroys it.
     */
    var BatteryToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Battery'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * Returns the icon sprite
         */
        createIconSprite: function() {
            return Assets.createSprite(Assets.Images.BATTERY);
        },

        /**
         * Returns the schematic-mode icon sprite
         */
        createSchematicIconSprite: function() {
            return Assets.createSprite(Assets.Images.SCHEMATIC_BATTERY);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var batteryScale = 0.75;
            var L = 1.6 * batteryScale;
            var H = L * (240 / 720); // Original: 1.8, which is taller than it is long, which doesn't make sense

            var model = new Battery({
                startJunction: new Junction({ position: new Vector2(0, 0) }),
                endJunction:   new Junction({ position: new Vector2(L, 0) }),
                length: L,
                height: H,
                internalResistance: 1E-4,
                internalResistanceOn: true
            });
            this.setJunctionPositions(model, x, y);

            var view = new BatteryView({
                mvt: this.mvt,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return BatteryToolboxIcon;
});