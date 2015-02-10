define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var Presets       = require('models/presets');
    var MSSSimulation = require('models/simulation');
    var MSSSceneView  = require('views/scene');

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
    var helpDialogHtml = require('text!templates/help-dialog.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var MSSSimView = SimView.extend({

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
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .rewind-btn' : 'reset',

            'click .remove-body-btn' : 'removeBody',
            'click .add-body-btn'    : 'addBody',

            'keyup  #body-settings-table input': 'bodySettingsInputKeyup',
            'change #body-settings-table input': 'bodySettingsInputChanged',

            'change #preset': 'changePreset',

            'slide .playback-speed' : 'changeSpeed',

            'click #system-centered-check' : 'changeSystemCentered',
            'click #show-traces-check'     : 'changeShowTraces',
            'click #show-grid-check'       : 'changeShowGrid',
            'click #tape-measure-check'    : 'changeShowTapeMeasure'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'My Solar System',
                name: 'my-solar-system',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            //this.listenTo(this.simulation, 'change:numBodies', this.updateBodyRows);
            this.listenTo(this.simulation, 'change:time',      this.updateTime);
            this.listenTo(this.simulation, 'change:paused',    this.pausedChanged);
            this.listenTo(this.simulation, 'change:started',   this.updateStartedState);
            this.listenTo(this.simulation, 'bodies-reset',     this.bodiesReset);

            this.bodiesWeAreListeningTo = [];
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MSSSimulation({
                paused: true
            });
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MSSSceneView({
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
            this.renderHelpDialog();

            this.bodiesReset(this.simulation, this.simulation.bodies);

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                presetNames: _.pluck(Presets, 'name')
            };
            this.$el.html(this.template(data));

            this.$('select').selectpicker();

            var ticks = '<div class="ticks">';
            for (var i = 0; i <= MSSSimulation.MAX_SPEED; i++)
                ticks += '<div class="tick" style="left: ' + ((i / MSSSimulation.MAX_SPEED) * 100) + '%"></div>';
            ticks += '</div>';

            this.$('.playback-speed')
                .noUiSlider({
                    start: 7,
                    step:  1,
                    range: {
                        'min': 0,
                        'max': MSSSimulation.MAX_SPEED
                    }
                })
                .append(ticks);

            this.$time = this.$('#time');
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the help dialog html
         */
        renderHelpDialog: function() {
            this.$('.help-dialog-placeholder').replaceWith(helpDialogHtml);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         * Overrides to remove the confirmation dialog because it's
         *   not important in this sim and also to make sure it is
         *   paused after a reset.
         */
        reset: function(event) {
            this.pause();
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

        removeBody: function() {
            this.simulation.removeBody();
            this.$('#preset').val('');
        },

        addBody: function() {
            this.simulation.addBody();
            this.$('#preset').val('');
        },

        bodiesReset: function(simulation, bodies) {
            // Stop listening to the previous set of bodies
            for (var j = this.bodiesWeAreListeningTo.length - 1; j >= 0; j--) {
                this.stopListening(this.bodiesWeAreListeningTo[j]);
                this.bodiesWeAreListeningTo.splice(j, 1);
            }

            // Start listening to the new set of bodies
            for (var i = 0; i < bodies.length; i++) {
                this.listenTo(bodies[i], 'change:initMass change:initX change:initY change:initVX change:initVY', this.updateBodyInputs);
                this.bodiesWeAreListeningTo.push(bodies[i]);
            }

            this.updateBodyRows();
            this.updateBodyInputs();
        },

        updateBodyRows: function() {
            var numBodies = this.simulation.get('numBodies');
            var $rows = this.$('#body-settings-table tbody tr');

            $rows.each(function(index, row) {
                // Show/hide body input rows
                if (index + 1 <= numBodies)
                    $(row).show();
                else
                    $(row).hide();

                // Hide minus buttons
                $(row).find('.remove-body-btn').hide();
            });

            // Show last minus button if appropriate
            if (numBodies > Constants.MIN_BODIES)
                $rows.eq(numBodies - 1).find('.remove-body-btn').show();

            // Show/hide plus button as appropriate
            if (numBodies < Constants.MAX_BODIES)
                $rows.last().show();
            else
                $rows.last().hide();
        },

        updateBodyInputs: function() {
            var bodies = this.simulation.bodies;

            this.updateLock(function() {
                this.$('#body-settings-table tbody tr').each(function(i) {
                    if (i in bodies) {
                        $(this).find('.mass').val(bodies[i].get('mass'));
                        $(this).find('.pos-x').val(bodies[i].get('x'));
                        $(this).find('.pos-y').val(bodies[i].get('y'));
                        $(this).find('.vel-x').val(bodies[i].get('vx'));
                        $(this).find('.vel-y').val(bodies[i].get('vy'));
                    }
                });
            });
        },

        bodySettingsInputKeyup: function(event) {
            var code = event.keyCode || event.which;
            if (code == 13) { // ENTER pressed
                var colIndex = $(event.target).closest('td').index();
                var rowIndex = $(event.target).closest('tr').index();

                if (rowIndex + 1 <= Constants.MAX_BODIES) {
                    $(event.target)
                        .closest('tr')
                        .next()
                        .children()
                        .eq(colIndex)
                        .find('input')
                            .focus();
                }
            }
            else
                this.bodySettingsInputChanged(event);
        },

        bodySettingsInputChanged: function(event) {
            var $input = $(event.target);

            var value = parseFloat($input.val());

            var bodyIndex = $input.closest('tr').index();
            var body = this.simulation.bodies[bodyIndex];

            if ($input.hasClass('mass')) {
                this.inputLock(function(){
                    body.set('initMass', value);
                });
            }
            else if ($input.hasClass('pos-x')) {
                this.inputLock(function(){
                    body.set('initX', value);
                });
            }
            else if ($input.hasClass('pos-y')) {
                this.inputLock(function(){
                    body.set('initY', value);
                });
            }
            else if ($input.hasClass('vel-x')) {
                this.inputLock(function(){
                    body.set('initVX', value);
                });
            }
            else if ($input.hasClass('vel-y')) {
                this.inputLock(function(){
                    body.set('initVY', value);
                });
            }
        },

        updateTime: function(simulation, time) {
            this.$time.html(time.toFixed(1));
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

        changeSpeed: function(event) {
            this.simulation.set('speed', parseInt($(event.target).val()));
        },

        updateStartedState: function(simulation, started) {
            if (started)
                this.$('.initial-settings').addClass('disabled');
            else
                this.$('.initial-settings').removeClass('disabled');
        },

        changeSystemCentered: function(event) {
            this.simulation.set('systemCentered', $(event.target).is(':checked'));

            // Needs to be reset with this algorithm for changes to take effect.
            // this.simulation.pause();
            // this.simulation.play();
        },

        changeShowTraces: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showTraces();
            else
                this.sceneView.hideTraces();
        },

        changeShowGrid: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.gridView.show();
            else
                this.sceneView.gridView.hide();
        },

        changeShowTapeMeasure: function(event) {

        },

        changePreset: function(event) {
            var indexString = $(event.target).val();
            if (indexString !== '')
                this.simulation.loadPreset(parseInt(indexString));
        }

    });

    return MSSSimView;
});
