define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    var PIXI     = require('pixi');

    var viewOptions = ['model', 'id', 'displayObject', 'events'];

    var delegateEventSplitter = /^(\S+)\s*\.(\S*)$/;

    /**
     * A View class that acts like the Backbone.View class, complete
     *   with Backbone Events, but it's for a Pixi.js DisplayObject
     *   instead of an HTML element.
     */
    var PixiView = function(options) {
        // Next few lines modeled after Backbone.View's constructor
        if (!options)
            options = {};
        _.extend(this, _.pick(options, viewOptions));
        this._ensureDisplayObject();
        this.initialize.apply(this, arguments);
        this.delegateEvents();
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
         * Initialization code for new PixiView objects
         */
        initialize: function(options) {},

        /**
         * This function should contain all the necessary code for
         *   updating the displayObject before the next frame renders.
         */
        update: function(time, delta) {

        },

        /**
         * Makes sure there's a displayObject specified.  If there
         *   is no displayObject instance given, it creates one.
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
                this.initializeDisplayObject();
            }
        },

        /**
         * Initializes a new DisplayObjectContainer as the view's
         *   displayObject, which should work for general purposes.
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Container();
        },

        /**
         * Modeled after Backbone.View.prototype.delegateEvents, this
         *   function takes a map of event bindings that looks like:
         *
         *     {
         *       'touchstart .displayObject': 'dragStart'
         *     }
         *
         *   and binds functions to them like this:
         *
         *     this.displayObject.touchstart = this.dragStart;
         */
        delegateEvents: function(events) {
            if (!(events || (events = _.result(this, 'events')))) 
                return this;

            for (var key in events) {
                if (events.hasOwnProperty(key)) {
                    var method = events[key];
                    if (!_.isFunction(method))
                        method = this[events[key]];
                    if (!method)
                        continue;

                    var match = key.match(delegateEventSplitter);
                    var eventName = match[1];
                    var displayObject = this[match[2]];

                    if (!(displayObject instanceof PIXI.DisplayObject))
                        throw 'PixiView: this.' + match[2] + ' must be a DisplayObject to bind events on it.';

                    // if (displayObject.hasOwnProperty(eventName))
                    //     throw 'PixiView: ' + eventName + ' is not a valid event.';

                    displayObject[eventName] = _.bind(method, this);
                    displayObject.interactive = true;    
                }
            }

            return this;
        },

        /** 
         * Removes the displayObject from its parent and unbinds
         *   event listeners for the model.
         */
        removeFrom: function(parentDisplayObject) {
            if (parentDisplayObject !== undefined)
                parentDisplayObject.removeChild(this.displayObject);
            if (this.model)
                this.stopListening(this.model);
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