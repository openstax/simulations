define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');
    var Colors    = require('common/colors/colors');

    var Level = require('models/level');

    var Assets = require('assets');

    var Constants = require('constants');
    var TAB_BG_COLOR = Colors.parseHex(Constants.TAB_BG_COLOR);
    var TAB_ACTIVE_BG_COLOR = Colors.parseHex(Constants.TAB_ACTIVE_BG_COLOR);

    /**
     * A tool that allows the user to interact with the particle
     *   indirectly by manipulating and arrow that represents
     *   its position, velocity, or acceleration.
     *
     * Positioning is relative to its lower right corner.
     */
    var ParticleControlView = PixiView.extend({

        initialize: function(options) {
            this.areaWidth  = options.areaWidth;
            this.areaHeight = options.areaHeight;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initTabbedPanels();
            this.initArrows();
        },

        initTabbedPanels: function() {
            this.tabs = new PIXI.DisplayObjectContainer();
            this.panels = new PIXI.DisplayObjectContainer();

            

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

                // Add the panel
                var panel = new PIXI.DisplayObjectContainer();
                panel.background = new PIXI.Graphics();
                panel.addChild(panel.background);
                this.panels.addChild(panel);
            }

            // Draw the backgrounds and position everything
            this.drawTabbedPanels();
            
            this.displayObject.addChild(this.tabs);
            this.displayObject.addChild(this.panels);
        },

        drawTabbedPanels: function() {
            var aw = this.areaWidth;
            var ah = this.areaHeight;
            var tw = Constants.TAB_WIDTH;
            var th = Constants.TAB_HEIGHT;

            for (var i = 0; i < Constants.TABS.length; i++) {
                var panel = this.panels.getChildAt(i);
                panel.background.clear();
                panel.background.beginFill(TAB_ACTIVE_BG_COLOR, Constants.TAB_ACTIVE_BG_ALPHA);
                panel.background.drawRect(-aw, -ah, aw, ah);
                panel.background.endFill();
                panel.visible = false;

                var tab = this.tabs.getChildAt(i);
                tab.x = -aw;
                tab.y = -ah + i * th;
                tab.background.clear();
                tab.background.beginFill(TAB_BG_COLOR, Constants.TAB_BG_ALPHA);
                tab.background.drawRect(-tw, 0, tw, th);
                tab.background.endFill();
                tab.activeBackground.clear();
                tab.activeBackground.beginFill(TAB_ACTIVE_BG_COLOR, Constants.TAB_ACTIVE_BG_ALPHA);
                tab.activeBackground.drawRect(-tw, 0, tw, th);
                tab.activeBackground.endFill();
                tab.activeBackground.visible = false;
                tab.label.anchor.x = 1;
                tab.label.anchor.y = 0.5;
                tab.label.x = -10;
                tab.label.y = Math.round(th / 2);
            }

            this.panels.getChildAt(0).visible = true;
            this.tabs.getChildAt(0).background.visible = false;
            this.tabs.getChildAt(0).activeBackground.visible = true;
        },

        initArrows: function() {

        },

        setAreaDimensions: function(areaWidth, areaHeight) {
            this.areaWidth = areaWidth;
            this.areaHeight = areaHeight;
        }
    });

    return ParticleControlView;
});