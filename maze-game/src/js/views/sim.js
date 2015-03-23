define(function (require) {

    'use strict';

    // var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var MazeGameSimulation = require('models/simulation');
    var MazeGameSceneView  = require('views/scene');

    var Levels = require('levels');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/level-select');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml         = require('text!templates/sim.html');
    var levelSelectHtml = require('text!templates/level-select.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var MazeGameSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template:            _.template(simHtml),
        levelSelectTemplate: _.template(levelSelectHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn' : 'play',
            'click .pause-btn': 'pause',

            'click .start-game-btn' : 'startGame',
            'click .reset-btn'      : 'reset',

            'click .level-option' : 'selectLevel',

            'click .sound-btn': 'changeVolume'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Maze Game',
                name: 'maze-game',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:levelName', this.levelNameChanged);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MazeGameSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MazeGameSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderLevelSelect();

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
         * Renders the level selection menu
         */
        renderLevelSelect: function() {
            this.$el.append(this.levelSelectTemplate({
                levels: _.keys(Levels)
            }));
            this.levelNameChanged(this.simulation, this.simulation.get('levelName'));
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         * Overrides so that we don't rerender on a reset.
         */
        rerender: function(event) {
            this.sceneView.reset();
        },

        /**
         * Overrides to remove the confirmation dialog because it's
         *   not important in this sim.
         */
        reset: function(event) {
            this.resetSimulation();
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
         * Steps between the different discrete volume values and updates
         *   the button's icon.
         */
        changeVolume: function(event) {
            var $btn = $(event.target).closest('.sound-btn');

            $btn.hide();

            if ($btn.hasClass('sound-btn-mute')) {
                this.$('.sound-btn-low').show();
                this.simulation.set('soundVolume', 20);
            }
            else if ($btn.hasClass('sound-btn-low')) {
                this.$('.sound-btn-high').show();
                this.simulation.set('soundVolume', 80);
            }
            else if ($btn.hasClass('sound-btn-high')) {
                this.$('.sound-btn-mute').show();
                this.simulation.set('soundVolume', 0);
            }
        },

        /**
         * Starts the game timer
         */
        startGame: function() {
            this.simulation.startTimer();
        },

        levelNameChanged: function(simulation, levelName) {
            this.$('.level-selection-panel li').each(function(){
                if ($(this).text() === levelName)
                    $(this).addClass('selected')
                else
                    $(this).removeClass('selected');
            });
        },

        selectLevel: function(event) {
            this.simulation.changeLevel($(event.target).text());
        }

    });

    return MazeGameSimView;
});
