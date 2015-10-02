define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var BarMagnetSimView = require('views/sim/bar-magnet');

    var Assets = require('assets');

    require('less!common/styles/slider');
    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/settings-dialog.html');

    var FaradayAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            BarMagnetSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'slide #needle-spacing-slider' : 'changeNeedleSpacing'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);

            this.$('#needle-spacing-slider').noUiSlider({
                start: 3,
                range: {
                    min: 1,
                    max: 5
                },
                step: 1
            });
        },

        changeNeedleSpacing: function(event) {
            
        }

    });

    return FaradayAppView;
});
