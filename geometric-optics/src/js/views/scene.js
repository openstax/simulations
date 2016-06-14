define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var RulerView          = require('common/v3/pixi/view/ruler');
    var AppView            = require('common/v3/app/app');
    var Colors             = require('common/colors/colors');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var ModelViewTransform = require('common/math/model-view-transform');
    var HelpLabelView      = require('common/v3/help-label/index');

    var SourceObjectView = require('views/source-object');
    var TargetImageView  = require('views/target-image');
    var LensView         = require('views/lens');
    var RaysView         = require('views/rays');
    var ScreenView       = require('views/screen');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');
    var AXIS_COLOR = Colors.parseHex(Constants.SceneView.AXIS_COLOR);

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var GeometricOpticsSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.lens, 'change:position', this.drawAxis);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.backLayer   = new PIXI.Container();
            this.objectsLayer = new PIXI.Container();
            this.raysLayer   = new PIXI.Container();
            this.axisLayer   = new PIXI.Container();
            this.frontLayer  = new PIXI.Container();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.objectsLayer);
            this.stage.addChild(this.raysLayer);
            this.stage.addChild(this.axisLayer);
            this.stage.addChild(this.frontLayer);

            this.initMVT();
            this.initObjects();
            this.initRays();
            this.initAxis();
            this.initScreen();
            this.initRuler();
            this.initHelpLabels();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.MIN_SCENE_WIDTH;
            var simHeight = Constants.MIN_SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var usableScreenSpace
            if (AppView.windowIsShort())
                usableScreenSpace = new Rectangle(0, 0, this.width - 205, this.height);
            else
                usableScreenSpace = new Rectangle(0, 116, this.width, this.height - 116);

            var simRatio = simWidth / simHeight;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > simRatio) ? usableScreenSpace.h / simHeight : usableScreenSpace.w / simWidth;
            
            this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initObjects: function() {
            this.sourceObjectView = new SourceObjectView({
                model: this.simulation.sourceObject,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.sourceObjectView.displayObject);

            this.targetImageView = new TargetImageView({
                model: this.simulation.targetImage,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.targetImageView.displayObject);

            this.lensView = new LensView({
                model: this.simulation.lens,
                mvt: this.mvt
            });
            this.objectsLayer.addChild(this.lensView.displayObject);
        },

        initAxis: function() {
            this.axis = new PIXI.Graphics();
            this.axisLayer.addChild(this.axis);
            this.drawAxis();
        },

        drawAxis: function() {
            this.axis.clear();
            this.axis.lineStyle(GeometricOpticsSceneView.AXIS_WIDTH, AXIS_COLOR, GeometricOpticsSceneView.AXIS_ALPHA);
            this.axis.moveTo(0,          this.mvt.modelToViewY(this.simulation.lens.get('position').y));
            this.axis.lineTo(this.width, this.mvt.modelToViewY(this.simulation.lens.get('position').y));
        },

        initRays: function() {
            this.raysView = new RaysView({
                model: this.simulation,
                mvt: this.mvt
            });
            this.raysLayer.addChild(this.raysView.displayObject);
        },

        initScreen: function() {
            this.screenView = new ScreenView({
                model: this.simulation.targetImage,
                mvt: this.mvt
            });

            this.backLayer.addChild(this.screenView.backLayer);
            this.frontLayer.addChild(this.screenView.frontLayer);

            this.screenView.setPosition(
                this.mvt.modelToViewX(Constants.MIN_SCENE_WIDTH * 0.32),
                this.mvt.modelToViewY(0)
            );
        },

        initRuler: function() {
            this.rulerView = new RulerView({
                orientation : 'horizontal',
                pxPerUnit: this.mvt.modelToViewDeltaX(0.01),
                rulerWidth: 15,
                rulerMeasureUnits : 200,

                ticks : [{
                    size: 8,
                    at: 10,
                    color: '#5A3D01'
                },{
                    size: 4,
                    at: 2,
                    color: '#5A3D01'
                }],

                labels: [{
                    font: '14px Arial',
                    at: 20
                }]
            });

            this.frontLayer.addChild(this.rulerView.displayObject);

            if (AppView.windowIsShort())
                this.rulerView.setPosition(15, 15);
            else
                this.rulerView.setPosition(20, 136);

            this.rulerView.hide();
        },

        initHelpLabels: function() {
            this.helpLabels = [];

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.rulerView,
                title: 'Draggable Ruler',
                color: '#fff',
                font: '11pt Helvetica Neue'
            }));

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.lensView,
                title: 'Draggable Lens',
                color: '#fff',
                font: '11pt Helvetica Neue',
                anchor: {
                    x: 0.5,
                    y: 0
                },
                position : {
                    x: 0,
                    y: 114
                },
            }));

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.lensView.focusPoint2,
                title: 'Focal Point',
                color: '#fff',
                font: '11pt Helvetica Neue',
                anchor: {
                    x: 0.5,
                    y: 0
                }
            }));

            this.helpLabels.push(new HelpLabelView({
                attachTo: this.screenView.screenBack,
                title: 'Draggable Screen',
                color: '#fff',
                font: '22pt Helvetica Neue',
                anchor: {
                    x: 0.5,
                    y: 0
                }
            }));

            // this.helpLabels.push(new HelpLabelView({
            //     attachTo: this.sceneView.toolsLayer,
            //     position : {
            //         x : 140,
            //         y : 300
            //     },
            //     width : '300px',
            //     title : 'Pull mass sideways to detach from spring'
            // }));

            _.each(this.helpLabels, function(helpLabel){
                helpLabel.render();
            }, this);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        showSecondPoint: function() {
            this.sourceObjectView.showSecondPoint();
            this.raysView.showSecondPoint();
            this.screenView.showSecondPoint();
        },

        hideSecondPoint: function() {
            this.sourceObjectView.hideSecondPoint();
            this.raysView.hideSecondPoint();
            this.screenView.hideSecondPoint();
        },

        setRaysMode: function(mode) {
            this.raysView.setMode(mode);
        },

        showVirtualImage: function() {
            this.raysView.showVirtualImage();
            this.targetImageView.showVirtualImage();
        },

        hideVirtualImage: function() {
            this.raysView.hideVirtualImage();
            this.targetImageView.hideVirtualImage();
        },

        showGuides: function() {
            this.raysView.showGuides();
        },

        hideGuides: function() {
            this.raysView.hideGuides();
        },

        showRuler: function() {
            this.rulerView.show();
        },

        hideRuler: function() {
            this.rulerView.hide();
        },

        showHelpLabels: function() {
            for (var i = 0; i < this.helpLabels.length; i++)
                this.helpLabels[i].show();
        },

        hideHelpLabels: function() {
            for (var i = 0; i < this.helpLabels.length; i++)
                this.helpLabels[i].hide();
        }

    }, Constants.SceneView);

    return GeometricOpticsSceneView;
});
