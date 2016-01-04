define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var SeriesAmmeter = require('models/components/series-ammeter');
    var Junction      = require('models/junction');

    var SeriesAmmeterView    = require('views/components/series-ammeter');
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
    var SeriesAmmeterToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Ammeter'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * Returns the icon sprite
         */
        createIconSprite: function() {
            return Assets.createSprite(Assets.Images.SERIES_AMMETER);
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
            var L = 2;
            var H = 0.6;

            var model = new SeriesAmmeter({
                startJunction: new Junction({ position: new Vector2(0, 0) }),
                endJunction:   new Junction({ position: new Vector2(L, 0) }),
                length: L,
                height: H
            });
            this.setJunctionPositions(model, x, y);

            var view = new SeriesAmmeterView({
                mvt: this.mvt,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return SeriesAmmeterToolboxIcon;
});