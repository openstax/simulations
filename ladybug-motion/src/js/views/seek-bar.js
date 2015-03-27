define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');

    require('less!styles/seek-bar');

    var html = require('text!templates/seek-bar.html');

    /**
     * 
     */
    var SeekBarView = Backbone.View.extend({

        className: 'seek-bar-view',

        events: {
            'mousedown  .seek-bar-handle' : 'dragStart',
            'touchstart .seek-bar-handle' : 'dragStart'
        },

        initialize: function(options) {
            $('body')
                .bind('mousemove touchmove', _.bind(this.drag,    this))
                .bind('mouseup touchend',    _.bind(this.dragEnd, this));

            this.listenTo(this.model, 'change:time',                 this.timeChanged);
            this.listenTo(this.model, 'change:furthestRecordedTime', this.furthestRecordedTimeChanged);
            this.listenTo(this.model, 'change:paused',               this.pausedChanged);
            this.listenTo(this.model, 'change:recording',            this.recordingChanged);
        },

        /**
         * Renders the contents of the view
         */
        render: function() {
            this.$el.html(html);
            this.$progress = this.$('.seek-bar-progress');
            this.$handle   = this.$('.seek-bar-handle');
            this.$overwritten = this.$('.seek-bar-overwritten');

            this.determineHandleVisibility();

            return this;
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.resize();
        },

        resize: function() {
            this.barOffset = this.$el.offset();
            this.barWidth = this.$el.width();
            this.handleWidth = this.$handle.width();
        },

        dragStart: function(event) {
            if (event.currentTarget === this.$('.seek-bar-handle')[0]) {
                event.preventDefault();
                this.fixTouchEvents(event);

                this.draggingOffsetX = event.pageX - this.$handle.offset().left - this.handleWidth / 2;

                this.dragging = true;
            }
        },

        drag: function(event) {
            if (this.dragging) {
                this.fixTouchEvents(event);

                // The x location of the handle relative to the seek bar
                var x = event.pageX - this.barOffset.left - this.draggingOffsetX;

                // Keep it within bounds
                var progressWidth = this.$progress.width();
                x = Math.max(0, Math.min(progressWidth, x));

                this.inputLock(function() {
                    var percent = x / this.barWidth;
                    this.model.setTime(percent * this.model.get('maxRecordingTime'));
                });

                var percent = x / progressWidth;
                this.$handle.css('left', (percent * 100) + '%');

                var overwrittenWidth = progressWidth - x;
                this.$overwritten.width(overwrittenWidth);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        fixTouchEvents: function(event) {
            if (event.pageX === undefined) {
                event.pageX = event.originalEvent.touches[0].pageX;
                event.pageY = event.originalEvent.touches[0].pageY;
            }
        },

        timeChanged: function(simulation, time) {
            var percent = Math.min(1, (time / simulation.get('furthestRecordedTime')));
            this.$handle.css('left', (percent * 100) + '%');
        },

        furthestRecordedTimeChanged: function(simulation, furthestRecordedTime) {
            var percent = Math.min(1, (furthestRecordedTime / simulation.get('maxRecordingTime')));
            this.$progress.css('width', (percent * 100) + '%');
        },

        pausedChanged: function(simulation, paused) {
            if (!paused)
                this.$overwritten.width(0).hide();
            else
                this.setInitialOverwrittenWidth();

            this.determineHandleVisibility();
            this.determineOverwrittenVisibility();
        },

        recordingChanged: function(simulation, recording) {
            this.determineHandleVisibility();
            this.determineOverwrittenVisibility();
        },

        determineHandleVisibility: function() {
            if (this.model.get('paused') || !this.model.get('recording'))
                this.$handle.show();
            else
                this.$handle.hide();
        },

        determineOverwrittenVisibility: function() {
            if (this.model.get('paused') && this.model.get('recording'))
                this.$overwritten.show();
            else
                this.$overwritten.hide();
        },

        setInitialOverwrittenWidth: function() {
            if (this.model.get('time') < this.model.get('furthestRecordedTime')) {
                var percent = 1 - (this.model.get('time')  / this.model.get('furthestRecordedTime'));
                this.$overwritten.css('width', (percent * 100) + '%');
            }
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(SeekBarView);

    return SeekBarView;
});
