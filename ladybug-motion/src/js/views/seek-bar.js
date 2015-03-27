define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

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

            this.listenTo(this.model, 'change:time', this.timeChanged);
            this.listenTo(this.model, 'change:furthestRecordedTime', this.furthestRecordedTimeChanged);
            this.listenTo(this.model, 'change:paused change:recording', this.determineHandleVisibility);
        },

        /**
         * Renders the contents of the view
         */
        render: function() {
            this.$el.html(html);
            this.$progress = this.$('.seek-bar-progress');
            this.$handle   = this.$('.seek-bar-handle');

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

        dragStart: function(event) {
            if (event.currentTarget === this.$('.seek-bar-handle')[0]) {
                event.preventDefault();

                this.dragging = true;

                this.fixTouchEvents(event);

                this.dragX = event.pageX;
                this.dragY = event.pageY;
            }
        },

        drag: function(event) {},

        dragEnd: function(event) {},

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

        determineHandleVisibility: function() {
            if (this.model.get('paused') || !this.model.get('recording'))
                this.$handle.show();
            else
                this.$handle.hide();
        }

    });

    return SeekBarView;
});
