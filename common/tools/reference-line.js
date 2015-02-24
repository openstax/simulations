
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');


    /**
     * A view that represents a movable target model
     */
    var Body = PixiView.extend({

        events: {
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',
        },

        initialize: function(options) {
            options = _.extend({
                position: {
                    x: 30,
                    y: 30
                },
                width : 400,
                thickness : 2,
                buffer : 15,
                color : '#333',
                opacity : 0.75,
                dashWidth : 10,
                yOnly : true
            }, options);

            this.position = options.position;
            this.yOnly = options.yOnly;

            this.width = options.width;
            this.thickness = options.thickness;
            this.color = options.color;
            this.opacity = options.opacity;
            this.buffer = options.buffer;
            this.dashWidth = options.dashWidth;

            this.initGraphics();
        },

        render: function(){
            this.drawLine();
        },

        postRender: function(){
            this.updatePosition();
        },

        initGraphics: function() {
            this.body = new PIXI.Graphics();
            this.displayObject.addChild(this.body);
            this.body.clear();
            this.body.buttonMode = true;
            this.body.defaultCursor = this.yOnly? 'ns-resize': 'move';
        },

        drawLine: function(){
            this.drawDraggableZone();
            this.drawDashedLine();
        },

        drawDraggableZone: function(){
            this.body.beginFill(Colors.parseHex(this.color), 0);
            this.body.drawRect(0, -1 * (this.buffer + this.thickness/2), this.width, 2 * this.buffer + this.thickness);
            this.body.endFill();
        },

        drawDashedLine: function(){

            var lineTo = 0;
            this.body.lineStyle(this.thickness, Colors.parseHex(this.color), this.opacity);

            while(lineTo + this.dashWidth < this.width){
                this.body.moveTo(lineTo, 0);
                this.body.lineTo(lineTo + this.dashWidth, 0);

                lineTo += 2 * this.dashWidth;
            }
        },

        dragStart: function(data){
            this.dragOffset = data.getLocalPosition(this.displayObject);
            this.grabbed = true;
        },

        dragEnd: function(data){
            this.grabbed = false;
        },

        drag: function(data){

            if(this.grabbed){
                var dx = data.global.x - this.dragOffset.x;
                var dy = data.global.y - this.dragOffset.y;

                if(!this.yOnly){
                    this.position.x = dx;                    
                }
                this.position.y = dy;
                this.updateOnNextFrame = true;
            }
        },

        updatePosition: function(){
            this.displayObject.x = this.position.x;
            this.displayObject.y = this.position.y;
        },

        update: function(time, delta, paused, timeScale) {

            // If there aren't any changes, don't do anything.
            if (!this.updateOnNextFrame)
                return;

            this.updateOnNextFrame = false;
            this.updatePosition();
        }

    });

    return Body;
});



// define(function (require) {

//     'use strict';

//     var _ = require('underscore');

//     var selectText = require('../dom/select-text');
//     var Draggable = require('./draggable');

//     var html  = require('text!./reference-line.html');

//     require('less!./reference-line');

//     var dx,
//         dy,
//         translate;

//     var ReferenceLineView = Draggable.extend({

//         template: _.template(html),

//         tagName: 'div',
//         className: 'reference-line-view',

//         events: {
//             'mousedown' : 'panelDown',
//             'touchstart': 'panelDown'
//         },

//         initialize: function(options) {
//             options = _.extend({
//                 position: {
//                     x: 30,
//                     y: 30
//                 },
//                 captureOnBody: false,
//                 mouseLeaveCancels: true,
//                 width: 400
//             }, options);

//             Draggable.prototype.initialize.apply(this, [options]);

//             this.position = options.position;
//             this.width = options.width;
//         },

//         render: function() {
//             this.renderReferenceLine();
//             this.bindDragEvents();
//             this.resize();
//             this.update();
//         },

//         renderReferenceLine: function() {
//             this.$el.html(this.template());
//             this.$el.css({width: this.width + 'px'});
//         },

//         panelDown: function(event) {
//             if (event.target === this.el) {
//                 event.preventDefault();

//                 this.$el.addClass('dragging');

//                 this.dragging = true;

//                 this.fixTouchEvents(event);

//                 this.dragX = event.pageX;
//                 this.dragY = event.pageY;
//             }
//         },

//         drag: function(event) {
//             if (this.dragging) {

//                 this.fixTouchEvents(event);

//                 // Pinning dragging to vertical only
//                 // dx = event.pageX - this.dragX;
//                 dx = 0;
//                 dy = event.pageY - this.dragY;

//                 if (!this.boxOutOfBounds(this.position.x + dx, this.position.y + dy)) {

//                     this.position.x += dx;
//                     this.position.y += dy;
//                 }

//                 // Pinning dragging to vertical only
//                 // this.dragX = event.pageX;
//                 this.dragX = 0;
//                 this.dragY = event.pageY;

//                 this.updateOnNextFrame = true;
//             }
//         },

//         dragEnd: function(event) {
//             if (this.dragging) {
//                 this.dragging = false;
//                 this.$el.removeClass('dragging');
//             }
//         },

//         update: function(time, delta, paused, timeScale) {

//             // If there aren't any changes, don't do anything.
//             if (!this.updateOnNextFrame)
//                 return;

//             this.updateOnNextFrame = false;

//             translate = 'translateX(' + this.position.x + 'px) translateY(' + this.position.y + 'px)';

//             this.$el.css({
//                 '-webkit-transform': translate,
//                 '-ms-transform': translate,
//                 '-o-transform': translate,
//                 'transform': translate,
//             });
//         }
//     });

//     return ReferenceLineView;
// });
