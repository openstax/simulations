define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CollisionLabSimView   = require('views/sim');

    // HTML
    var ballSettingsHtml = require('text!templates/ball-settings-2d.html');


    /**
     * Advanced tab
     */
    var AdvancedSimView = CollisionLabSimView.extend({

        ballSettingsHtml: ballSettingsHtml,

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Advanced',
                name: 'advanced-sim',
            }, options);

            CollisionLabSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        }

    });

    return AdvancedSimView;
});
