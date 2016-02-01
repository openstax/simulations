define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var Capacitor = require('models/components/capacitor');
    var Junction  = require('models/junction');

    var CapacitorView        = require('views/components/capacitor');
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
    var CapacitorToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Capacitor'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            return Assets.createSprite(Assets.Images.CAPACITOR);
        },

        /**
         * Returns the schematic-mode icon sprite
         */
        createSchematicIconSprite: function() {
            return Assets.createSprite(Assets.Images.SCHEMATIC_CAPACITOR);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var L = 1;
            var H = 1;

            var model = new Capacitor({
                startJunction: new Junction({ position: new Vector2(0, 0) }),
                endJunction:   new Junction({ position: new Vector2(L, 0) }),
                length: L,
                height: H
            });
            this.setJunctionPositions(model, x, y);

            var view = new CapacitorView({
                mvt: this.mvt,
                simulation: this.simulation,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return CapacitorToolboxIcon;
});