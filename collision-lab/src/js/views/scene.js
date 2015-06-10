define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var AppView            = require('common/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');
    var Colors             = require('common/colors/colors');

    var BallView       = require('views/ball');
    var BallTraceView  = require('views/ball-trace');
    var MomentaDiagram = require('views/momenta-diagram');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');
    var BORDER_FILL_COLOR = Colors.parseHex(Constants.SceneView.BORDER_FILL_COLOR);
    var BORDER_LINE_COLOR = Colors.parseHex(Constants.SceneView.BORDER_LINE_COLOR);
    var CM_MARKER_FILL_COLOR = Colors.parseHex(Constants.SceneView.CM_MARKER_FILL_COLOR);
    var CM_MARKER_LINE_COLOR = Colors.parseHex(Constants.SceneView.CM_MARKER_LINE_COLOR);

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var CollisionLabSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false
            }, options);

            this.oneDimensional = options.oneDimensional;
            this.velocityArrowsVisible = true;
            this.momentumArrowsVisible = false;

            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.balls, 'reset',  this.ballsReset);
            this.listenTo(this.simulation.balls, 'add',    this.ballAdded);
            this.listenTo(this.simulation.balls, 'remove', this.ballRemoved);

            this.listenTo(this.simulation, 'change:kineticEnergy', this.kineticEnergyChanged);
            this.listenTo(this.simulation, 'change:xCenterOfMass', this.xCenterOfMassChanged);
            this.listenTo(this.simulation, 'change:yCenterOfMass', this.yCenterOfMassChanged);
        },

        reset: function() {
            this.showVelocityArrows();
            if (!this.oneDimensional)
                this.showReflectingBorder();

            this.hideMomentumArrows();
            this.hideVelocityLabels();
            this.hideMomentumLabels();
            this.hideKineticEnergy();
            this.hideCenterOfMass();
            this.hideMomentaDiagram();
            this.hideTraces();
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBorderGraphic();
            this.initKineticEnergyLabel();
            this.initBallTraceLayer();
            this.initBalls();
            this.initCenterOfMassMarker();
            this.initMomentaDiagram();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var usableScreenSpace;

            if (AppView.windowIsShort()) {
                usableScreenSpace = new Rectangle(
                    20, // Left margin
                    20, // Top margin
                    this.width - 20 - 20 - 200 - 20,
                    this.height - 20 - 62 - 20
                );

                if (this.momentaDiagram && this.momentaDiagram.isVisible())
                    usableScreenSpace.w -= 200 + 20;

                if (this.oneDimensional) {
                    usableScreenSpace.y += 112;
                    usableScreenSpace.h -= 112;
                }
            }
            else {
                usableScreenSpace = new Rectangle(
                    20,       // Left margin
                    20 + 185, // Top margin plus ball settings matrix
                    this.width - 20 - 20 - 200 - 20,
                    this.height - 20 - 185 - 62 - 20
                ); 

                if (this.oneDimensional) {
                    usableScreenSpace.y -= 88;
                    usableScreenSpace.h += 88;
                }
            }

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initBallTraceLayer: function() {
            this.ballTraceLayer = new PIXI.DisplayObjectContainer();
            this.ballTraceLayer.visible = false;
            this.stage.addChild(this.ballTraceLayer);
        },

        initBorderGraphic: function() {
            this.border = new PIXI.Graphics();
            this.border.lineStyle(3, BORDER_LINE_COLOR, Constants.SceneView.BORDER_LINE_ALPHA);
            this.stage.addChild(this.border);

            this.drawBorder();
        },

        initKineticEnergyLabel: function() {
            this.$ui.append(
                '<label class="kinetic-energy-label">' +
                    'Kinetic Energy = <span class="kinetic-energy">0</span> J' + 
                '</label>'
            );
            this.$kineticEnergy = this.$ui.find('.kinetic-energy');
            this.$kineticEnergyLabel = this.$ui.find('.kinetic-energy-label');
            this.$kineticEnergyLabel.hide();
            this.kineticEnergyChanged(this.simulation, this.simulation.get('kineticEnergy'));
        },

        initBalls: function() {
            this.ballViews = [];
            this.ballTraceViews = [];

            this.balls = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.balls);

            this.ballsReset(this.simulation.balls);
        },

        initCenterOfMassMarker: function() {
            var thickness = Constants.SceneView.CM_MARKER_THICKNESS;
            var lineWidth = Constants.SceneView.CM_MARKER_LINE_WIDTH;

            var marker = new PIXI.Graphics();
            marker.lineStyle(thickness, CM_MARKER_LINE_COLOR, Constants.SceneView.CM_MARKER_LINE_ALPHA);

            var radius = Constants.SceneView.CM_MARKER_RADIUS;
            var offset = Math.sqrt((radius * radius) / 2);
            marker.moveTo(-offset, -offset);
            marker.lineTo( offset,  offset);
            marker.moveTo(-offset,  offset);
            marker.lineTo( offset, -offset);

            marker.lineStyle(thickness - (2 * lineWidth), CM_MARKER_FILL_COLOR, Constants.SceneView.CM_MARKER_FILL_ALPHA);
            offset -= Math.sqrt((lineWidth * lineWidth) / 2);
            marker.moveTo(-offset, -offset);
            marker.lineTo( offset,  offset);
            marker.moveTo(-offset,  offset);
            marker.lineTo( offset, -offset);

            this.centerOfMassMarker = marker;
            this.stage.addChild(marker);

            marker.visible = false;

            this.xCenterOfMassChanged(this.simulation, this.simulation.get('xCenterOfMass'));
            this.yCenterOfMassChanged(this.simulation, this.simulation.get('yCenterOfMass'));
        },

        initMomentaDiagram: function() {
            var $simView = this.$el.parents('.sim-view');
            var $simControls = $simView.find('.sim-controls');
            var y = $simControls.outerHeight() + 20 + 20;
            var width = $simControls.outerWidth();
            var height = this.height - y - $simView.find('.playback-controls-wrapper').outerHeight() - 20;
            var x = this.width - width - 20;

            this.momentaDiagram = new MomentaDiagram({
                simulation: this.simulation,
                width: width,
                height: height,
                x: x,
                y: y
            });
            this.stage.addChild(this.momentaDiagram.displayObject);
            this.$ui.append(this.momentaDiagram.el);
            this.momentaDiagram.hide();
        },

        drawBorder: function() {
            if (!this.oneDimensional) {
                this.border.beginFill(BORDER_FILL_COLOR, Constants.SceneView.BORDER_FILL_ALPHA);
                this.border.drawRect(
                    this.mvt.modelToViewX(this.simulation.bounds.x),
                    this.mvt.modelToViewY(this.simulation.bounds.y),
                    this.mvt.modelToViewDeltaX(this.simulation.bounds.w),
                    this.mvt.modelToViewDeltaY(this.simulation.bounds.h)
                );
                this.border.endFill();
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            for (var i = this.ballTraceViews.length - 1; i >= 0; i--)
                this.ballTraceViews[i].update(time, deltaTime, paused);
        },

        updateMVT: function() {

        },

        ballsReset: function(balls) {
            // Remove old ball views
            for (var i = this.ballViews.length - 1; i >= 0; i--) {
                this.ballViews[i].removeFrom(this.balls);
                this.ballViews.splice(i, 1);
            }

            // Add new ball views
            balls.each(function(ball) {
                this.createAndAddBallView(ball);
            }, this);
        },

        ballAdded: function(ball, balls) {
            this.createAndAddBallView(ball);
        },

        ballRemoved: function(ball, balls) {
            for (var i = this.ballViews.length - 1; i >= 0; i--) {
                if (this.ballViews[i].model === ball) {
                    this.ballViews[i].removeFrom(this.balls);
                    this.ballViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddBallView: function(ball) {
            var ballView = new BallView({ 
                model: ball,
                mvt: this.mvt,
                simulation: this.simulation
            });
            this.balls.addChild(ballView.displayObject);
            this.ballViews.push(ballView);

            if (this.velocityArrowsVisible)
                ballView.showVelocityArrow();
            else
                ballView.hideVelocityArrow();

            if (this.momentumArrowsVisible)
                ballView.showMomentumArrow();
            else
                ballView.hideMomentumArrow();

            if (this.velocityLabelsVisible)
                ballView.showVelocityLabel();
            else
                ballView.hideVelocityLabel();

            if (this.momentumLabelsVisible)
                ballView.showMomentumLabel();
            else
                ballView.hideMomentumLabel();

            // Trace view
            var ballTraceView = new BallTraceView({
                model: ball,
                mvt: this.mvt
            });
            this.ballTraceLayer.addChild(ballTraceView.displayObject);
            this.ballTraceViews.push(ballTraceView);
        },

        kineticEnergyChanged: function(simulation, kineticEnergy) {
            this.$kineticEnergy.text(kineticEnergy.toFixed(2));
        },

        xCenterOfMassChanged: function(simulation, xCenterOfMass) {
            this.centerOfMassMarker.x = this.mvt.modelToViewX(xCenterOfMass);
        },

        yCenterOfMassChanged: function(simulation, yCenterOfMass) {
            this.centerOfMassMarker.y = this.mvt.modelToViewY(yCenterOfMass);
        },

        showVelocityArrows: function() {
            this.velocityArrowsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showVelocityArrow();
        },

        hideVelocityArrows: function() {
            this.velocityArrowsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideVelocityArrow();
        },

        showMomentumArrows: function() {
            this.momentumArrowsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showMomentumArrow();
        },

        hideMomentumArrows: function() {
            this.momentumArrowsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideMomentumArrow();
        },

        showVelocityLabels: function() {
            this.velocityLabelsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showVelocityLabel();
        },

        hideVelocityLabels: function() {
            this.velocityLabelsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideVelocityLabel();
        },

        showMomentumLabels: function() {
            this.momentumLabelsVisible = true;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].showMomentumLabel();
        },

        hideMomentumLabels: function() {
            this.momentumLabelsVisible = false;
            for (var i = this.ballViews.length - 1; i >= 0; i--)
                this.ballViews[i].hideMomentumLabel();
        },

        showKineticEnergy: function() {
            this.$kineticEnergyLabel.show();
        },

        hideKineticEnergy: function() {
            this.$kineticEnergyLabel.hide();
        },

        showCenterOfMass: function() {
            this.centerOfMassMarker.visible = true;
        },

        hideCenterOfMass: function() {
            this.centerOfMassMarker.visible = false;
        },

        showReflectingBorder: function() {
            this.border.visible = true;
        },

        hideReflectingBorder: function() {
            this.border.visible = false;
        },

        showTraces: function() {
            for (var i = this.ballTraceViews.length - 1; i >= 0; i--)
                this.ballTraceViews[i].clear();
            this.ballTraceLayer.visible = true;
        },

        hideTraces: function() {
            this.ballTraceLayer.visible = false;
        },

        showMomentaDiagram: function() {
            this.momentaDiagram.show();
            this.updateMVT();
        },

        hideMomentaDiagram: function() {
            this.momentaDiagram.hide();
            this.updateMVT();
        }

    });

    return CollisionLabSceneView;
});
