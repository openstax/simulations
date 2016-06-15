define(function(require) {
    
    'use strict';

    var _ = require('underscore');

    var PixiAppView = require('common/v3/pixi/view/app');

    var HydrogenAtomSimView  = require('hydrogen-atom/views/sim');
    var BohrModel            = require('hydrogen-atom/models/atomic-model/bohr');

    var Assets = require('assets');

    // Styles
    require('less!hydrogen-atom/styles/font-awesome');
    require('less!hydrogen-atom/styles/app');

    // HTML
    var transitionsDialogHtml = require('text!hydrogen-atom/templates/transitions-dialog.html');

    var HydrogenAtomAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            HydrogenAtomSimView
        ],

        transitionsDialogTemplate: _.template(transitionsDialogHtml),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            var groundState = BohrModel.getGroundState();
            var numberOfStates = BohrModel.getNumberOfStates();
            var maxState = groundState + numberOfStates - 1;

            this.$el.append(this.transitionsDialogTemplate({
                groundState: groundState,
                maxState: maxState,
                BohrModel: BohrModel
            }));
        }

    });

    return HydrogenAtomAppView;
});
