define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * This is a view for any object that is stored in an object
     *   reservoir.  It is meant to draw circular-shaped objects
     *   by default but could be extended to draw other things.
     *   This is the base class for the negative and positive 
     *   charge views as well as the e-field sensor.
     */
    var ReservoirObjectView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                radius: 10,

                fillColor: '#777',
                fillAlpha: 1,
                outlineColor: '#555',
                outlineWidth: 2,
                outlineAlpha: 1,

                interactive: true
            }, options);

            this.mvt = options.mvt;
            this.reservoir = options.reservoir;
            this.interactive = options.interactive;

            this.radius = options.radius;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;
            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineWidth = options.outlineWidth;
            this.outlineAlpha = options.outlineAlpha;

            // Cached objects
            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._position = new Vector2();

            // Initialize graphics
            this.initGraphics();

            // Listen for model events
            this.listenTo(this.model, 'change:position',  this.updatePosition);

            // Optionally bind events
            if (options.interactive) {
                this.delegateEvents({
                    'touchstart      .displayObject': 'dragStart',
                    'mousedown       .displayObject': 'dragStart',
                    'touchmove       .displayObject': 'drag',
                    'mousemove       .displayObject': 'drag',
                    'touchend        .displayObject': 'dragEnd',
                    'mouseup         .displayObject': 'dragEnd',
                    'touchendoutside .displayObject': 'dragEnd',
                    'mouseupoutside  .displayObject': 'dragEnd'
                });
            }
        },

        initGraphics: function() {
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'move';

            this.background = new PIXI.Graphics();
            this.displayObject.addChild(this.background);

            this.initIcon();
            
            this.updateMVT(this.mvt);
        },

        initIcon: function() {
            this.icon = new PIXI.Graphics();
            this.icon.lineStyle(3, 0xFFFFFF, 1);

            this.drawIcon(this.icon, this.radius);

            this.displayObject.addChild(this.icon);
        },

        drawIcon: function(graphics, iconWidth) {},

        drawBackground: function() {
            this.background.clear();
            this.background.lineStyle(this.outlineWidth, this.outlineColor, this.outlineAlpha);
            this.background.beginFill(this.fillColor, this.fillAlpha);
            this.background.drawCircle(0, 0, this.radius);
            this.background.endFill();
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
            this.moveToTop();
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                
                this.setPosition(
                    local.x - this.dragOffset.x, 
                    local.y - this.dragOffset.y
                );

                if (this.reservoir) {
                    var x = this.displayObject.x;
                    var y = this.displayObject.y;

                    // If it's over its home reservoir, highlight the reservoir
                    if (this.reservoir.contains(x, y)) {
                        this.reservoir.showDestroyHighlight();
                        this.displayObject.visible = false;
                    }
                    else {
                        this.reservoir.hideDestroyHighlight();
                        this.displayObject.visible = true;
                    }
                }
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            if (this.reservoir) {
                var x = this.displayObject.x;
                var y = this.displayObject.y;

                // If it's over its home reservoir, destroy it
                if (this.reservoir.contains(x, y))
                    this.reservoir.destroyObject(this.model);
                
                this.reservoir.hideDestroyHighlight();
            }
        },

        moveToTop: function() {
            var parent = this.displayObject.parent;
            parent.setChildIndex(this.displayObject, parent.children.length - 1);
        },

        setPosition: function(x, y) {
            var modelPosition = this.mvt.viewToModel(this._position.set(x, y));
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

    return ReservoirObjectView;
});