define(function(require) {

    'use strict';

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

    /**
     * A view that represents the player particle
     */
    var MomentaDiagram = HybridView.extend({

        events: {},

        tagName: 'div',
        className: 'momenta-diagram',

        htmlEvents: {
            'click .tip-to-tail-check': 'toggleTipToTailMode'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.panelWidth = options.width;
            this.panelHeight = options.height;
            this.x = options.x;
            this.y = options.y;
            this.scale = 24;

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

            this.initHeader();
            this.initCheckbox();
        },

        initHeader: function() {
            var $header = $('<h2 class="title">Momenta</h2>');
            this.$el.append($header);
        },

        initCheckbox: function() {
            var $checkbox = $(
                '<div class="checkbox-wrapper">' +
                    '<input type="checkbox" class="tip-to-tail-check" id="paths-check-' + this.simulation.cid + '" checked>' +
                    '<label for="paths-check-' + this.simulation.cid + '">Tip-to-tail</label>' + 
                '</div>'
            );
            $checkbox.css({
                bottom: -(this.panelHeight - MomentaDiagram.PANEL_PADDING) + 'px',
                left: MomentaDiagram.PANEL_PADDING + 'px'
            });
            this.$el.append($checkbox);
        },

        initPanel: function() {
            var panel = new PIXI.Graphics();
            panel.beginFill(PANEL_COLOR, MomentaDiagram.PANEL_ALPHA);
            panel.drawRect(0, 0, this.panelWidth, this.panelHeight);
            panel.endFill();
            this.displayObject.addChild(panel);

            var graphArea = new PIXI.Graphics();
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
        }

    }, Constants.MomentaDiagram);

    return MomentaDiagram;
});