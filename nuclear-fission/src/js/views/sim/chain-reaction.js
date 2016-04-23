define(function (require) {

    'use strict';

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');

    var Uranium235Nucleus = require('models/nucleus/uranium-235');
    var Uranium238Nucleus = require('models/nucleus/uranium-238');

    var ChainReactionSimulation = require('nuclear-fission/models/simulation/chain-reaction');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var IsotopeSymbolGenerator    = require('views/isotope-symbol-generator');

    var NuclearFissionSimView   = require('nuclear-fission/views/sim');
    var ChainReactionLegendView = require('nuclear-fission/views/legend/chain-reaction');
    var ChainReactionSceneView  = require('nuclear-fission/views/scene/chain-reaction');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!nuclear-fission/templates/chain-reaction-sim.html');
    var playbackControlsHtml = require('text!nuclear-fission/templates/chain-reaction-playback-controls.html');

    /**
     * Chain Reaction tab
     */
    var ChainReactionSimView = NuclearFissionSimView.extend({

        events: _.extend({}, NuclearFissionSimView.prototype.events, {
            'slide .u-235-slider' : 'changeNumU235Nuclei',
            'slide .u-238-slider' : 'changeNumU238Nuclei'
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

            NuclearFissionSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();
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

            this.$('.u-235-slider').noUiSlider({
                start: 1,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$('.u-238-slider').noUiSlider({
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
         * Responds to changes in the u-235 slider
         */
        changeNumU235Nuclei: function(event) {
            var num = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$u235.text(num + ((num === 1) ? ' Nucleus' : ' Nuclei'));
                this.simulation.set('numU235Nuclei', num);
            });
        },

        /**
         * Responds to changes in the u-238 slider
         */
        changeNumU238Nuclei: function(event) {
            var num = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$u238.text(num + ((num === 1) ? ' Nucleus' : ' Nuclei'));
                this.simulation.set('numU238Nuclei', num);
            });
        },

    });

    return ChainReactionSimView;
});
