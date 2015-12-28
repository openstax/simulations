define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2            = require('common/math/vector2');
    var ModelViewTransform = require('common/math/model-view-transform');

    var Wire     = require('models/components/wire');
    var Junction = require('models/junction');

    var WireView             = require('views/components/wire');
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
    var WireToolboxIcon = ComponentToolboxIcon.extend({

        initialize: function(options) {
            options = _.extend({
                labelText: 'Wire'
            }, options);

            ComponentToolboxIcon.prototype.initialize.apply(this, [options]);
        },

        /**
         * This should be overwritten by child classes to use perhaps the
         *   actual kind of view for the model type with maybe a static
         *   MVT that isn't bound to the scene's MVT.
         */
        createIconSprite: function() {
            var wireModel = new Wire({
                startJunction: new Junction({ position: new Vector2(-0.5, 0) }),
                endJunction:   new Junction({ position: new Vector2( 0.5, 0) })
            });
            var mvt = ModelViewTransform.createScaleMapping(65);
            var wireView = new WireView({
                mvt: mvt,
                circuit: this.simulation.circuit,
                model: wireModel
            });
            return new PIXI.Sprite(wireView.generateTexture());
        },

        /**
         * Creates a new object of whatever this icon represents
         */
        createComponentView: function(x, y) {
            var wireModel = new Wire({
                startJunction: new Junction({ position: new Vector2(-0.75, 0) }),
                endJunction:   new Junction({ position: new Vector2( 0.75, 0) })
            });
            this.setJunctionPositions(wireModel, x, y);

            var wireView = new WireView({
                mvt: this.mvt,
                circuit: this.simulation.circuit,
                model: wireModel
            });
            return wireView;
        }

    });


    return WireToolboxIcon;
});