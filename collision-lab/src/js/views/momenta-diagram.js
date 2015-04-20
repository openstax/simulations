define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    var Backbone = require('backbone');

    var HybridView         = require('common/pixi/view/hybrid');
    var GridView           = require('common/pixi/view/grid');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');
    var Colors             = require('common/colors/colors');

    var MomentumView = require('views/momentum');

    var Constants = require('constants');
    var PANEL_COLOR = Colors.parseHex(Constants.MomentaDiagram.PANEL_COLOR);
    var GRID_COLOR  = Colors.parseHex(Constants.MomentaDiagram.GRID_COLOR);

    var templateHtml = require('text!templates/momenta-diagram.html');

    /**
     * A view that represents the player particle
     */
    var MomentaDiagram = HybridView.extend({

        events: {},

        tagName: 'div',
        className: 'momenta-diagram',
        template: _.template(templateHtml),

        htmlEvents: {
            'click .tip-to-tail-check': 'toggleTipToTailMode',
            'click .btn-zoom-in'      : 'zoomIn',
            'click .btn-zoom-out'     : 'zoomOut'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.panelWidth = options.width;
            this.panelHeight = options.height;
            this.x = options.x;
            this.y = options.y;
            this.scale = MomentaDiagram.DEFAULT_SCALE;

            this.tipToTailMode = true;

            this.initGraphics();

            this.listenTo(this.simulation.balls, 'reset',  this.ballsReset);
            this.listenTo(this.simulation.balls, 'add',    this.ballAdded);
            this.listenTo(this.simulation.balls, 'remove', this.ballRemoved);
        },

        initGraphics: function() {
            this.displayObject.x = this.x;
            this.displayObject.y = this.y;
           
            this.areaBounds = new Rectangle(
                MomentaDiagram.PANEL_PADDING,
                MomentaDiagram.PANEL_PADDING_TOP,
                this.panelWidth - MomentaDiagram.PANEL_PADDING * 2,
                this.panelHeight - MomentaDiagram.PANEL_PADDING - MomentaDiagram.PANEL_PADDING_TOP
            );

            this.initMVT();
            this.initHtml();
            this.initPanel();
            this.initGrid();
            this.initArrows();
        },

        initMVT: function() {
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.areaBounds.center().x, this.areaBounds.center().y),
                this.scale
            );
        },

        initHtml: function() {
            this.$el.css({
                left: this.x + 'px',
                top: this.y + 'px',
                width: this.panelWidth
            });

            this.$el.html(this.template({
                unique: this.simulation.cid
            }));

            var bottom = -(this.panelHeight - MomentaDiagram.PANEL_PADDING);
            this.$el.find('.checkbox-wrapper').css({
                bottom: bottom + 'px',
                left: MomentaDiagram.PANEL_PADDING + 'px'
            });
            this.$el.find('.zoom-controls-wrapper').css({
                bottom: bottom + 'px',
            });
        },

        initPanel: function() {
            var panel = new PIXI.Graphics();
            panel.beginFill(PANEL_COLOR, MomentaDiagram.PANEL_ALPHA);
            panel.drawRect(0, 0, this.panelWidth, this.panelHeight);
            panel.endFill();
            this.displayObject.addChild(panel);

            var graphArea = new PIXI.Graphics();
            graphArea.lineStyle(1, GRID_COLOR, MomentaDiagram.GRID_ALPHA);
            graphArea.beginFill(0xFFFFFF, 1);
            graphArea.drawRect(this.areaBounds.x, this.areaBounds.y, this.areaBounds.w, this.areaBounds.h);
            graphArea.endFill();
            this.displayObject.addChild(graphArea);
        },

        initGrid: function() {
            this.gridView = new GridView({
                origin: new Vector2(this.areaBounds.center().x, this.areaBounds.center().y),
                bounds: this.areaBounds,
                gridSize: this.mvt.modelToViewDeltaX(1),
                lineColor: MomentaDiagram.GRID_COLOR,
                lineAlpha: MomentaDiagram.GRID_ALPHA
            });
            this.displayObject.addChild(this.gridView.displayObject);
        },

        initArrows: function() {
            // Create a mask to cut off arrows that go off the diagram
            var mask = new PIXI.Graphics();
            mask.beginFill(0x000000, 1);
            mask.drawRect(this.areaBounds.x, this.areaBounds.y, this.areaBounds.w, this.areaBounds.h);
            mask.endFill();
            this.displayObject.addChild(mask);

            // Arrows layer
            this.arrowsLayer = new PIXI.DisplayObjectContainer();
            this.arrowsLayer.mask = mask;
            this.displayObject.addChild(this.arrowsLayer);

            // A place to store momentum views
            this.momentumViews = [];

            // Create total momentum arrow
            this.totalViewModel = new Backbone.Model({
                momentumX: 0,
                momentumY: 0
            });
            this.totalView = new MomentumView({
                model: this.totalViewModel,
                mvt: this.mvt,
                color: MomentaDiagram.TOTAL_COLOR,
                label: 'total'
            });
            this.totalView.disableArrowMovement();
            this.arrowsLayer.addChild(this.totalView.displayObject);

            // Add all initial arrows
            this.ballsReset(this.simulation.balls);
        },

        update: function(time, deltaTime, paused) {
            
        },

        ballsReset: function(balls) {
            // Remove old ball views
            for (var i = this.momentumViews.length - 1; i >= 0; i--) {
                this.momentumViews[i].removeFrom(this.arrowsLayer);
                this.momentumViews.splice(i, 1);
            }

            // Add new ball views
            balls.each(function(ball) {
                this.createAndAddArrowView(ball);
            }, this);

            if (this.tipToTailMode)
                this.arrangeArrowsTipToTail();
        },

        ballAdded: function(ball, balls) {
            this.createAndAddArrowView(ball);
            if (this.tipToTailMode)
                this.arrangeArrowsTipToTail();
        },

        ballRemoved: function(ball, balls) {
            for (var i = this.momentumViews.length - 1; i >= 0; i--) {
                if (this.momentumViews[i].model === ball) {
                    this.stopListening(this.momentumViews[i].model);
                    this.momentumViews[i].removeFrom(this.arrowsLayer);
                    this.momentumViews.splice(i, 1);
                    break;
                }
            }
            if (this.tipToTailMode)
                this.arrangeArrowsTipToTail();
        },

        createAndAddArrowView: function(ball) {
            var view = new MomentumView({
                model: ball,
                mvt: this.mvt,
                label: ball.get('number')
            });
            if (this.tipToTailMode)
                view.disableArrowMovement();

            this.listenTo(ball, 'change:momentumX change:momentumY', this.momentumChanged);

            this.momentumViews.push(view);
            this.arrowsLayer.addChild(view.displayObject);
        },

        momentumChanged: function() {
            if (this.tipToTailMode)
                this.arrangeArrowsTipToTail();
        },

        arrangeArrowsTipToTail: function() {
            if (this.simulation.get('oneDimensional')) {
                var spacing = MomentaDiagram.ONE_DIMENSION_ARROW_SPACING;
                var totalX = 0;
                var y = ((this.momentumViews.length) * spacing) / 2;
                for (var i = 0; i < this.momentumViews.length; i++) {
                    this.momentumViews[i].moveTo(totalX, y);
                    totalX += this.momentumViews[i].model.get('momentumX');
                    y += -spacing;
                }
                this.totalView.moveTo(0, y);
                this.totalViewModel.set('momentumX', totalX);
            }
            else {
                var totalX = 0;
                var totalY = 0;
                for (var i = 0; i < this.momentumViews.length; i++) {
                    this.momentumViews[i].moveTo(totalX, totalY);
                    totalX += this.momentumViews[i].model.get('momentumX');
                    totalY += this.momentumViews[i].model.get('momentumY');
                }
                this.totalView.moveTo(0, 0);
                this.totalViewModel.set('momentumX', totalX);
                this.totalViewModel.set('momentumY', totalY);
            }
        },

        enableArrowMovement: function() {
            for (var i = 0; i < this.momentumViews.length; i++)
                this.momentumViews[i].enableArrowMovement();
            this.totalView.enableArrowMovement();
        },

        disableArrowMovement: function() {
            for (var i = 0; i < this.momentumViews.length; i++)
                this.momentumViews[i].disableArrowMovement();
            this.totalView.disableArrowMovement();
        },

        toggleTipToTailMode: function(event) {
            if ($(event.target).is(':checked')) {
                this.tipToTailMode = true;
                this.arrangeArrowsTipToTail();
                this.disableArrowMovement();
            }
            else {
                this.tipToTailMode = false;
                this.enableArrowMovement();
            }
        },

        updateMVT: function() {
            // Initialize a new model-view-transform
            this.initMVT();

            // Update momentum views
            for (var i = 0; i < this.momentumViews.length; i++)
                this.momentumViews[i].updateMVT(this.mvt);
            this.totalView.updateMVT(this.mvt);
            if (this.tipToTailMode)
                this.arrangeArrowsTipToTail();

            // Update grid
            this.gridView.setGridSize(this.mvt.modelToViewDeltaX(1));
        },

        zoomIn: function() {
            var scale = this.scale + 4;
            if (scale <= MomentaDiagram.MAX_SCALE) {
                this.scale = scale;
                this.updateMVT();
            }
        },

        zoomOut: function() {
            var scale = this.scale - 4;
            if (scale >= MomentaDiagram.MIN_SCALE) {
                this.scale = scale;
                this.updateMVT();
            }
        }

    }, Constants.MomentaDiagram);

    return MomentaDiagram;
});