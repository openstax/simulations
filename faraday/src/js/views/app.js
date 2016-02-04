define(function(require) {
    
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var PixiAppView = require('common/v3/pixi/view/app');

    var BarMagnetSimView     = require('views/sim/bar-magnet');
    var PickupCoilSimView    = require('views/sim/pickup-coil');
    var ElectromagnetSimView = require('views/sim/electromagnet');
    var TransformerSimView   = require('views/sim/transformer');
    var GeneratorSimView     = require('views/sim/generator');

    var Assets = require('assets');

    var Constants = require('constants');

    require('less!common/styles/slider');
    require('less!styles/font-awesome');
    require('less!styles/app');

    var settingsDialogHtml = require('text!templates/settings-dialog.html');
    var settingsButtonHtml = require('text!templates/settings-button.html');

    var FaradayAppView = PixiAppView.extend({

        assets: Assets.getAssetList(),

        simViewConstructors: [
            BarMagnetSimView,
            PickupCoilSimView,
            ElectromagnetSimView,
            TransformerSimView,
            GeneratorSimView
        ],

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsButtonHtml);

            var $dialog = $(settingsDialogHtml);

            $dialog.find('#needle-spacing-slider').on('slide', _.bind(this.changeNeedleSpacing, this));
            $dialog.find('#needle-size-slider'   ).on('slide', _.bind(this.changeNeedleSize,    this));

            $dialog.find('#needle-spacing-slider').noUiSlider({
                start: Constants.GRID_SPACING,
                range: {
                    min: Constants.GRID_SPACING_MIN,
                    max: Constants.GRID_SPACING_MAX
                },
                step: 1
            });

            $dialog.find('#needle-size-slider').noUiSlider({
                start: Constants.GRID_NEEDLE_WIDTH,
                range: {
                    min: Constants.GRID_NEEDLE_WIDTH_MIN,
                    max: Constants.GRID_NEEDLE_WIDTH_MAX
                },
                step: 1
            });

            this.$spacing = $dialog.find('#needle-spacing-value');
            this.$size    = $dialog.find('#needle-size-value');

            $('body').append($dialog);
        },

        changeNeedleSpacing: function(event) {
            var spacing = parseInt($(event.target).val());
            this.$spacing.html(spacing);

            for (var i = 0; i < this.simViews.length; i++)
                this.simViews[i].setNeedleSpacing(spacing);
        },

        changeNeedleSize: function(event) {
            var width  = parseInt($(event.target).val());
            var height = parseInt(width / Constants.GRID_NEEDLE_ASPECT_RATIO);

            this.$size.html(width + 'x' + height);

            for (var i = 0; i < this.simViews.length; i++)
                this.simViews[i].setNeedleSize(width, height);
        }

    });

    return FaradayAppView;
});
