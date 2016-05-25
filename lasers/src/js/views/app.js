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
            'click .help-btn' : 'toggleHelp'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);
        },

        __TODO_settingSet: function(event) {
            _.each(this.simViews, function(simView) {
                
            });
        },

        toggleHelp: function() {
            this.$('.help-btn').toggleClass('active');
            
            if (this.$('.help-btn').hasClass('active'))
                this.showHelp();
            else
                this.hideHelp();
        },

        showHelp: function() {
            for (var i = 0; i < this.simViews.length; i++)
                this.simViews[i].showHelp();
        },

        hideHelp: function() {
            for (var i = 0; i < this.simViews.length; i++)
                this.simViews[i].hideHelp();
        }

    });

    return LasersAppView;
});
