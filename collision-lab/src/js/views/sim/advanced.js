define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CollisionLabSimView   = require('views/sim');

    // HTML
    var ballSettingsHtml       = require('text!templates/ball-settings-2d.html');
    var advancedCheckboxesHtml = require('text!templates/advanced-checkboxes.html');

    /**
     * Advanced tab
     */
    var AdvancedSimView = CollisionLabSimView.extend({

        ballSettingsHtml: ballSettingsHtml,
        advancedCheckboxesTemplate: _.template(advancedCheckboxesHtml),

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
        },

        /**
         * Renders playback and sim controls
         */
        renderControls: function() {
            CollisionLabSimView.prototype.renderControls.apply(this);

            var data = {
                name: this.name
            };

            this.$('.visibility-controls').append(this.advancedCheckboxesTemplate(data));
        },

    });

    return AdvancedSimView;
});
