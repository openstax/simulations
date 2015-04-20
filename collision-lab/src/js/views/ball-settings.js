define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');
    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    require('nouislider');

    var template1DHtml = require('text!templates/ball-settings-1d-item.html');
    var template2DHtml = require('text!templates/ball-settings-2d-item.html');

    /**
     * 
     */
    var BallSettingsView = Backbone.View.extend({

        tagName: 'tr',
        //className: '',
        template1D: _.template(template1DHtml),
        template2D: _.template(template2DHtml),

        events: {
            'keyup .mass' : 'changeMassFromText',
            'slide .mass-slider': 'changeMassFromSlider',

            'change .pos-x' : 'changeX',
            'change .pos-y' : 'changeY',
            'change .vel-x' : 'changeVX',
            'change .vel-y' : 'changeVY'
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false,
                showMoreData: false
            }, options);

            this.oneDimensional = options.oneDimensional;
            this.moreDataMode = options.showMoreData;
            this.simulation = options.simulation;

            this._position = new Vector2();

            this.listenTo(this.model, 'change:mass',     this.massChanged);
            this.listenTo(this.model, 'change:position', this.positionChanged);
            this.listenTo(this.model, 'change:velocity', this.velocityChanged);
            this.listenTo(this.model, 'change:momentumX', this.momentumXChanged);
            this.listenTo(this.model, 'change:momentumY', this.momentumYChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = this.model.toJSON();
            _.extend(data, Constants.Ball);

            if (this.oneDimensional)
                this.$el.html(this.template1D(data));
            else
                this.$el.html(this.template2D(data));

            this.$more = this.$('.more');
            this.$less = this.$('.less');

            this.$('.mass-slider').noUiSlider({
                start: this.model.get('mass'),
                connect: 'lower',
                range: {
                    'min': Constants.Ball.MIN_MASS,
                    'max': Constants.Ball.MAX_MASS
                }
            });

            if (this.moreDataMode)
                this.showMoreData();
            else
                this.showLessData();

            return this;
        },

        massChanged: function(ball, mass) {
            this.updateLock(function() {
                if (this.moreDataMode)
                    this.$('.mass').val(mass.toFixed(2));
                else
                    this.$('.mass').val(mass.toFixed(1));
                this.$('.mass-slider').val(mass);
            });
        },

        changeMassFromText: function(event) {
            var mass = parseFloat($(event.target).val());
            if (!isNaN(mass)) {
                this.inputLock(function() {
                    this.model.set('mass', mass);
                    this.simulation.separateAllBalls();
                    this.simulation.updateCalculatedVariables();
                });
                this.$('.mass-slider').val(mass);
            }
        },

        changeMassFromSlider: function(event) {
            var mass = parseFloat($(event.target).val());
            if (!isNaN(mass)) {
                this.inputLock(function() {
                    this.model.set('mass', mass);
                    this.simulation.separateAllBalls();
                    this.simulation.updateCalculatedVariables();
                });
                this.$('.mass').val(mass.toFixed(1));
            }
        },

        positionChanged: function(ball, position) {
            this.updateLock(function() {
                this.$('.pos-x').val(position.x.toFixed(2));
                if (!this.oneDimensional)
                    this.$('.pos-y').val(position.y.toFixed(2));
            });
        },

        changeX: function(event) {
            var x = parseFloat($(event.target).val());
            if (!isNaN(x)) {
                var position = this._position;
                position.x = x;
                position.y = this.model.get('position').y;

                this.simulation.keepWithinBounds(this.model, position);

                this.inputLock(function() {
                    if (!this.simulation.hasStarted())
                        this.model.setInitX(position.x);
                    this.model.setX(position.x);
                    this.simulation.separateAllBalls();

                    // Update the text box with the correct position if it is different
                    this.$('.pos-x').val(this.model.get('position').x.toFixed(2));
                    if (!this.oneDimensional)
                        this.$('.pos-y').val(this.model.get('position').y.toFixed(2));
                });
            }
        },

        changeY: function(event) {
            var y = parseFloat($(event.target).val());
            if (!isNaN(y)) {
                var position = this._position;
                position.x = this.model.get('position').x;
                position.y = y;

                this.simulation.keepWithinBounds(this.model, position);

                this.inputLock(function() {
                    if (!this.simulation.hasStarted())
                        this.model.setInitY(position.y);
                    this.model.setY(position.y);
                    this.simulation.separateAllBalls();

                    // Update the text box with the correct position if it is different
                    this.$('.pos-x').val(this.model.get('position').x.toFixed(2));
                    if (!this.oneDimensional)
                        this.$('.pos-y').val(this.model.get('position').y.toFixed(2));
                });
            }
        },

        velocityChanged: function(ball, velocity) {
            this.updateLock(function() {
                this.$('.vel-x').val(velocity.x.toFixed(2));
                if (!this.oneDimensional)
                    this.$('.vel-y').val(velocity.y.toFixed(2));
            });
        },

        changeVX: function(event) {
            var vx = parseFloat($(event.target).val());
            if (!isNaN(vx)) {
                this.inputLock(function() {
                    if (!this.simulation.hasStarted())
                        this.model.setInitVX(vx);
                    this.model.setVelocityX(vx);
                    this.simulation.updateCalculatedVariables();
                });
            }
        },

        changeVY: function(event) {
            var vy = parseFloat($(event.target).val());
            if (!isNaN(vy)) {
                this.inputLock(function() {
                    if (!this.simulation.hasStarted())
                        this.model.setInitVY(vy);
                    this.model.setVelocityY(vy);
                    this.simulation.updateCalculatedVariables();
                });
            }
        },

        momentumXChanged: function(ball, momentumX) {
            this.$('.mom-x').text(momentumX.toFixed(2));
        },

        momentumYChanged: function(ball, momentumY) {
            this.$('.mom-y').text(momentumY.toFixed(2));
        },

        showMoreData: function() {
            this.$less.hide();
            this.$more.show();
            this.moreDataMode = true;
            this.massChanged(this.model, this.model.get('mass'));
        },

        showLessData: function() {
            this.$more.hide();
            this.$less.show();
            this.moreDataMode = false;
            this.massChanged(this.model, this.model.get('mass'));
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BallSettingsView);

    return BallSettingsView;
});
