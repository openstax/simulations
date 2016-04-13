define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    // CSS
    require('less!radioactive-dating-game/styles/answer-label');

    // HTML
    var templateHtml = require('text!radioactive-dating-game/templates/answer-label.html');

    /**
     * 
     */
    var AnswerLabelView = Backbone.View.extend({

        className: 'answer-label-view',

        template: _.template(templateHtml),

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.answer = options.answer;
            this.passed = options.passed;
            
            this.render();
            this.setPosition(options.x, options.y);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.$el.html(this.template({
                answer: this.answer,
                passed: this.passed
            }));

            if (this.passed)
                this.$el.addClass('passed');
            else
                this.$el.addClass('failed');

            return this;
        },

        setPosition: function(x, y) {
            this.$el.css({
                left: x + 'px',
                top: y + 'px'
            });
        }

    });

    return AnswerLabelView;
});
