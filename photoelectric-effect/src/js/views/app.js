define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/v3/pixi/view/app');

    var PEffectSimView = require('views/sim');

    var Assets = require('assets');

    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/settings-dialog.html');

    var PEffectAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            PEffectSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            'click #show-photons-check' : 'togglePhotons'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        },

        togglePhotons: function() {
            if ($(event.target).is(':checked'))
                this.simViews[0].showPhotons();
            else
                this.simViews[0].hidePhotons();
        }

    });

    return PEffectAppView;
});
