define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var FaradaySimView = require('views/sim');

    var Constants = require('constants');

    // HTML
    var controlsHtml = require('text!templates/bar-magnet.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var BarMagnetSimView = FaradaySimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        controlsTemplate: _.template(controlsHtml),
        
        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Bar Magnet',
                name: 'faraday',
                link: 'legacy/faraday',
                includeEarth: false
            }, options);

            this.includeEarth = options.includeEarth;

            FaradaySimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            return this;
        },

        /**
         * Renders page content.
         */
        renderScaffolding: function() {
            FaradaySimView.prototype.renderScaffolding.apply(this);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            FaradaySimView.prototype.postRender.apply(this);
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
        },


    });

    return BarMagnetSimView;
});
