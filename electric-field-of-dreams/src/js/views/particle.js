define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    var ParticleView = PixiView.extend({

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
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.lineWidth = ParticleView.LINE_WIDTH;
            this.lineColor = Colors.parseHex(ParticleView.LINE_COLOR);
            this.fillColor = Colors.parseHex(ParticleView.FILL_COLOR);

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._viewPosition = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        initGraphics: function() {
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'move';

            this.updateMVT(this.mvt);
        },

        draw: function() {
            var radius = this.mvt.modelToViewDeltaX(ParticleView.MODEL_RADIUS);

            this.displayObject.clear();
            this.displayObject.lineStyle(this.lineWidth, this.lineColor, 1);
            this.displayObject.beginFill(this.fillColor, 1);
            this.displayObject.drawCircle(0, 0, radius);
            this.displayObject.endFill();
        },

        dragStart: function(data) {
            if (!this.simulation.get('paused'))
                return;

            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;

            this.model.detach();
        },

        drag: function(data) {
            if (this.dragging) {
                var local = data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                
            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            this.model.attach();
        },

        updatePosition: function(model, position) {
            var viewPos = this.mvt.modelToView(position);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
            this.updatePosition(this.model, this.model.get('position'));
        }

    }, Constants.ParticleView);

    return ParticleView;
});