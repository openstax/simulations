define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    require('common/pixi/extensions');

    var PixiView           = require('common/pixi/view');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var PiecewiseCurve     = require('common/math/piecewise-curve');
    var Colors             = require('common/colors/colors');
    var DraggableArrowView = require('common/pixi/view/arrow-draggable');

    var Level = require('models/level');

    var Assets = require('assets');

    var Constants = require('constants');
    var TAB_BG_COLOR = Colors.parseHex(Constants.TAB_BG_COLOR);
    var TAB_ACTIVE_BG_COLOR = Colors.parseHex(Constants.TAB_ACTIVE_BG_COLOR);
    var ARROW_AREA_COLOR = Colors.parseHex(Constants.ARROW_AREA_COLOR);

    /**
     * A tool that allows the user to interact with the particle
     *   indirectly by manipulating and arrow that represents
     *   its position, velocity, or acceleration.
     *
     * Positioning is relative to its lower right corner.
     */
    var ParticleControlView = PixiView.extend({

        events: {
            'click .positionTab'     : 'positionSelected',
            'click .velocityTab'     : 'velocitySelected',
            'click .accelerationTab' : 'accelerationSelected',
        },

        initialize: function(options) {
            this.areaWidth  = options.areaWidth;
            this.areaHeight = options.areaHeight;

            this.selectedIndex = 0;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initTabbedPanels();
            this.initArrows();
        },

        initTabbedPanels: function() {
            this.tabs = new PIXI.DisplayObjectContainer();
            this.panels = new PIXI.DisplayObjectContainer();

            this.shadow = new PIXI.Graphics();
            this.displayObject.addChild(this.shadow);

            // Create the objects necessary for each tabbed panel
            for (var i = 0; i < Constants.TABS.length; i++) {
                // Create the tab container
                var tab = new PIXI.DisplayObjectContainer();

                // Create the background Graphics object
                tab.background = new PIXI.Graphics();
                tab.activeBackground = new PIXI.Graphics();
                tab.addChild(tab.background);
                tab.addChild(tab.activeBackground);

                // Create the label text
                tab.label = new PIXI.Text(Constants.TABS[i].label, {
                    font: Constants.TAB_FONT,
                    fill: Constants.TABS[i].color
                });
                tab.addChild(tab.label);

                // Add the tab
                this.tabs.addChild(tab);

                // Create and panel
                var panel = new PIXI.DisplayObjectContainer();

                // Create panel background
                panel.background = new PIXI.Graphics();
                panel.addChild(panel.background);

                panel.controlArea = new PIXI.Graphics();
                panel.addChild(panel.controlArea);

                this.panels.addChild(panel);
            }

            this.positionTab     = this.tabs.getChildAt(0).background;
            this.velocityTab     = this.tabs.getChildAt(1).background;
            this.accelerationTab = this.tabs.getChildAt(2).background;

            // Draw the backgrounds and position everything
            this.drawTabbedPanels();
            
            this.displayObject.addChild(this.tabs);
            this.displayObject.addChild(this.panels);
        },

        drawTabbedPanels: function() {
            var pw = this.areaWidth  + Constants.PANEL_PADDING * 2;
            var ph = this.areaHeight + Constants.PANEL_PADDING * 2;
            var tw = Constants.TAB_WIDTH;
            var th = Constants.TAB_HEIGHT;

            for (var i = 0; i < Constants.TABS.length; i++) {
                var panel = this.panels.getChildAt(i);

                panel.background.clear();
                panel.background.beginFill(TAB_ACTIVE_BG_COLOR, Constants.TAB_ACTIVE_BG_ALPHA);
                panel.background.drawRect(-pw, -ph, pw, ph);
                panel.background.endFill();

                panel.controlArea.clear();
                panel.controlArea.x = -Constants.PANEL_PADDING - this.areaWidth;
                panel.controlArea.y = -Constants.PANEL_PADDING - this.areaHeight;
                panel.controlArea.beginFill(ARROW_AREA_COLOR, 1);
                panel.controlArea.drawRect(0, 0, this.areaWidth, this.areaHeight);
                panel.controlArea.endFill();

                var tab = this.tabs.getChildAt(i);
                tab.x = -pw;
                tab.y = -ph + i * th;

                tab.background.buttonMode = true;
                tab.background.defaultCursor = 'pointer';
                tab.background.clear();
                tab.background.beginFill(TAB_BG_COLOR, Constants.TAB_BG_ALPHA);
                tab.background.drawRect(-tw, 0, tw, th);
                tab.background.endFill();

                tab.activeBackground.clear();
                tab.activeBackground.beginFill(TAB_ACTIVE_BG_COLOR, Constants.TAB_ACTIVE_BG_ALPHA);
                tab.activeBackground.drawRect(-tw, 0, tw, th);
                tab.activeBackground.endFill();

                tab.label.anchor.x = 1;
                tab.label.anchor.y = 0.5;
                tab.label.x = -10;
                tab.label.y = Math.round(th / 2) + 3;
            }

            var outline = new PiecewiseCurve()
                .moveTo(0, 0)
                .lineTo(0, -ph)
                .lineTo(-pw - tw, -ph)
                .lineTo(-pw - tw, -ph + th * Constants.TABS.length)
                .lineTo(-pw, -ph + th * Constants.TABS.length)
                .lineTo(-pw, 0)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            this.displayObject.removeChild(this.shadow);
            this.shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            this.shadow.alpha = 0.3;
            this.displayObject.addChild(this.shadow);

            this.selectTab(this.selectedIndex);
        },

        initArrows: function() {
            var models = [];
            var views = [];

            for (var i = 0; i < Constants.TABS.length; i++) {
                var arrowModel = new DraggableArrowView.ArrowViewModel({
                    originX: 0,
                    originY: 0,
                    targetX: 40,
                    targetY: 40,
                    minLength: null
                });

                var arrowView = new DraggableArrowView({
                    model: arrowModel,
                    fillColor: Constants.TABS[i].color,
                    bodyDraggingEnabled: false,
                    useDotWhenSmall: true
                });
                this.panels.getChildAt(i).addChild(arrowView.displayObject);

                models.push(arrowModel);
                views.push(arrowView);
            }

            this.arrowModels = models;
            this.arrowViews = views;

            this.positionArrows();
        },

        positionArrows: function() {
            var models = this.arrowModels;

            for (var i = 0; i < Constants.TABS.length; i++) {
                var dx = models[i].get('targetX') - models[i].get('originX');
                var dy = models[i].get('targetY') - models[i].get('originY');

                models[i].set('originX', -this.areaWidth  / 2 - Constants.PANEL_PADDING);
                models[i].set('originY', -this.areaHeight / 2 - Constants.PANEL_PADDING);
                models[i].set('targetX', models[i].get('originX') + dx);
                models[i].set('targetY', models[i].get('originY') + dy);
            }
        },

        setAreaDimensions: function(areaWidth, areaHeight) {
            this.areaWidth = areaWidth;
            this.areaHeight = areaHeight;

            this.drawTabbedPanels();
            this.positionArrows();
        },

        positionSelected: function(data) {
            this.selectTab(0);
        },

        velocitySelected: function(data) {
            this.selectTab(1);
        },

        accelerationSelected: function(data) {
            this.selectTab(2);
        },

        selectTab: function(index) {
            this.selectedIndex = index;

            for (var i = 0; i < Constants.TABS.length; i++) {
                this.tabs.getChildAt(i).background.visible = true;
                this.tabs.getChildAt(i).activeBackground.visible = false;
                this.panels.getChildAt(i).visible = false;
            }

            this.tabs.getChildAt(index).background.visible = false;
            this.tabs.getChildAt(index).activeBackground.visible = true;
            this.panels.getChildAt(index).visible = true;
        }

    });

    return ParticleControlView;
});