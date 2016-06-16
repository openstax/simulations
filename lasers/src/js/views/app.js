define(function(require) {
    
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var PixiAppView      = require('common/v3/pixi/view/app');
    var QuantumConfig    = require('common/quantum/config');
    var AtomicState      = require('common/quantum/models/atomic-state');
    var StimulatedPhoton = require('common/quantum/models/stimulated-photon');

    var OneAtomSimView       = require('views/sim/one-atom');
    var MultipleAtomsSimView = require('views/sim/multiple-atoms');
    var PhotonCollectionView = require('views/photon-collection');

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
            'click .help-btn' : 'toggleHelp',
            'slide .stimulation-probability-slider' : 'changeStimulationProbability',
            'slide .pair-separation-slider' : 'changePairSeparation',
            'slide .photon-diameter-slider' : 'changePhotonDiameter',
            'click .show-all-stimulated-emissions-check' : 'toggleShowAllStimulatedEmissions',
            'click .show-comets-check' : 'toggleShowComets'
        }),

        render: function() {
            PixiAppView.prototype.render.apply(this);

            this.$el.append(settingsDialogHtml);

            this.$stimulationProbabilityValue  = this.$('.stimulation-probability-value');
            this.$stimulationProbabilitySlider = this.$('.stimulation-probability-slider');
            this.$pairSeparationValue          = this.$('.pair-separation-value');
            this.$pairSeparationSlider         = this.$('.pair-separation-slider');
            this.$photonDiameterValue          = this.$('.photon-diameter-value');
            this.$photonDiameterSlider         = this.$('.photon-diameter-slider');

            this.$stimulationProbabilitySlider.noUiSlider({
                start: AtomicState.STIMULATION_LIKELIHOOD,
                range: {
                    min: 0,
                    max: 1
                },
                connect: 'lower'
            });

            this.$pairSeparationSlider.noUiSlider({
                start: StimulatedPhoton.separation,
                range: {
                    min: 0,
                    max: 100
                },
                connect: 'lower'
            });

            this.$photonDiameterSlider.noUiSlider({
                start: PhotonCollectionView.modelSize,
                range: {
                    min: 8,
                    max: 50
                },
                connect: 'lower'
            });

            this.updateStimulationProbabilityValue();
            this.updatePairSeparationValue();
            this.updatePhotonDiameterValue();
        },

        __TODO_settingSet: function(event) {
            _.each(this.simViews, function(simView) {
                
            });
        },

        updateStimulationProbabilityValue: function() {
            this.$stimulationProbabilityValue.text(AtomicState.STIMULATION_LIKELIHOOD.toFixed(2));
        },

        updatePairSeparationValue: function() {
            this.$pairSeparationValue.text(StimulatedPhoton.separation);
        },

        updatePhotonDiameterValue: function() {
            this.$photonDiameterValue.text(PhotonCollectionView.modelSize);
        },

        changeStimulationProbability: function(event) {
            var probability = parseFloat(this.$stimulationProbabilitySlider.val());
            AtomicState.STIMULATION_LIKELIHOOD = probability;
            this.updateStimulationProbabilityValue();
        },

        changePairSeparation: function(event) {
            var separation = parseInt(this.$pairSeparationSlider.val());
            StimulatedPhoton.separation = separation;
            this.updatePairSeparationValue();
        },

        changePhotonDiameter: function(event) {
            var diameter = parseInt(this.$photonDiameterSlider.val());
            PhotonCollectionView.modelSize = diameter;
            this.updatePhotonDiameterValue();
            _.each(this.simViews, function(simView) {
                simView.photonSizeChanged();
            });
        },

        toggleShowAllStimulatedEmissions: function() {
            if ($(event.target).is(':checked'))
                QuantumConfig.ENABLE_ALL_STIMULATED_EMISSIONS = true;
            else
                QuantumConfig.ENABLE_ALL_STIMULATED_EMISSIONS = false;
        },

        toggleShowComets: function() {
            if ($(event.target).is(':checked'))
                PhotonCollectionView.displayAsComets = true;
            else
                PhotonCollectionView.displayAsComets = false;
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
