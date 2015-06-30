define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');

    /**
     * This is a view for any object that is stored in an object
     *   reservoir.  It is meant to draw circular-shaped objects
     *   by default but could be extended to draw other things.
     *   This is the base class for the negative and positive 
     *   charge views as well as the e-field sensor.
     */
    var ReservoirObjectView = PixiView.extend({

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({
                radius: 10,

                fillColor: '#555',
                fillAlpha: 1,
                outlineColor: '#777',
                outlineWidth: 1,
                outlineAlpha: 1,

                labelText: '',
                labelColor: '#fff',
                labelAlpha: 1
            }, options);

            this.mvt = options.mvt;

            this.radius = options.radius;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;
            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineWidth = options.outlineWidth;
            this.outlineAlpha = options.outlineAlpha;

            this.labelText = options.labelText;
            this.labelColor = Colors.parseHex(options.labelColor);
            this.labelAlpha = options.labelAlpha;

            // Cached objects
            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        initGraphics: function() {
            this.background = new PIXI.Graphics();
            this.background.buttonMode = true;
            this.background.defaultCursor = 'move';
            this.displayObject.addChild(this.background);

            this.initLabel();
            
            this.updateMVT(this.mvt);
        },

        initLabel: function() {
            
        },

        drawBackground: function() {
            this.background.clear();
            this.background.lineStyle(this.outlineWidth, this.outlineColor, this.outlineAlpha);
            this.background.beginFill(this.fillColor, this.fillAlpha);
            this.background.drawCircle(0, 0, this.radius);
            this.background.endFill();
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
            this.moveToTop();
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                
                this.setPosition(
                    local.x - this.dragOffset.x, 
                    local.y - this.dragOffset.y
                );
            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            // TODO: check to see if it's on its home reservoir, and if it is, destroy it
        },

        moveToTop: function() {
            var parent = this.displayObject.parent;
            parent.setChildIndex(this.displayObject, parent.children.length - 1);
        },

        setPosition: function(x, y) {
            var modelPosition = this.mvt.viewToModel(x, y);
            this.model.setPosition(modelPosition);
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBackground();
            this.updatePosition(this.model, this.model.get('position'));
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ReservoirObjectView);


    return ReservoirObjectView;
});