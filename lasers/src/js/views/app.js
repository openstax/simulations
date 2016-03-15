define(function(require) {
    
    'use strict';

    var _ = require('underscore');

    var PixiAppView = require('common/v3/pixi/view/app');

    var OneAtomSimView       = require('views/sim/one-atom');
    var MultipleAtomsSimView = require('views/sim/multiple-atoms');

    var Assets = require('assets');

    // Styles
    require('less!styles/font-awesome');
    require('less!styles/app');

    // HTML
    var settingsDialogHtml = require('text!templates/settings-dialog.html');

    /**
     * AppView for the Lasers simulation
     */
    var LasersAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            OneAtomSimView,
            MultipleAtomsSimView
        ],

        events: _.extend({}, PixiAppView.prototype.events, {
            
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        },

        __TODO_settingSet: function(event) {
            _.each(this.simViews, function(simView) {
                
            });
        }

    });

    return LasersAppView;
});
