define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var TemplateSimulation = require('models/simulation');
    var TemplateSceneView  = require('views/scene');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml = require('text!templates/sim.html');

    // Partials
    var radioOrCheckboxListTemplate = _.template(require('text!templates/radio-or-checkbox-list.html'));

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var TemplateSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {

        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Masses &amp; Springs',
                name: 'masses-and-springs',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new TemplateSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new TemplateSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderPlaybackControls();
            this.renderSceneControls();
            this.renderSceneView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the playback controls
         */
        renderPlaybackControls: function() {

            var speedSettings = Constants.SPEED_SETTINGS;
            var defaultSetting = _.find(speedSettings, {isDefault : true});
            var range = _.object(_.pluck(speedSettings,'range'), _.pluck(speedSettings,'value'));

            var inputName = 'playback-speed';
            var displayAs = 'radio';
            var $sliderOrRadio = this.$('.playback-speed');

            if(displayAs === 'slider'){
                // Intialize controls
                $sliderOrRadio.noUiSlider({
                    start: defaultSetting.value,
                    snap: true,
                    range: range
                });

                $sliderOrRadio.noUiSlider_pips({
                    mode: 'steps',
                    density: 50,
                    format: {
                        to: function( value ){
                            return _.find(speedSettings, {'value' : value}).label;
                        }
                    }
                });
            }else{
                $sliderOrRadio.replaceWith(radioOrCheckboxListTemplate({displayAs : displayAs, options: speedSettings.reverse(), inputName: inputName}));
            }
        },

        /**
         * Renders the scene UI global controls in the upper right hand corner
         */
        renderSceneControls: function(){

            var gravitySettings = Constants.GRAVITY_SETTINGS;
            var defaultSetting = _.find(gravitySettings, {isDefault : true});

            var gravitySettingsOrdered = _.sortBy(gravitySettings, 'value');
            var range = _.object(_.pluck(gravitySettingsOrdered,'range'), _.pluck(gravitySettingsOrdered,'value'));
            var $placeholder = this.$('.gravity-settings-placeholder');

            var inputName = 'gravitySetting';
            var displayAs = 'radio';

            if(displayAs === 'slider'){
                // Intialize controls
                $placeholder.addClass(displayAs);
                $placeholder.noUiSlider({
                    start: defaultSetting.value,
                    snap: true,
                    range: range
                });

                $placeholder.noUiSlider_pips({
                    mode: 'steps',
                    density: 50,
                    format: {
                        to: function( value ){
                            return _.find(gravitySettings, {'value' : value}).label;
                        }
                    }
                });
            }else{
                $placeholder.replaceWith(radioOrCheckboxListTemplate({displayAs : displayAs, options: gravitySettings, inputName: inputName}));
            }

        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
        },

    });

    return TemplateSimView;
});
