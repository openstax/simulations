define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

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
        initIcon: function() {
            this.icon = Assets.createSprite(Assets.Images.BULB_OFF);
            this.icon.anchor.x = 0.5;
            this.icon.x = this.width / 2;
            var scale;
            if (this.icon.texture.width > this.icon.texture.height)
                scale = this.width / this.icon.texture.width;
            else
                scale = this.width / this.icon.texture.height;
            this.icon.scale.x = scale;
            this.icon.scale.y = scale;
            this.icon.buttonMode = true;
            this.displayObject.addChild(this.icon);
        }

    });


    return LightBulbToolboxIcon;
});