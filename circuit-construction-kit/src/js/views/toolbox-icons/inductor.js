define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var Inductor = require('models/components/inductor');
    var Junction = require('models/junction');

    var InductorView         = require('views/components/inductor');
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
    var InductorToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Inductor'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            return Assets.createSprite(Assets.Images.INDUCTOR);
        },

        /**
         * Returns the schematic-mode icon sprite
         */
        createSchematicIconSprite: function() {
            return Assets.createSprite(Assets.Images.SCHEMATIC_INDUCTOR);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var L = 1.2;
            var H = 0.4;

            var model = new Inductor({
                startJunction: new Junction({ position: new Vector2(0, 0) }),
                endJunction:   new Junction({ position: new Vector2(L, 0) }),
                length: L,
                height: H
            });
            this.setJunctionPositions(model, x, y);

            var view = new InductorView({
                mvt: this.mvt,
                simulation: this.simulation,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return InductorToolboxIcon;
});