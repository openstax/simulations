define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    var PixiView = require('../view');

    /**
     * Hybrid view also has an $el/el property that behaves
     *   like the Backbone.View.  Events can be defined for
     *   the element and its decendents with the htmlEvents
     *   property.
     */
    var HybridView = PixiView.extend({

        htmlEvents: {},

        tagName: Backbone.View.prototype.tagName,

        constructor: function() {
            this._ensureElement();
            this.delegateHtmlEvents();

            PixiView.apply(this, arguments);
        },

        _ensureElement: Backbone.View.prototype._ensureElement,

        delegateHtmlEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, [ this.htmlEvents ]);
        },

        undelegateEvents: Backbone.View.prototype.undelegateEvents,

        setElement: Backbone.View.prototype.setElement

    });

    return HybridView;
});
