define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');
    var DraggableArrowView = require('common/pixi/view/arrow-draggable');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var TemplateSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            this.arrowViewModel = new DraggableArrowView.ArrowViewModel({
                originX: 300,
                originY: 300,
                targetX: 380,
                targetY: 220,
                maxLength: 220
            });

            this.snappingArrowViewModel = new DraggableArrowView.ArrowViewModel({
                originX: 500,
                originY: 300,
                targetX: 320,
                targetY: 380,
                minLength: 20
            });

            this.anchoredArrowViewModel = new DraggableArrowView.ArrowViewModel({
                originX: 700,
                originY: 500,
                targetX: 650,
                targetY: 550
            });

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.arrowView = new DraggableArrowView({ 
                model: this.arrowViewModel,
                dragFillColor: '#ff6b00'
            });

            this.snappingArrowView = new DraggableArrowView({ 
                model: this.snappingArrowViewModel,
                fillColor: '#00ECFF',
                snappingEnabled: true
            });

            this.anchoredArrowView = new DraggableArrowView({ 
                model: this.anchoredArrowViewModel,
                bodyDraggingEnabled: false
            });

            this.stage.addChild(this.arrowView.displayObject);
            this.stage.addChild(this.snappingArrowView.displayObject);
            this.stage.addChild(this.anchoredArrowView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return TemplateSceneView;
});
