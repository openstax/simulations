define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var SolidLiquidGasSimView = require('views/sim/solid-liquid-gas');
    var PhaseChangesSimView   = require('views/sim/phase-changes');

    var Assets = require('assets');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/settings-dialog.html');


    var SOMAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            SolidLiquidGasSimView,
            PhaseChangesSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'click #temperature-kelvin'  : 'kelvinSelected',
            'click #temperature-celsius' : 'celsiusSelected'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        },

        kelvinSelected: function(event) {
            _.each(this.simViews, function(simView) {
                simView.useKelvin();
            });
        },

        celsiusSelected: function(event) {
            _.each(this.simViews, function(simView) {
                simView.useCelsius();
            });
        }

    });

    return SOMAppView;
});
