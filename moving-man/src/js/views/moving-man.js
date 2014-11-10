define(function (require, exports, module) {

    'use strict';

    // var $ = require('jquery');
    var _    = require('underscore');
    var buzz = require('buzz');

    var SimDraggable = require('views/sim-draggable');

    var html = require('text!templates/moving-man.html');

    require('less!styles/moving-man');

    /**
     * Constants
     */
    var MOVEMENT_STATE_IDLE  = 0;
    var MOVEMENT_STATE_LEFT  = 1;
    var MOVEMENT_STATE_RIGHT = 2;

    // These are from PhET and seem fairly arbitrary...
    var VELOCITY_SCALE     = 0.2;
    var ACCELERATION_SCALE = 0.8;

    var ARROW_HEAD_WIDTH = 15;

    /**
     *
     */
    var MovingManView = SimDraggable.extend({

        template: _.template(html),

        tagName: 'div',
        className: 'moving-man-view',

        events: {
            'mousedown'  : 'down',
            'touchstart' : 'down'
        },

        initialize: function(options) {
            SimDraggable.prototype.initialize.apply(this, [options]);

            this.simulation = options.simulation;
            this.movingMan  = this.simulation.movingMan;

            this.velocityVectorEnabled = false;
            this.velocityVectorVisible = false;

            this.accelerationVectorEnabled = false;
            this.accelerationVectorVisible = false;    

            this.crashSound = new buzz.sound('audio/phet/crash', {
                formats: ['ogg', 'mp3', 'wav']
            });

            this.listenTo(this.movingMan, 'collide', function(){
                this.crashSound.play();
            });
        },

        render: function() {
            this.renderMovingMan();
            this.bindDragEvents();
            this.resize();
            this.update(0, 0);
        },

        renderMovingMan: function() {
            this.$el.html(this.template());

            this.$velocityVector     = this.$('.arrow.velocity');
            this.$accelerationVector = this.$('.arrow.acceleration');
        },

        resize: function() {
            SimDraggable.prototype.resize.apply(this);

            this.pixelRatio = this.dragBounds.width / this.simulation.get('containerWidth');
        },

        down: function(event) {
            event.preventDefault();

            this.dragging = true;
            this.$el.addClass('dragging');

            // Start recording on drag if the simulation records and isn't currently
            if (!this.simulation.noRecording && !this.simulation.get('recording'))
                this.simulation.record();
            if (this.simulation.get('paused'))
                this.simulation.play();

            this.fixTouchEvents(event);

            this.dragX = event.pageX;
        },

        drag: function(event) {
            if (this.dragging) {

                this.fixTouchEvents(event);

                // Get position
                this._xPercent = (event.pageX - this.dragOffset.left) / this.dragBounds.width;
                this._xPosition = (this._xPercent * this.simulation.get('containerWidth')) - this.simulation.get('halfContainerWidth');

                this.movingMan.setMousePosition(this._xPosition);
                this.movingMan.positionDriven(true);

                // Get direction
                if ((event.pageX - this.dragX) > 0)
                    this.movementState = MOVEMENT_STATE_RIGHT;
                else if ((event.pageX - this.dragX) < 0)
                    this.movementState = MOVEMENT_STATE_LEFT;
                this.dragX = event.pageX;
            }
        },

        dragEnd: function(event) {
            if (this.dragging) {
                this.dragging = false;
                this.$el.removeClass('dragging');

                this.movementState = MOVEMENT_STATE_IDLE;
            }
        },

        update: function(time, delta) {
            this._lastPosition = this._position;
            this._position = this.movingMan.get('position');

            this._lastVelocity = this._velocity;
            this._velocity = this.movingMan.get('velocity');

            this._lastAcceleration = this._acceleration;
            this._acceleration = this.movingMan.get('acceleration');

            if (!this.updateOnNextFrame && 
                this._position === this._lastPosition && 
                this._velocity === this._lastVelocity &&
                this._acceleration === this._lastAcceleration)
                return;

            if (this.updateOnNextFrame)
                this.updateOnNextFrame = false;

            // Update position
            this._xPercent  = (this._position + this.simulation.get('halfContainerWidth')) / this.simulation.get('containerWidth');
            this._xPixels   = this._xPercent * this.dragBounds.width;
            this._translate = 'translateX(' + this._xPixels + 'px)';

            this.$el.css({
                '-webkit-transform': this._translate,
                '-ms-transform':     this._translate,
                '-o-transform':      this._translate,
                'transform':         this._translate,
            });

            if (this.movingMan.get('velocity') > 0.1)
                this.movementState = MOVEMENT_STATE_RIGHT;
            else if (this.movingMan.get('velocity') < -0.1)
                this.movementState = MOVEMENT_STATE_LEFT;
            else
                this.movementState = MOVEMENT_STATE_IDLE;

            // Update direction
            if (this.visibleMovementState !== this.movementState) {
                this.visibleMovementState = this.movementState;

                switch (this.movementState) {
                    case MOVEMENT_STATE_IDLE:
                        this.$el
                            .removeClass('left')
                            .removeClass('right');
                        break;
                    case MOVEMENT_STATE_RIGHT:
                        this.$el
                            .removeClass('left')
                            .addClass('right');
                        break;
                    case MOVEMENT_STATE_LEFT:
                        this.$el
                            .removeClass('right')
                            .addClass('left');
                        break;
                }
            }

            // Update arrow visiblity
            if (this.velocityVectorEnabled !== this.velocityVectorVisible) {
                if (this.velocityVectorEnabled) {
                    this.$velocityVector.show();
                    this.velocityVectorVisible = true;
                }
                else {
                    this.$velocityVector.hide();
                    this.velocityVectorVisible = false;
                }
            }

            if (this.accelerationVectorEnabled !== this.accelerationVectorVisible) {
                if (this.accelerationVectorEnabled) {
                    this.$accelerationVector.show();
                    this.accelerationVectorVisible = true;
                }
                else {
                    this.$accelerationVector.hide();
                    this.accelerationVectorVisible = false;
                }
            }

            // Update arrow lengths and directions
            var vectorWidth;

            if (this.velocityVectorVisible) {
                vectorWidth = Math.abs(this._velocity * VELOCITY_SCALE) * this.pixelRatio;
                this.$velocityVector.width(vectorWidth);

                if (this._velocity > 0) {
                    this.$velocityVector
                        .removeClass('left')
                        .addClass('right');
                }
                else {
                    this.$velocityVector
                        .removeClass('right')
                        .addClass('left');
                }
            }

            if (this.accelerationVectorVisible) {
                vectorWidth = Math.abs(this._acceleration * ACCELERATION_SCALE) * this.pixelRatio;
                this.$accelerationVector.width(vectorWidth);

                if (this._acceleration > 0) {
                    this.$accelerationVector
                        .removeClass('left')
                        .addClass('right');
                }
                else {
                    this.$accelerationVector
                        .removeClass('right')
                        .addClass('left');
                }
            }
        },

        showVelocityVector: function() {
            this.velocityVectorEnabled = true;
            this.updateOnNextFrame = true;
        },

        hideVelocityVector: function() {
            this.velocityVectorEnabled = false;
            this.updateOnNextFrame = true;
        },

        showAccelerationVector: function() {
            this.accelerationVectorEnabled = true;
            this.updateOnNextFrame = true;
        },

        hideAccelerationVector: function() {
            this.accelerationVectorEnabled = false;
            this.updateOnNextFrame = true;
        },

        muteVolume: function() {
            this.crashSound.setVolume(0);
        },

        lowVolume: function() {
            this.crashSound.setVolume(20);
        },

        highVolume: function() {
            this.crashSound.setVolume(80);
        }

    });

    return MovingManView;
});
