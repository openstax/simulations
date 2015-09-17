define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/toolbox.html');
    
    require('less!styles/toolbox');

    /**
     * 
     */
    var ToolboxView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'click .btn' : 'btnClicked'
        },

        /**
         * Options: {
         *   title: string,
         *   tools: {
         *     key: {
         *       title:       string,
         *       label:       string [optional], 
         *       img:         string (url),
         *       activate:    function,
         *       deactivate:  function,
         *       startActive: boolean [optional]
         *     }
         *   }
         * }
         */
        initialize: function(options) {
            this.title = options.title;
            this.tools = options.tools;
            this.simulation = options.simulation;
        },

        reset: function() {
            _.each(this.tools, function(tool, key) {
                if (tool.startActive) {
                    tool.activate();
                    this.$('.btn[name="' + key + '"]').addClass('active');
                }
                else {
                    tool.deactivate();
                    this.$('.btn[name="' + key + '"]').removeClass('active');
                }
            }, this);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                title: this.title,
                tools: this.tools
            };

            this.setElement($(this.template(data)));

            return this;
        },

        btnClicked: function(event) {
            var $btn = $(event.target).closest('button');
            $btn.toggleClass('active');

            if ($btn.is('.active'))
                this.tools[$btn.attr('name')].activate();
            else
                this.tools[$btn.attr('name')].deactivate();
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ToolboxView);
    

    return ToolboxView;
});
