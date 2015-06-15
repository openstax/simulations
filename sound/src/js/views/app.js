define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var SingleSourceSimView           = require('views/sim/single-source');
    var MeasureSimView                = require('views/sim/measure');
    var TwoSourceInterferenceSimView  = require('views/sim/two-source-interference');
    var ReflectionInterferenceSimView = require('views/sim/reflection-interference');
    var VariableAirPressureSimView    = require('views/sim/variable-air-pressure');

    var Assets = require('assets');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var universalControlsHtml = require('text!templates/universal-controls.html');

    var SoundAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            SingleSourceSimView,
            MeasureSimView,
            TwoSourceInterferenceSimView,
            ReflectionInterferenceSimView,
            VariableAirPressureSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'click .sound-btn-mute'   : 'mute',
            'click .sound-btn-unmute' : 'unmute'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(universalControlsHtml);

            this.$mute   = this.$('.sound-btn-mute');
            this.$unmute = this.$('.sound-btn-unmute');
        },

        mute: function(event) {
            _.each(this.simViews, function(simView) {
                simView.mute();
            });
            this.$mute.hide();
            this.$unmute.show();
        },

        unmute: function(event) {
            _.each(this.simViews, function(simView) {
                simView.unmute();
            });
            this.$unmute.hide();
            this.$mute.show();
        }

    });

    return SoundAppView;
});
