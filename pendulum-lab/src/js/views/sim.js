define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var underscoreDeepExtend = require('underscoreDeepExtend');
    _.mixin({deepExtend: underscoreDeepExtend(_)});

    var SimView = require('common/app/sim');
    var StopwatchView = require('common/tools/stopwatch');
    var RulerView = require('common/tools/ruler');
    var BarGraphView = require('common/bar-graph/bar-graph');

    var PendulumLabSimulation = require('models/simulation');
    var PendulumLabSceneView  = require('views/scene');

    var Constants = require('constants');
    var SimSettings = Constants.SimSettings;
    var Initials = require('initials');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml        = require('text!templates/sim.html');
    var optionsHtml    = require('text!templates/select-options.html');
    var choiceListHtml = require('text!templates/choice-list.html');
    var graphHtml      = require('text!templates/graph.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var PendulumLabSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Templates
         */
        template:              _.template(simHtml),
        selectOptionsTemplate: _.template(optionsHtml),
        choiceListTemplate:    _.template(choiceListHtml),
        tabbedGraphTemplate:   _.template(graphHtml),

        /**
         * Dom event listeners
         */
        events: {
            // playback
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'change input[name=playback-speed]' : 'updatePlaybackSpeed',

            // settings
            'click .sound-btn' : 'changeVolume',
            'slide .length-slider' : 'changeLength',
            'slide .mass-slider'   : 'changeMass',

            // tools
            'change .stopwatch-check' : 'toggleStopwatch',

            // simulation properties

            'click .tab' : 'changeEnergyTab',
            'click .btn-zoom-in' : 'zoomInGraph',
            'click .btn-zoom-out' : 'zoomOutGraph'
        },

        /**
         * Inits simulation, views, and variables.
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Pendulum Lab',
                name: 'pendulum-lab',
                link: 'pendulum-lab'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PendulumLabSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PendulumLabSceneView({
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
            this.renderTools();

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
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders energy graphs for the two pendulums
         */
        renderEnergyGraphs: function(system){

            this.energyGraphs = [];
            this.$zoom = this.$el.find('.zoom');

            // this.simulation.systems.each(function(system, iter){
            //     var barGraph = new BarGraphView({
            //         model : system,
            //         title : 'Energy of ' + (iter + 1)
            //     });

            //     barGraph.render();
            //     this.$('.energy-graph-placeholder').append(barGraph.el);
            //     barGraph.$el.hide();
            //     this.energyGraphs.push(barGraph);
            // }, this);

            // this.renderTabbedGraph(this.$('.energy-graph-tabs'), this.simulation.systems);

            // this.$zoom.text((this.energyGraphs[0]._zoom) + 'x');
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

            this.renderSelectOptions(this.$('#gravity-setting'), _.shuffle(Constants.SimSettings.GRAVITY));

            this.renderDiscreteSlider(this.$('.friction-slider'), this.getFrictionSettings(), {
                pips : {
                    mode : 'count',
                    values : 3
                }
            });

            var lengthSliderSettings = {
                step:  SimSettings.LENGTH_STEP,
                start: SimSettings.DEFAULT_LENGTH,
                range: {
                    'min': SimSettings.LENGTH_MIN,
                    'max': SimSettings.LENGTH_MAX
                }
            };

            var massSliderSettings = {
                step:  SimSettings.MASS_STEP,
                start: SimSettings.DEFAULT_MASS,
                range: {
                    'min': SimSettings.MASS_MIN,
                    'max': SimSettings.MASS_MAX
                }
            };

            this.$('#length-slider-1').noUiSlider(lengthSliderSettings);
            this.$('#length-slider-2').noUiSlider(lengthSliderSettings);

            this.$('#mass-slider-1').noUiSlider(massSliderSettings);
            this.$('#mass-slider-2').noUiSlider(massSliderSettings);

            this.updateGravity();
            this.updateFriction();
            this.updatePlaybackSpeed();
        },


        /**
         * Renders Tools
         */
        renderTools: function(){
            this.stopwatchView = new StopwatchView({
                dragFrame: this.el,
                units : this.simulation.get('units').time,
                position: {
                    x : 525,
                    y : 625 
                }
            });

            this.rulerView = new RulerView({
                dragFrame: this.el,
                position : {
                    x : 20,
                    y : Initials.SpringsY1 * Constants.Scene.PX_PER_METER
                }
            });

            this.rulerView.render();
            this.stopwatchView.render();

            this.$el.append(this.rulerView.el);
            this.$el.append(this.stopwatchView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();

            // Tools
            this.stopwatchView.postRender();
            this.stopwatchView.hide();
            this.rulerView.postRender();

            //this.showEnergyGraph(this.simulation.systems.first());
        },

        showEnergyGraph: function(system){

            var $activeTab = $('.tab[data-system-cid=' + system.cid + ']');

            $activeTab.siblings().removeClass('active');
            $activeTab.addClass('active');

            _.each(this.energyGraphs, function(graph){
                if(graph.model === system){
                    graph.$el.show();
                } else {
                    graph.$el.hide();
                }
            }, this);
        },

        changeEnergyTab: function(clickEvent){
            var systemCID = $(clickEvent.currentTarget).data('system-cid');
            this.showEnergyGraph(this.simulation.systems.get(systemCID));
        },

        zoomInGraph: function(){
            _.each(this.energyGraphs, function(graph){
                graph.zoomIn();
            }, this);

            this.$zoom.text((this.energyGraphs[0]._zoom) + 'x');
        },

        zoomOutGraph: function(){
            _.each(this.energyGraphs, function(graph){
                graph.zoomOut();
            }, this);

            this.$zoom.text((this.energyGraphs[0]._zoom) + 'x');
        },


        /**
         * Functions that link to UI inputs
         */
        updateGravity: function() {
            var gravity = this.$('input[name=gravity-setting]:checked').val();
            this.simulation.set('gravity', gravity);
        },

        updateFriction: function(){
            var friction = this.$('.friction-slider').val();
            this.simulation.set('friction', friction);
        },

        updatePlaybackSpeed: function(){
             
            var speed = this.$('input[name=playback-speed]:checked').val();
            this.timeScale = speed;
        },

        /**
         * Toggles the stopwatch's visibility
         */
        toggleStopwatch: function(event) {
            if ($(event.target).is(':checked'))
                this.stopwatchView.show();
            else
                this.stopwatchView.hide();
        },

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        },

        /**
         * Steps between the different discrete volume values and updates
         *   the button's icon.
         */
        changeVolume: function(event) {
            var $btn = $(event.target).closest('.sound-btn');
            var fromVolumeToVolume = {
                mute : 'low',
                low : 'high',
                high : 'mute'
            };
            var fromVolume = $btn.data('volume');
            var toVolume = fromVolumeToVolume[fromVolume];

            $btn.hide();

            this.$('.sound-btn-'+toVolume).show();
            this.sceneView.setVolume(toVolume);
        },

        changeLength: function(event) {
            var length = parseFloat($(event.target).val());
            var number = parseInt($(event.target).data('number'));

            this.$('#' + $(event.target).attr('id') + '-value').text(length.toFixed(2) + 'm');
        },

        changeMass: function(event) {
            var mass   = parseFloat($(event.target).val());
            var number = parseInt($(event.target).data('number'));

            this.$('#' + $(event.target).attr('id') + '-value').text(mass.toFixed(2) + 'kg');
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

            // adjust delta time to time rate
            deltaTime = deltaTime * this.timeScale;

            // Update the model
            this.simulation.update(time, deltaTime);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
            this.stopwatchView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
            this.rulerView.update();
        },

        /**
         * get friction settings
         */
        getFrictionSettings : function(){
            var frictionSettings = this.generateChoices(Constants.SimSettings.FRICTION_STEPS, Constants.SimSettings.FRICTION_EQUATION);

            frictionSettings[0].label = 'none';
            frictionSettings[Constants.SimSettings.FRICTION_STEP_DEFAULT].isDefault = true;
            frictionSettings[frictionSettings.length - 1].label = 'lots';

            return frictionSettings;
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

            options = _.deepExtend({
                snap : true,
                pips : {
                    mode: 'steps',
                    density: calculateDensity(choices),
                    format: {
                        to: function( value ){
                            var step = _.find(choices, function(choice, iter){
                                return choice.value == value;
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

                    choice.value = parseFloat(choice.value.toFixed(5));

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
         * Renders the options inside a select element
         */
        renderSelectOptions: function($element, choices, options){
            options = _.extend({
                choices: choices
            }, options || {});

            $element.html(this.selectOptionsTemplate(options));

            _.each(options.choices, function(choice) {
                if (choice.isDefault)
                    $element.val(choice.value);
            });

            $element.selectpicker();
        },

        /**
         * Renders a list of choices that are either radio or checklist inputs
         */
        renderChoiceList : function($element, choices, options){
            options = _.extend({
                displayAs: 'radio',
                inputName : ''
            }, options || {});

            options.choices = choices;
            $element.replaceWith(this.choiceListTemplate(options));
        },


        /**
         * Renders tabbed graphs
         */
        renderTabbedGraph : function($element, collection, options){

            options = _.extend({}, options);

            options.collection = collection;
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

    return PendulumLabSimView;
});
