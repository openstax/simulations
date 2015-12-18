define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var Bulb = require('models/components/bulb');

    var LightBulbView = require('views/components/light-bulb');

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
    var LightBulbToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Light Bulb'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            return Assets.createSprite(Assets.Images.BULB_OFF);
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var angle = LightBulbView.getDefaultRotation();

            var model = new Bulb({
                length: 0.43,
                width:  1,
                height: 1
            }, {
                start: new Vector2(),
                direction: new Vector2(Math.cos(angle), Math.sin(angle))
            });
            this.setJunctionPositions(model, x, y);

            var view = new LightBulbView({
                mvt: this.mvt,
                circuit: this.simulation.circuit,
                model: model
            });
            return view;
        }

    });


    return LightBulbToolboxIcon;
});