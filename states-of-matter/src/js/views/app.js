define(function(require) {
    
    'use strict';

    var PixiAppView = require('common/pixi/view/app');

    var SolidLiquidGasSimView = require('views/sim/solid-liquid-gas');
    var PhaseChangesSimView   = require('views/sim/phase-changes');

    var Assets = require('assets');

    require('less!styles/font-awesome');

    var settingsDialogHtml = require('text!templates/settings-dialog.html');

    var SOMAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            SolidLiquidGasSimView,
            PhaseChangesSimView
        ],

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        }

    });

    return SOMAppView;
});
