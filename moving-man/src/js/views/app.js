define(function(require) {
    
    'use strict';

    var AppView = require('common/app/app');

    var IntroSimView  = require('views/sim/intro');
    var ChartsSimView = require('views/sim/charts');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var universalControlsHtml = require('text!templates/universal-controls.html');

    var MovingManAppView = AppView.extend({

        simViewConstructors: [
            IntroSimView,
            ChartsSimView
        ],

        events: _.extend({}, AppView.prototype.events, {
            'click .sound-btn' : 'changeVolume'
        }),

        /**
         * Override render function to add universal controls
         */
        render: function() {
            AppView.prototype.render.apply(this);

            this.$el.append(universalControlsHtml);
        },

        /**
         * Steps between the different discrete volume values and updates
         *   the button's icon.
         */
        changeVolume: function(event) {
            var $btn = $(event.target).closest('.sound-btn');

            $btn.hide();

            if ($btn.hasClass('sound-btn-mute')) {
                this.$('.sound-btn-low').show();
                _.each(this.simViews, function(simView) {
                    simView.sceneView.movingManView.lowVolume();
                });
            }
            else if ($btn.hasClass('sound-btn-low')) {
                this.$('.sound-btn-high').show();
                _.each(this.simViews, function(simView) {
                    simView.sceneView.movingManView.highVolume();
                });
            }
            else if ($btn.hasClass('sound-btn-high')) {
                this.$('.sound-btn-mute').show();
                _.each(this.simViews, function(simView) {
                    simView.sceneView.movingManView.muteVolume();
                });
            }
        },

    });

    return MovingManAppView;
});
