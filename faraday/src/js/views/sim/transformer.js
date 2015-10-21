define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var FaradaySimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var TransformerSimView = FaradaySimView.extend({

        /**
         * Dom event listeners
         */
        events: _.extend(FaradaySimView.prototype.events, {
            
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Transformer',
                name: 'transformer'
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            this.renderPlaybackControls();

            return this;
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
        }

    });

    return TransformerSimView;
});
