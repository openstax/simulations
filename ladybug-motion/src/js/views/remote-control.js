define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var HybridView         = require('common/pixi/view/hybrid');
    var Colors             = require('common/colors/colors');
    var DraggableArrowView = require('common/pixi/view/arrow-draggable');

    var Constants = require('constants');
    var UpdateMode = Constants.UpdateMode;
    var TAB_BG_COLOR        = Colors.parseHex(Constants.RemoteControlView.TAB_BG_COLOR);
    var TAB_ACTIVE_BG_COLOR = Colors.parseHex(Constants.RemoteControlView.TAB_ACTIVE_BG_COLOR);
    var ARROW_AREA_COLOR    = Colors.parseHex(Constants.RemoteControlView.ARROW_AREA_COLOR);

    /**
     * A tool that allows the user to interact with the ladybug
     *   indirectly by manipulating and arrow that represents
     *   its position, velocity, or acceleration.
     *
     * Positioning is relative to its lower right corner.
     */
    var RemoteControlView = HybridView.extend({

        events: {
            'click .positionTab'     : 'positionSelected',
            'click .velocityTab'     : 'velocitySelected',
            'click .accelerationTab' : 'accelerationSelected',
        },

        tagName: 'div',
        className: 'remote-control-view-header sim-controls',

        initialize: function(options) {
            this.simulation = options.simulation;

            this.selectedIndex = 0;

            this.initGraphics();

            this.$el.html('<h2>Remote Control</h2>');
        },

        initGraphics: function() {
            this.initTabbedPanels();
            this.initArrows();

            this.selectTab(this.selectedIndex);
        },

        initTabbedPanels: function() {
            this.tabs = new PIXI.DisplayObjectContainer();
            this.panels = new PIXI.DisplayObjectContainer();

            // Create the objects necessary for each tabbed panel
            for (var i = 0; i < RemoteControlView.TABS.length; i++) {
                // Create the tab container
                var tab = new PIXI.DisplayObjectContainer();

                // Create the background Graphics object
                tab.background = new PIXI.Graphics();
                tab.activeBackground = new PIXI.Graphics();
                tab.addChild(tab.background);
                tab.addChild(tab.activeBackground);

                // Create the label text
                tab.label = new PIXI.Text(RemoteControlView.TABS[i].label, {
                    font: RemoteControlView.TAB_FONT,
                    fill: RemoteControlView.TABS[i].color
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
            var pw = RemoteControlView.PANEL_WIDTH;
            var ph = RemoteControlView.PANEL_HEIGHT;
            var aw = RemoteControlView.AREA_WIDTH;
            var ah = RemoteControlView.AREA_HEIGHT;
            var tw = RemoteControlView.TAB_WIDTH;
            var th = RemoteControlView.TAB_HEIGHT;

            for (var i = 0; i < RemoteControlView.TABS.length; i++) {
                var panel = this.panels.getChildAt(i);

                panel.background.clear();
                panel.background.beginFill(TAB_ACTIVE_BG_COLOR, RemoteControlView.TAB_ACTIVE_BG_ALPHA);
                panel.background.drawRect(-pw, -ph, pw, ph);
                panel.background.endFill();

                panel.controlArea.clear();
                panel.controlArea.x = -RemoteControlView.AREA_WIDTH  - RemoteControlView.PANEL_PADDING;
                panel.controlArea.y = -RemoteControlView.AREA_HEIGHT - RemoteControlView.PANEL_PADDING;
                panel.controlArea.beginFill(ARROW_AREA_COLOR, RemoteControlView.ARROW_AREA_ALPHA);
                panel.controlArea.drawRect(0, 0, aw, ah);
                panel.controlArea.endFill();

                var tab = this.tabs.getChildAt(i);
                tab.x = -pw;
                tab.y = (i + 1) * -th;

                tab.background.buttonMode = true;
                tab.background.defaultCursor = 'pointer';
                tab.background.clear();
                tab.background.beginFill(TAB_BG_COLOR, RemoteControlView.TAB_BG_ALPHA);
                tab.background.drawRect(-tw, 0, tw, th);
                tab.background.endFill();

                tab.activeBackground.clear();
                tab.activeBackground.beginFill(TAB_ACTIVE_BG_COLOR, RemoteControlView.TAB_ACTIVE_BG_ALPHA);
                tab.activeBackground.drawRect(-tw, 0, tw, th);
                tab.activeBackground.endFill();

                tab.label.anchor.x = 1;
                tab.label.anchor.y = 0.5;
                tab.label.x = -10;
                tab.label.y = Math.round(th / 2) + 3;
            }
        },

        initArrows: function() {
            var models = [];
            var views = [];

            for (var i = 0; i < RemoteControlView.TABS.length; i++) {
                var arrowModel = new DraggableArrowView.ArrowViewModel({
                    originX: 0,
                    originY: 0,
                    targetX: 0,
                    targetY: 0,
                    minLength: null
                });

                var arrowView = new DraggableArrowView({
                    model: arrowModel,
                    fillColor: RemoteControlView.TABS[i].color,
                    bodyDraggingEnabled: false,
                    useDotWhenSmall: true
                });
                this.panels.getChildAt(i).addChild(arrowView.displayObject);

                models.push(arrowModel);
                views.push(arrowView);
            }

            this.arrowModels = models;
            this.arrowViews = views;

            this.repositionArrows();

            // Listen for position changes
            this.listenTo(views[0], 'drag-head-start', this.positionDragStart);
            this.listenTo(views[0], 'drag-head-end',   this.positionDragEnd);
            this.listenTo(models[0], 'change:targetX change:targetY', this.positionChanged);
            this.listenTo(models[1], 'change:targetX change:targetY', this.velocityChanged);
            this.listenTo(models[2], 'change:targetX change:targetY', this.accelerationChanged);
        },

        repositionArrows: function(maintainTargetPosition) {
            var models = this.arrowModels;

            for (var i = 0; i < RemoteControlView.TABS.length; i++) {
                var dx = models[i].get('targetX') - models[i].get('originX');
                var dy = models[i].get('targetY') - models[i].get('originY');

                models[i].set('originX', -RemoteControlView.PANEL_WIDTH  / 2);
                models[i].set('originY', -RemoteControlView.PANEL_HEIGHT / 2);
                if (maintainTargetPosition) {
                    models[i].set('targetX', models[i].get('originX') + dx);
                    models[i].set('targetY', models[i].get('originY') + dy);
                }
            }

            if (!maintainTargetPosition) {
                // Position
                var bounds = this.simulation.getBounds();
                var xPercent = this.model.get('position').x / bounds.w;
                var yPercent = this.model.get('position').y / bounds.h;
                var x = xPercent * (RemoteControlView.AREA_WIDTH);
                var y = yPercent * (RemoteControlView.AREA_HEIGHT);
                models[0].set('targetX', models[0].get('originX') + x);
                models[0].set('targetY', models[0].get('originY') + y);

                // Velocity
                models[1].set('targetX', models[1].get('originX'));
                models[1].set('targetY', models[1].get('originY'));

                // Acceleration
                models[2].set('targetX', models[2].get('originX'));
                models[2].set('targetY', models[2].get('originY'));
            }
        },

        reset: function() {
            this.selectTab(0);
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
            this.model.set({
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0,
                mode: index
            });
            this.repositionArrows();

            this.selectedIndex = index;

            for (var i = 0; i < RemoteControlView.TABS.length; i++) {
                this.tabs.getChildAt(i).background.visible = true;
                this.tabs.getChildAt(i).activeBackground.visible = false;
                this.panels.getChildAt(i).visible = false;
            }

            this.tabs.getChildAt(index).background.visible = false;
            this.tabs.getChildAt(index).activeBackground.visible = true;
            this.panels.getChildAt(index).visible = true;
        },

        positionDragStart: function() {
            this.simulation.startSampling();
        },

        positionDragEnd: function() {
            this.simulation.stopSampling();
        },

        positionChanged: function(arrowModel) {
            this.simulation.play();
            this.simulation.set('updateMode', UpdateMode.POSITION);

            var dx = arrowModel.get('targetX') - arrowModel.get('originX');
            var dy = arrowModel.get('targetY') - arrowModel.get('originY');

            var smallestDimensionValue = Math.min(this.simulation.getBounds().w, this.simulation.getBounds().h);
            var x = (dx / RemoteControlView.AREA_WIDTH)  * smallestDimensionValue;
            var y = (dy / RemoteControlView.AREA_HEIGHT) * smallestDimensionValue;

            this.simulation.setSamplePoint(x, y);
        },

        velocityChanged: function(arrowModel) {
            this.simulation.play();
            this.simulation.set('updateMode', UpdateMode.VELOCITY);

            var xPercent = (arrowModel.get('targetX') - arrowModel.get('originX')) / RemoteControlView.AREA_WIDTH;
            var yPercent = (arrowModel.get('targetY') - arrowModel.get('originY')) / RemoteControlView.AREA_HEIGHT;

            this.model.setVelocity(xPercent, yPercent);
        },

        accelerationChanged: function(arrowModel) {
            this.simulation.play();
            this.simulation.set('updateMode', UpdateMode.ACCELERATION);

            var xPercent = (arrowModel.get('targetX') - arrowModel.get('originX')) / RemoteControlView.AREA_WIDTH;
            var yPercent = (arrowModel.get('targetY') - arrowModel.get('originY')) / RemoteControlView.AREA_HEIGHT;

            this.model.setAcceleration(xPercent, yPercent);
        }

    }, Constants.RemoteControlView);

    return RemoteControlView;
});