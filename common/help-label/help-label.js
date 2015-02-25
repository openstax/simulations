define(function(require) {

	'use strict';

	var _ = require('underscore');

	var html  = require('text!./help-label.html');

	require('less!./help-label');

	var HelpLabelView = Backbone.View.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'help-label-view',

		initialize: function(options){
			options = _.extend({
				position: {
					x: 0,
					y: 0
				},
				width: 'inherit',
				style : 'default',
				orientation : 'bottom left',
				attachTo : false,
				title : '',
				content : ''
			}, options);

			this.position = options.position;
			this.attachTo = options.attachTo;
			this.width = options.width;

			this.labelModel = {};

			this.labelModel.style = options.style;
			this.labelModel.orientation = options.orientation;
			this.labelModel.title = options.title;
			this.labelModel.content = options.content;
		},

		render: function(){
			this.renderHelpLabel();
			this.hide();
		},

		renderHelpLabel: function(){
			this.$el.html(this.template(this.labelModel));
			// this.resize();
			this.attachTo.$el.append(this.el);
		},

        show: function(){
            this.$el.show();
            this.showing = true;
        },

        hide: function(){
            this.$el.hide();
            this.showing = false;
        },

        toggle: function(){
        	if(this.showing){
        		this.hide();
        	}else{
        		this.show();
        	}
        }
	});

	return HelpLabelView; 
});