define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var MediumControlsView  = require('views/medium-controls');

    var Constants = require('constants');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/prisms-panel.html');
    
    require('less!styles/prisms-panel');

    /**
     * 
     */
    var PrismsPanelView = Backbone.View.extend({

        template: _.template(html),

        events: {

        },

        initialize: function(options) {
            this.prismImages = options.prismImages;
            this.simulation = options.simulation;

            this.initMediumControls();
        },

        initMediumControls: function() {
            this.mediumControlsView = new MediumControlsView({
                model: this.simulation.prismMedium,
                simulation: this.simulation,
                name: 'prisms',
                label: 'Objects'
            });
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                prismImages: this.prismImages
            };

            this.$el.remove();
            this.setElement($(this.template(data)));

            this.mediumControlsView.render();
            this.mediumControlsView.$el
                .removeClass('control-panel');

            this.$('.medium-controls-wrapper').append(this.mediumControlsView.el);

            return this;
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(PrismsPanelView);
    

    return PrismsPanelView;
});