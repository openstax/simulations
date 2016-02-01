define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('../pixi/view');
    var Colors   = require('common/colors/colors');
    var Rectangle = require('common/math/rectangle');

    var HelpLabelView = PixiView.extend({

        initialize: function(options){
            options = _.extend({
                position: {
                    x: 0,
                    y: 0
                },
                width: 'inherit',
                color: '#000',
                font: 'bold 11pt Helvetica Neue',
                style: 'default',
                orientation : 'bottom left',
                anchor: {
                    x: 0,
                    y: 0
                },
                attachTo : false,
                title : '',
                content : ''
            }, options);

            this.position = options.position;
            this.attachTarget = options.attachTo.displayObject || options.attachTo;
            this.width = options.width;

            this.labelModel = {};

            this.labelModel.color = options.color;
            this.labelModel.font = options.font;
            this.labelModel.style = options.style;
            this.labelModel.orientation = options.orientation; // not fully implemented
            this.labelModel.anchor = options.anchor;
            this.labelModel.title = options.title;
            this.labelModel.content = options.content; // not fully implemented
        },

        render: function(){
            this.renderHelpLabel();
            // this.update();
            this.hide();
        },

        renderHelpLabel: function() {
            var style = {
                font: this.labelModel.font,
                fill: this.labelModel.color
            };

            if (_.isObject(this.labelModel.style))
                style = _.extend(style, this.labelModel.style);

            this.labelText = new PIXI.Text(this.labelModel.title, style);
            this.labelText.anchor.x = this.labelModel.anchor.x;
            this.labelText.anchor.y = this.labelModel.anchor.y;
            this.labelText.resolution = this.getResolution();

            this.displayObject.addChild(this.labelText);
            this.resize();
        },

        attachTo: function(target) {
            if (target)
                this.attachTarget = target.displayObject || target;
            else
                this.attachTarget = target;
            
            if (this.showing && this.attachTarget)
                this._attach();
        },

        _attach: function() {
            this.attachTarget.addChildAt(this.displayObject, 0);
            this.resize();
        },

        show: function(){
            if (this.attachTarget)
                this._attach();
            this.showing = true;
        },

        hide: function() {
            if (this.displayObject.parent && this.displayObject.parent.children.indexOf(this.displayObject) !== -1)
                this.displayObject.parent.removeChild(this.displayObject);
            this.showing = false;
        },

        toggle: function(){
            if (this.showing)
                this.hide();
            else
                this.show();
        },

        resize: function(){
            this.displayObject.y = (this.position.y !== undefined) ? this.position.y : this.attachTarget.height;
            this.displayObject.y = Math.round(this.displayObject.y);

            if (this.position.x){
                this.displayObject.x = this.position.x;
                this.displayObject.x = Math.round(this.displayObject.x);
            }
        }

    });

    return HelpLabelView; 
});