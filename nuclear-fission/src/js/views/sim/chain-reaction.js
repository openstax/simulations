define(function (require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');

    var Uranium235Nucleus = require('models/nucleus/uranium-235');
    var Uranium238Nucleus = require('models/nucleus/uranium-238');

    var ChainReactionSimulation = require('nuclear-fission/models/simulation/chain-reaction');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var NuclearFissionSimView   = require('nuclear-fission/views/sim');
    var ChainReactionLegendView = require('nuclear-fission/views/legend/chain-reaction');
    var ChainReactionSceneView  = require('nuclear-fission/views/scene/chain-reaction');

    var Constants = require('constants');
    var Assets    = require('assets');

    // HTML
    var simHtml              = require('text!nuclear-fission/templates/chain-reaction-sim.html');
    var playbackControlsHtml = require('text!nuclear-fission/templates/chain-reaction-playback-controls.html');

    /**
     * Chain Reaction tab
     */
    var ChainReactionSimView = NuclearFissionSimView.extend({

        events: _.extend({}, NuclearFissionSimView.prototype.events, {
            'click #containment-vessel-check' : 'toggleContainmentVessel',

            'slide .u-235-slider' : 'changeNumU235Nuclei',
            'slide .u-238-slider' : 'changeNumU238Nuclei',

            'change .u-235-slider' : 'updateNumU235',
            'change .u-238-slider' : 'updateNumU238'
        }),

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        playbackControlsTemplate: _.template(playbackControlsHtml),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Chain Reaction',
                name: 'chain-reaction'
            }, options);

            _.bindAll(this, 'updateNumU235', 'updateNumU238');

            NuclearFissionSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();

            this.listenTo(this.simulation, 'change:numU235Nuclei',        this.numU235NucleiChanged);
            this.listenTo(this.simulation, 'change:numU238Nuclei',        this.numU238NucleiChanged);
            this.listenTo(this.simulation, 'change:percentU235Fissioned', this.percentU235FissionedChanged);

            this.listenTo(this.simulation.containmentVessel, 'change:exploded', this.explodedChanged);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ChainReactionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ChainReactionSceneView({
                simulation: this.simulation
            });
        },

        initLegend: function() {
            this.legendView = new ChainReactionLegendView();
        },

        resetSimulation: function() {
            // Set pause the updater and reset everything
            this.updater.pause();
            this.updater.reset();
            this.resetComponents();
            this.resetControls();

            // Resume normal function
            this.updater.play();
            this.play();
            this.pausedChanged();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            NuclearFissionSimView.prototype.resetComponents.apply(this);
            
            this.sceneView.reset();
        },

        /**
         * Resets all the controls back to their default state.
         */
        resetControls: function() {
            this.$('#containment-vessel-check').prop('checked', false);
            this.updateNumU235();
            this.updateNumU238();
            this.percentU235FissionedChanged(this.simulation, 0);
        },

        /**
         * Renders everything
         */
        render: function() {
            var iconMVT = new ModelViewTransform.createScaleMapping(5);
            var iconLabelScale = 0.4;

            var uranium235 = Uranium235Nucleus.create();
            var uranium235Img = PixiToImage.displayObjectToDataURI(
                ParticleGraphicsGenerator.generateLabeledNucleus(uranium235, iconMVT, this.sceneView.renderer, false, iconLabelScale, true), 
                1
            );

            var uranium238 = Uranium238Nucleus.create();
            var uranium238Img = PixiToImage.displayObjectToDataURI(
                ParticleGraphicsGenerator.generateLabeledNucleus(uranium238, iconMVT, this.sceneView.renderer, false, iconLabelScale, true), 
                1
            );

            this.uranium235Img = uranium235Img;
            this.uranium238Img = uranium238Img;

            NuclearFissionSimView.prototype.render.apply(this, arguments);

            this.renderPlaybackControls();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                uranium235Img: this.uranium235Img,
                uranium238Img: this.uranium238Img
            };

            this.$el.html(this.template(data));

            this.$u235Slider = this.$('.u-235-slider');
            this.$u238Slider = this.$('.u-238-slider');

            this.$u235Slider.noUiSlider({
                start: 1,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$u238Slider.noUiSlider({
                start: 0,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$u235 = this.$('#u-235');
            this.$u238 = this.$('#u-238');

            this.$('select').selectpicker();
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(this.playbackControlsTemplate({
                unique: this.cid,
                uranium235Img: this.uranium235Img
            }));

            this.$u235Fissioned = this.$('#u-235-fissioned');
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        /**
         * Renders everything
         */
        postRender: function() {
            NuclearFissionSimView.prototype.postRender.apply(this, arguments);

            this.renderLegend();

            return this;
        },

        /**
         * Enables or disables the containment vessel
         */
        toggleContainmentVessel: function(event) {
            if ($(event.target).is(':checked'))
                this.simulation.containmentVessel.set('enabled', true);
            else
                this.simulation.containmentVessel.set('enabled', false);
        },

        /**
         * Responds to changes in the u-235 slider
         */
        changeNumU235Nuclei: function(event) {
            var num = parseInt($(event.target).val());
            this.inputLock(function() {
                this.simulation.removeDecayedU235Nuclei();
                this.$u235.text(this.getNucleusCountText(num));
                this.simulation.set('numU235Nuclei', num);
            });
        },

        /**
         * Responds to changes in the u-238 slider
         */
        changeNumU238Nuclei: function(event) {
            var num = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$u238.text(this.getNucleusCountText(num));
                this.simulation.set('numU238Nuclei', num);
            });
        },

        numU235NucleiChanged: function(simulation, numU235Nuclei) {
            this.updateLock(this.updateNumU235);
        },

        numU238NucleiChanged: function(simulation, numU238Nuclei) {
            this.updateLock(this.updateNumU238);
        },

        updateNumU235: function() {
            this.$u235Slider.val(this.simulation.get('numU235Nuclei'));
            this.$u235.text(this.getNucleusCountText(this.simulation.get('numU235Nuclei')));
        },

        updateNumU238: function() {
            this.$u238Slider.val(this.simulation.get('numU238Nuclei'));
            this.$u238.text(this.getNucleusCountText(this.simulation.get('numU238Nuclei')));
        },

        getNucleusCountText: function(count) {
            return count + ((count === 1) ? ' Nucleus' : ' Nuclei');
        },

        percentU235FissionedChanged: function(simulation, percentU235Fissioned) {
            this.$u235Fissioned.html(percentU235Fissioned.toFixed(2) + '%');
        },

        explodedChanged: function(simulation, exploded) {
            if (exploded) {
                if (!this.$explosionOverlay) {
                    this.$explosionOverlay = $('<div class="explosion-overlay">');
                    this.$explosionOverlay.append('<div class="explosion-message">You have created an atomic bomb!</div>');
                }

                var texture = Assets.Texture(Assets.Images.MUSHROOM_CLOUD);
                var src = texture.baseTexture.source.src;
                var sceneWidth = this.sceneView.width;
                var sceneHeight = this.sceneView.height;
                var backgroundWidth;
                var backgroundHeight;
                var xOffset;
                var yOffset;
                if (texture.height < sceneHeight) {
                    backgroundHeight = sceneHeight;
                    backgroundWidth = backgroundHeight * (texture.width / texture.height);
                    xOffset = -(backgroundWidth - sceneWidth) / 2;
                    yOffset = 0;
                }
                else {
                    backgroundWidth = sceneWidth;
                    backgroundHeight = backgroundWidth * (texture.height / texture.width);
                    xOffset = 0;
                    yOffset = -(backgroundHeight - sceneHeight) / 2;
                }

                this.$explosionOverlay.css({
                    background: 'url(' + src + ')',
                    width: sceneWidth + 'px',
                    height: sceneHeight + 'px',
                    backgroundSize: backgroundWidth + 'px ' + backgroundHeight + 'px',
                    backgroundPosition: xOffset + 'px ' + yOffset + 'px'
                });

                this.$explosionOverlay
                    .hide()
                    .appendTo(this.$el)
                    .fadeIn(3000);
                this.$el.addClass('exploded');
            }
            else {
                if (this.$explosionOverlay)
                    this.$explosionOverlay.remove();
                this.$el.removeClass('exploded');
            } 
        }

    });

    return ChainReactionSimView;
});
