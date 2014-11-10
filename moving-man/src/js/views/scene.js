define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var MovingManView = require('views/moving-man');

    // CSS
    require('less!styles/scene');

    // HTML
    var template = require('text!templates/scene.html');

    /**
     * 
     */
    var SceneView = Backbone.View.extend({

        template: _.template(template),
        tagName: 'div',
        className: 'scene-view',

        events: {
            'click .wall-hide' : 'hideWalls',
            'click .wall-show' : 'showWalls',

            // Just an Easter Egg
            'click .cloud' : 'cloudClicked'
        },

        initialize: function(options) {

            // Default values
            options = _.extend({
                compact: false
            }, options);

            this.compact = options.compact;

            // Save options
            if (options.simulation)
                this.simulation = options.simulation;
            else
                throw 'SceneView requires a simulation model to render.';

            // Bind DOM events
            $(window).bind('resize', $.proxy(this.windowResized, this));

            // Listen to simulation events
            this.listenTo(this.simulation, 'change:wallsEnabled', this.wallsEnabledChanged);
            this.listenTo(this.simulation, 'change:time',         this.timeChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.$el.html(this.template());

            if (this.compact)
                this.$el.addClass('compact');

            this.$walls = this.$('.wall');
            this.$time  = this.$('.clock > .time');

            this.renderMovingManView();

            return this;
        },

        /**
         * Renders html container
         */
        renderMovingManView: function() {
            var $manContainer = this.$('.man-container');
            this.movingManView = new MovingManView({
                simulation: this.simulation,
                dragFrame: $manContainer[0]
            });
            this.movingManView.render();
            $manContainer.html(this.movingManView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.movingManView.postRender();
        },

        /**
         *
         */
        resize: function() {

        },

        /**
         * Called on a window resize to resize the canvas
         */
        windowResized: function(event) {
            this.resizeOnNextUpdate = true;
        },

        /**
         * Responds to resize events and draws everything.
         */
        update: function(time, delta) {
            if (this.resizeOnNextUpdate)
                this.resize();

            this.movingManView.update(time, delta);
        },

        /**
         * Hides the walls and updates the sim
         */
        hideWalls: function() {
            this.simulation.set('wallsEnabled', false);
        },

        /**
         * Hides the walls and updates the sim
         */
        showWalls: function() {
            this.simulation.set('wallsEnabled', true);
        },

        /**
         *
         */
        wallsEnabledChanged: function(model, wallsEnabled, options) {
            if (wallsEnabled)
                this.$walls.removeClass('disabled');
            else
                this.$walls.addClass('disabled');
        },

        /**
         *
         */
        timeChanged: function(model, time, options) {
            this.$time.text(time.toFixed(1));
        },

        /**
         * Just a little Easter Egg to start the cloud animation.
         *   The user has to click each cloud to activate it.
         */
        cloudClicked: function(event) {
            if (!this.cloudsClicked)
                this.cloudsClicked = {};

            this.cloudsClicked[$(event.target).attr('class')] = true;

            if (_.size(this.cloudsClicked) >= 5)
                this.$('.clouds').addClass('moving');
        }
    });

    return SceneView;
});
