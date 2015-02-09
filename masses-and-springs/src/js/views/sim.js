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
    var choiceListHtml = require('text!templates/choice-list.html');
    var graphHtml = require('text!templates/graph.html');

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

        choiceListTemplate : _.template(choiceListHtml),

        tabbedGraphTemplate : _.template(graphHtml),

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
            this.renderEnergyGraphs();

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
            this.renderChoiceList(this.$('.playback-speed'), Constants.SimSettings.SPEED, {inputName: 'playback-speed'});
        },

        /**
         * Renders the scene UI global controls in the upper right hand corner
         */
        renderSceneControls: function(){

            this.renderChoiceList(this.$('.gravity-settings-placeholder'), Constants.SimSettings.GRAVITY, {inputName: 'gravity-setting'});

            this.renderDiscreteSlider(this.$('.friction-settings-placeholder'), this.getFrictionSettings(), {
                pips : {
                    mode : 'count',
                    values : 3
                }
            });

            // TODO make this for softness.  There's some weird bug right now with the last tick label.
            // this.renderDiscreteSlider(this.$('.softness-settings-placeholder'), this.getSoftnessSettings(), {
            //     pips : {
            //         mode : 'count',
            //         values : 3
            //     }
            // });

        },


        /**
         * Renders the graphs
         */
         renderEnergyGraphs: function(){

            var mockSprings = [{
                spring : 'one'
            },{
                spring : 'two'
            },{
                spring : 'three'
            }]

            this.renderTabbedGraph(this.$('.energy-graph-placeholder'), mockSprings);

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


        /**
         * get friction settings
         */

         getFrictionSettings : function(){
            var frictionSettings = this.generateChoices(Constants.SimSettings.FRICTION_STEPS, Constants.SimSettings.FRICTION_EQUATION);

            frictionSettings[0].label = 'none';
            frictionSettings[5].isDefault = true;
            frictionSettings[10].label = 'lots';

            return frictionSettings;
         },


        /**
         * get softness settings
         */

         getSoftnessSettings : function(){
            var softnessSettings = this.generateChoices(Constants.SimSettings.SOFTNESS_STEPS, Constants.SimSettings.SOFTNESS_EQUATION);

            softnessSettings[0].label = 'soft';
            softnessSettings[5].isDefault = true;
            softnessSettings[10].label = 'hard';

            return softnessSettings;
         },


        /**
         * HELPER RENDER FUNCTIONS
         *
         * Renders a list of choices as an ordered slider
         */
        renderDiscreteSlider : function($element, choices, options){

            if(!_.isArray(choices) || !$element){
                // TODO: Determine whether this needs an error?
                // No choices or no element to place the list into, don't try to render list.
                return;
            }

            options = _.merge({
                snap : true,
                pips : {
                    mode: 'steps',
                    density: calculateDensity(choices),
                    format: {
                        to: function( value ){
                            var step = _.find(choices, function(choice, iter){
                                return parseFloat(choice.value.toFixed(4)) === parseFloat(value.toFixed(4));
                            });

                            return step? step.label : '';
                        }
                    }
                }
            }, options || {});

            var defaultChoice = _.find(choices, {isDefault : true});
            var range = getRange(choices);

            // Intialize slider
            $element.addClass('slider');
            $element.noUiSlider({
                start: defaultChoice.value,
                snap: options.snap,
                range: range
            });

            if(options.pips){            
                $element.noUiSlider_pips(options.pips);
            }


            function getRange(choices, density){
                var range = {};
                var density = density || calculateDensity(choices);
                var orderedChoices = _.sortBy(choices, 'value');

                _.each(orderedChoices, function(choice, order){
                    if(order === 0){
                        range['min'] = choice.value;
                        return;
                    }

                    if(order === orderedChoices.length - 1){
                        range['max'] = choice.value;
                        return;
                    }

                    range[order*density+'%'] = choice.value;
                });

                return range;
            }

            function calculateDensity(choices){
                return 100/(choices.length - 1);
            }
        },


        /**
         * Renders a list of choices that are either radio or checklist inputs
         */
        renderChoiceList : function($element, choices, options){

            if(!_.isArray(choices) || !$element){
                // TODO: Determine whether this needs an error?
                // No choices or no element to place the list into, don't try to render list.
                return;
            }

            options = _.extend({
                displayAs: 'radio',
                inputName : ''
            }, options);

            options.choices = choices;
            $element.replaceWith(this.choiceListTemplate(options));
        },


        /**
         * Renders tabbed graphs
         */
        renderTabbedGraph : function($element, data, options){

            if(!_.isArray(data) || !$element){
                // TODO: Determine whether this needs an error?
                // No choices or no element to place the list into, don't try to render list.
                return;
            }

            options = _.extend({}, options);

            options.data = data;
            $element.replaceWith(this.tabbedGraphTemplate(options));

        },


        /**
         * HELPER OPTIONS GENERATOR
         */
        generateChoices : function(numberOfSteps, functionForEachStep){

            var choices = new Array(numberOfSteps);

            _.each(choices, function(choice, iter){
                choices[iter] = {
                    value : functionForEachStep(iter),
                    label : ''
                };
            });
            return choices;
        }
    });

    return TemplateSimView;
});
