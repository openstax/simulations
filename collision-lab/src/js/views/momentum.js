define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView           = require('common/pixi/view');
    var DraggableArrowView = require('common/pixi/view/arrow-draggable');
    var Colors             = require('common/colors/colors');

    var Constants = require('constants');

    var MomentumView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                label: '',
                color: MomentumView.ARROW_COLOR
            }, options);

            this.mvt = options.mvt;
            this.label = options.label;
            this.color = options.color;

            this.arrowViewModel = new DraggableArrowView.ArrowViewModel({
                originX: 0,
                originY: 0
            });

            this.initGraphics();

            this.listenTo(this.model, 'change:momentumX change:momentumY', this.updateMomentum);
        },

        initGraphics: function() {
            this.initArrow();
            this.initLabel();

            this.updateMVT(this.mvt);
            this.moveTo(0, 0);
        },

        initArrow: function() {
            this.arrowView = new DraggableArrowView({ 
                model: this.arrowViewModel,

                headDraggingEnabled: false,

                tailWidth:  MomentumView.ARROW_TAIL_WIDTH,
                headWidth:  MomentumView.ARROW_HEAD_WIDTH,
                headLength: MomentumView.ARROW_HEAD_LENGTH,

                fillColor: this.color,
                fillAlpha: MomentumView.ARROW_ALPHA
            });
            this.displayObject.addChild(this.arrowView.displayObject);
        },

        initLabel: function() {
            this.label = new PIXI.Text(this.label, {
                font: MomentumView.LABEL_FONT,
                fill: MomentumView.LABEL_COLOR
            });
            this.label.anchor.x = 0.5;
            this.label.anchor.y = 0;

            this.arrowView.displayObject.addChild(this.label);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
            this.updateMomentum();
        },

        updateMomentum: function() {
            var xLength = this.mvt.modelToViewDeltaX(this.model.get('momentumX'));
            var yLength = this.mvt.modelToViewDeltaY(this.model.get('momentumY'))
            this.arrowViewModel.set('targetX', this.arrowViewModel.get('originX') + xLength);
            this.arrowViewModel.set('targetY', this.arrowViewModel.get('originY') + yLength);
            var rotation = this.arrowView.getRotation();
            if (rotation > Math.PI / 2 && rotation < Math.PI * 1.5)
                rotation += Math.PI;
            this.label.rotation = rotation;
            this.label.x = xLength / 2;
            this.label.y = yLength / 2;
        },

        enableArrowMovement: function() {
            this.arrowView.enableBodyDragging();
        },

        disableArrowMovement: function() {
            this.arrowView.disableBodyDragging();
        },

        moveTo: function(x, y) {
            this.arrowViewModel.moveTo(
                this.mvt.modelToViewX(x),
                this.mvt.modelToViewY(y)
            );
        }

    }, Constants.MomentumView);


    return MomentumView;
});