define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var GrabBagResistor = require('models/components/grab-bag-resistor');

    var GrabBagResistorView  = require('views/components/grab-bag-resistor');
    var ComponentToolboxIcon = require('views/component-toolbox-icon');

    var Constants = require('constants');
    var Assets    = require('assets');

    /**
     * A visual representation of some kind of object supply.  The
     *   user creates new objects with this view.  Dragging from 
     *   the view creates a new object and places it in the scene.
     */
    var GrabBagIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: options.grabBagItem.name
            }, options);

            this.grabBagItem = options.grabBagItem;

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            return Assets.createSprite(this.grabBagItem.imagePath);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var modelLength = this.grabBagItem.modelLength;
            var modelHeight = 1;

            var model = new GrabBagResistor({
                length: modelLength,
                height: modelHeight,
                grabBagItem: this.grabBagItem
            }, {
                start:     new Vector2(0, 0),
                direction: new Vector2(1, 0)
            });
            this.setJunctionPositions(model, x, y);

            var view = new GrabBagResistorView({
                mvt: this.mvt,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return GrabBagIcon;
});