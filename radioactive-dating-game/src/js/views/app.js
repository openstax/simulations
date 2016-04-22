define(function(require) {
    
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var NuclearPhysicsAppView = require('views/app');
    
    var HalfLifeSimView    = require('radioactive-dating-game/views/sim/half-life');
    var DecayRatesSimView  = require('radioactive-dating-game/views/sim/decay-rates');
    var MeasurementSimView = require('radioactive-dating-game/views/sim/measurement');
    var DatingGameSimView  = require('radioactive-dating-game/views/sim/dating-game');

    var Assets = require('assets');

    var universalControlsHtml = require('text!radioactive-dating-game/templates/universal-controls.html');

    require('less!radioactive-dating-game/styles/app');

    var RadioactiveDatingGameAppView = NuclearPhysicsAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HalfLifeSimView,
            DecayRatesSimView,
            MeasurementSimView,
            DatingGameSimView
        ],

        events: _.extend({}, NuclearPhysicsAppView.prototype.events, {
            'click .sound-btn' : 'changeVolume'
        }),

        /**
         * Override render function to add universal controls
         */
        render: function() {
            NuclearPhysicsAppView.prototype.render.apply(this);

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
                    simView.setSoundVolumeLow();
                });
            }
            else if ($btn.hasClass('sound-btn-low')) {
                this.$('.sound-btn-high').show();
                _.each(this.simViews, function(simView) {
                    simView.setSoundVolumeHigh();
                });
            }
            else if ($btn.hasClass('sound-btn-high')) {
                this.$('.sound-btn-mute').show();
                _.each(this.simViews, function(simView) {
                    simView.setSoundVolumeMute();
                });
            }
        },

    });

    return RadioactiveDatingGameAppView;
});
