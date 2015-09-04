define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView       = require('common/v3/pixi/view');
                         require('common/v3/pixi/draw-arrow');
    var Colors         = require('common/colors/colors');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var VelocitySensorView = PixiView.extend({

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

        /**
         * Initializes the new VelocitySensorView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.arrowColor = Colors.parseHex('#000');
            this.defaultArrowRotation =  -Math.PI * 1.5
            this.arrowRotationTarget = this.defaultArrowRotation;
            this.rotationSpeed = Math.PI * 6; // Radians per second

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',   this.updatePosition);
            this.listenTo(this.model, 'change:velocity',   this.updateVelocity);
            this.listenTo(this.model, 'change:enabled',    this.enabledChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var panel = Assets.createSprite(Assets.Images.VELOCITY_SENSOR_BODY);
            panel.anchor.x = 1 / 2;
            panel.anchor.y = (94 / 120);
            
            var arrow = new PIXI.Graphics();
            arrow.beginFill(this.arrowColor, 1);
            arrow.drawArrow(
                panel.width *  (6 / 160), 0, 
                panel.width * (20 / 160), 0, 
                panel.width *  (4 / 160), 
                panel.width *  (8 / 160), 
                panel.width *  (6 / 160)
            );
            arrow.endFill();
            arrow.rotation = this.arrowRotationTarget;
            this.arrow = arrow;

            var ring = Assets.createSprite(Assets.Images.VELOCITY_SENSOR_RING);
            ring.anchor.x = 0.5;
            ring.anchor.y = 0.5;

            var readout = new PIXI.Text('', {
                font: '18px Helvetica Neue',
                fill: '#000'
            });
            readout.x = Math.floor(panel.width  *  (47 / 160));
            readout.y = Math.floor(panel.height * (-45 / 120) - readout.height * 0.4);
            readout.anchor.x = 1;
            readout.alpha = 0.7;
            this.readout = readout;

            this.displayObject.addChild(panel);
            this.displayObject.addChild(arrow);
            this.displayObject.addChild(ring);
            this.displayObject.addChild(readout);

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateVelocity: function(model, velocity) {
            if (velocity) {
                this.setArrowRotationTarget(-velocity.angle());
                this.readout.text = (velocity.length() / Constants.SPEED_OF_LIGHT).toFixed(2) + ' c';
            }
            else {
                this.setArrowRotationTarget(this.defaultArrowRotation);
                this.readout.text = '—';
            }
        },

        setArrowRotationTarget: function(angle) {
            if (Math.abs(this.arrowRotationTarget - angle) > Math.PI)
                this.arrowRotationTarget = angle - (2 * Math.PI);
            else
                this.arrowRotationTarget = angle;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition(this.model, this.model.get('position'));
        },

        update: function(time, deltaTime) {
            if (this.arrow.rotation !== this.arrowRotationTarget) {
                var radians = this.rotationSpeed * deltaTime;
                if (Math.abs(this.arrowRotationTarget - this.arrow.rotation) > radians) {
                    var direction = (this.arrow.rotation < this.arrowRotationTarget) ? 1 : -1;
                    this.arrow.rotation += radians * direction;
                }
                else {
                    this.arrow.rotation = this.arrowRotationTarget;
                }
            }
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = event.data.global.y - this.displayObject.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translate(mdx, mdy);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        enabledChanged: function(model, enabled) {
            if (enabled)
                this.show();
            else
                this.hide();
        }

    });


    return VelocitySensorView;
});