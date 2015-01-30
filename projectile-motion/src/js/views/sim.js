define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var MeasuringTapeView = require('common/tools/measuring-tape');
    var SimView           = require('common/app/sim');
    var Vector2           = require('common/math/vector2');

    var ProjectileMotionSimulation = require('models/simulation');
    var ProjectileMotionSceneView  = require('views/scene');

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

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var ProjectileMotionSimView = SimView.extend({

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
            'click .sound-btn':    'changeVolume',
            'click .btn-zoom-in':  'zoomIn',
            'click .btn-zoom-out': 'zoomOut',
            'change #projectile':  'changeProjectile',
            'change #angle':       'changeAngle',
            'keyup  #angle':       'changeAngle',
            'change #speed':       'changeSpeed',
            'keyup  #speed':       'changeSpeed',
            'change #diameter':    'changeDiameter',
            'keyup  #diameter':    'changeDiameter',
            'change #drag':        'changeDrag',
            'keyup  #drag':        'changeDrag',
            'change #altitude':    'changeAltitude',
            'keyup  #altitude':    'changeAltitude',
            'change #air-resistance-check': 'toggleAirResistance',
            'click .btn-fire':  'fireCannon',
            'click .btn-erase': 'erase'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Projectile Motion',
                name: 'projectile-motion',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initMeasuringTapeView();

            this.listenTo(this.simulation.cannon, 'change:angle', this.angleChanged);
            this.listenTo(this.simulation, 'change:currentTrajectory', this.trajectoryChanged);
            this.listenTo(this.simulation.target, 'collide', this.targetHit);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ProjectileMotionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ProjectileMotionSceneView({
                simulation: this.simulation
            });
        },

        initMeasuringTapeView: function() {
            this.measuringTapeView = new MeasuringTapeView({
                dragFrame: this.el,
                viewToModelDeltaX: _.bind(function(dx){
                    return this.sceneView.mvt.viewToModelDeltaX(dx);
                }, this),
                viewToModelDeltaY: _.bind(function(dy){
                    return this.sceneView.mvt.viewToModelDeltaY(dy);
                }, this),
                units: 'm'
            });
            this.listenTo(this.sceneView, 'change:mvt', function() {
                this.measuringTapeView.updateOnNextFrame = true;
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderMeasuringTape();

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

        renderMeasuringTape: function() {
            this.measuringTapeView.render();
            this.$el.append(this.measuringTapeView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();

            this.measuringTapeView.postRender();
            this.measuringTapeView.setStart(this.sceneView.width * 0.6, this.sceneView.height * 0.92);
            this.measuringTapeView.setEnd(  this.sceneView.width * 0.9, this.sceneView.height * 0.92);
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
            this.measuringTapeView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
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
                //this.sceneView.movingManView.lowVolume();
            }
            else if ($btn.hasClass('sound-btn-low')) {
                this.$('.sound-btn-high').show();
                //this.sceneView.movingManView.highVolume();
            }
            else if ($btn.hasClass('sound-btn-high')) {
                this.$('.sound-btn-mute').show();
                //this.sceneView.movingManView.muteVolume();
            }
        },

        toggleAirResistance: function(event) {
            if ($(event.target).is(':checked')) {
                this.$('.air-resistance-parameters').show();
                this.simulation.set('airResistanceEnabled', true);
            }
            else {
                this.$('.air-resistance-parameters').hide();
                this.simulation.set('airResistanceEnabled', false);
            }
        },

        zoomIn: function() {
            this.sceneView.zoomIn();
        },

        zoomOut: function() {
            this.sceneView.zoomOut();
        },

        changeAngle: function(event) {
            var angle = parseFloat($(event.target).val())
            if (angle < Constants.Cannon.MIN_ANGLE) {
                angle = Constants.Cannon.MIN_ANGLE;
                $(event.target).val(angle.toFixed(0));
            }
            else if (angle > Constants.Cannon.MAX_ANGLE) {
                angle = Constants.Cannon.MAX_ANGLE;
                $(event.target).val(angle.toFixed(0));
            }

            if (!isNaN(angle)) {
                this.inputLock(function(){
                    this.simulation.cannon.set('angle', angle);
                });
            }
        },

        angleChanged: function(model, angle) {
            this.updateLock(function(){
                this.$('#angle').val(parseInt(angle));
            });
        },

        changeSpeed: function(event) {
            this.simulation.set('initialSpeed', parseFloat(this.$('#speed').val()));
        },

        changeProjectile: function(event) {
            var index = parseInt($(event.target).val());

            // Get an instance of the projectile to give the input boxes some default values
            var projectile = new Constants.Projectiles[index];
            this.$('#mass').val(projectile.get('mass'));
            this.$('#diameter').val(projectile.get('diameter'));
            this.$('#drag').val(projectile.get('dragCoefficient'));

            // Set the selected projectile on the simulation
            this.simulation.set('currentProjectile', projectile);
        },

        changeMass: function(event) {
            var projectile = this.simulation.get('currentProjectile');
            if (projectile)
                projectile.set('mass', parseFloat(this.$('#mass').val()));
        },

        changeDiameter: function(event) {
            var projectile = this.simulation.get('currentProjectile');
            if (projectile)
                projectile.set('diameter', parseFloat(this.$('#diameter').val()));
        },

        changeDrag: function(event) {
            var projectile = this.simulation.get('currentProjectile');
            if (projectile)
                projectile.set('dragCoefficient', parseFloat(this.$('#drag').val()));
        },

        changeAltitude: function(event) {
            this.simulation.set('altitude', parseFloat(this.$('#altitude').val()));
        },

        fireCannon: function() {
            this.simulation.fireCannon();
        },

        erase: function() {
            this.sceneView.clearShots();
            this.simulation.target.reset();
            this.simulation.david.reset();
            if (this.simulation.get('currentTrajectory'))
                this.simulation.get('currentTrajectory').abort();
            this.$el.removeClass('score');
        },

        trajectoryChanged: function(simulation, trajectory) {
            if (this.trajectory)
                this.stopListening(this.trajectory);

            if (trajectory) {
                var lastTime = 0;
                var printStats = _.bind(function(time) {
                    this.$('#range').val(trajectory.x.toFixed(1));
                    this.$('#height').val((trajectory.y - trajectory.get('initialY')).toFixed(1));
                    this.$('#time').val(time.toFixed(1));
                }, this);

                this.listenTo(trajectory, 'change:time', function(model, time) {
                    if (Math.floor(lastTime) !== Math.floor(time))
                        printStats(time);
                    lastTime = time;
                });
                this.listenTo(trajectory, 'finish', function() {
                    printStats(trajectory.get('time'));
                });

                printStats(0);
            }

            this.trajectory = trajectory;
        },

        targetHit: function() {
            this.$el.addClass('score');
        }

    });

    return ProjectileMotionSimView;
});
