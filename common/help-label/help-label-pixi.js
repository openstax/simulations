define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var HelpLabelView = PixiView.extend({

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
            this.attachTo = options.attachTo.displayObject || options.attachTo;
            this.width = options.width;

            this.labelModel = {};

            this.labelModel.style = options.style;
            this.labelModel.orientation = options.orientation;
            this.labelModel.title = options.title;
            this.labelModel.content = options.content;
        },

        render: function(){
            this.renderHelpLabel();
            // this.update();
            this.hide();
        },

        renderHelpLabel: function(){
            // this.$el.html(this.template(this.labelModel));
            this.labelText = new PIXI.Text(this.labelModel.title, {
                font : '12pt Arial'
            });
            this.displayObject.addChild(this.labelText);
            this.resize();

        },

        show: function(){
            this.attachTo.addChildAt(this.displayObject, 0);
            this.showing = true;
        },

        hide: function(){
            this.attachTo.removeChild(this.displayObject);
            this.showing = false;
        },

        toggle: function(){
            if(this.showing){
                this.hide();
            }else{
                this.show();
            }
        },

        resize: function(){
            this.displayObject.y = (this.position.y)? this.position.y : this.attachTo.height;

            if(this.position.x){
                this.displayObject.x = this.position.x;
            }
        }

    });

    return HelpLabelView; 
});