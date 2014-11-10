define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var viewOptions = ['model', 'id', 'displayObject', 'events'];

    /**
     * A View class that acts like the Backbone.View class, complete
     *   with Backbone Events, but it's for a Pixi.js DisplayObject
     *   instead of an HTML element.
     */
    var PixiView = function(options) {
        // Next few lines modeled after Backbone.View's constructor
        options || (options = {});
        _.extend(this, _.pick(options, viewOptions));
        this._ensureDisplayObject();
        this.initialize.apply(this, arguments);
    };

    /**
     * Let the prototype get extended by the Backbone.Events object
     *   so we have all that nice event functionality.
     */
    _.extend(PixiView.prototype, Backbone.Events, {

        /**
         * Field variables
         */
        displayObject: null,
        model: null,

        /**
         *
         */
        initialize: function(options) {

        },

        /**
         * This function should contain all the necessary code for
         *   updating the displayObject before the next frame renders.
         */
        update: function(time, delta) {

        },

        /**
         * Makes sure there's a displayObject specified.  If there
         *   isn't, it creates a new DisplayObjectContainer, which
         *   should be nice for general purposes.
         */
        _ensureDisplayObject: function() {
            if (!this.displayObject) {
                /* Could try to store class names and build an actual
                 *   Pixi DisplayObject off of a name with something
                 *   like "new PIXI[className]", but then I'd have to
                 *   specify different kinds of parameters for their
                 *   constructors and stuff.  But it could be an
                 *   option in the future.
                 */
                this.displayObject = new PIXI.DisplayObjectContainer();
            }
        }

    });

    /**
     * If you read the annotated source for Backbone, in the helpers
     *   section, all the Backbone classes (Model, Collection, View,
     *   etc.) have .extend that references the same function:
     *
     *     Model.extend = Collection.extend = ... = extend;
     * 
     *   This function isn't directly exposed if I require Backbone,
     *   but I could just cheat and grab it off of any old Backbone
     *   object prototype, so I will :)
     */
    PixiView.extend = Backbone.View.extend;


    return PixiView;
});