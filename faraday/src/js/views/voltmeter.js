define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
                   require('common/v3/pixi/draw-arrow');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var VoltmeterView = PixiView.extend({

        /**
         * Initializes the new VoltmeterView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.guageColor  = Colors.parseHex(VoltmeterView.GUAGE_COLOR);
            this.needleColor = Colors.parseHex(VoltmeterView.NEEDLE_COLOR);
            this.screwColor  = Colors.parseHex(VoltmeterView.SCREW_COLOR);

            // Cached objects
            this._pivot = new Vector2();
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:enabled',  this.updateVisibility);
            this.updateVisibility(this.model, this.model.get('enabled'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.background = new PIXI.Container();

            this.body = Assets.createSprite(Assets.Images.VOLTMETER);
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 1;
            this.background.addChild(this.body);
            this.background.y = -40;

            this.ticks  = new PIXI.Graphics();
            this.needle = new PIXI.Graphics();

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.ticks);
            this.displayObject.addChild(this.needle);

            this.initLabel();
            this.initResistor();
            this.initProbes();

            this.updateMVT(this.mvt);
        },

        initLabel: function() {
            var title = new PIXI.Text('voltage', {
                font: VoltmeterView.TITLE_FONT,
                fill: VoltmeterView.TITLE_COLOR
            });

            title.x = -Math.floor(title.width / 2);
            title.y = -60;

            this.displayObject.addChild(title);
        },

        initResistor: function() {
            this.resistor = Assets.createSprite(Assets.Images.VOLTMETER_RESISTOR);
            this.resistor.anchor.x = 0.5;
            this.resistor.anchor.y = 0.5;
            this.resistor.y = 40;

            this.background.addChild(this.resistor);
        },

        initProbes: function() {
            var leftProbe  = Assets.createSprite(Assets.Images.VOLTMETER_PROBE_WHITE);
            var rightProbe = Assets.createSprite(Assets.Images.VOLTMETER_PROBE_BLACK);
            leftProbe.anchor.x = rightProbe.anchor.x = 0.5;
            leftProbe.anchor.y = rightProbe.anchor.y = 1;
            leftProbe.y = rightProbe.y = this.resistor.y;
            leftProbe.x = -Math.floor(this.resistor.width / 2);
            rightProbe.x = Math.floor(this.resistor.width / 2);

            this.background.addChildAt(leftProbe, 0);
            this.background.addChildAt(rightProbe, 0);
        },

        drawTicks: function() {
            var pivot = this._pivot.set(this.mvt.modelToViewDelta(VoltmeterView.PIVOT_POINT));
            var color = this.guageColor;
            var graphics = this.ticks;
            graphics.clear();
            graphics.lineStyle(VoltmeterView.GUAGE_STROKE_WIDTH, color, 1);
            graphics.x = pivot.x;
            graphics.y = pivot.y;

            // Meter guage, a 180-degree chorded arc.
            var radius = this.mvt.modelToViewDeltaX(VoltmeterView.GUAGE_RADIUS);
            graphics.arc(0, 0, radius, -Math.PI, 0, false);
            graphics.lineTo(-radius, 0);

            // Vertical line at zero-point of guage.
            graphics.moveTo(0, 0);
            graphics.lineTo(0, -radius);
            
            // Major and minor tick marks around the outside of the guage.
            var angle = VoltmeterView.MINOR_TICK_SPACING;
            var tickCount = 1;
            var length;
            var vec = this._vec;
            while (angle < Math.PI / 2) {
                // Major or minor tick mark?
                if (tickCount % VoltmeterView.MINOR_TICKS_PER_MAJOR_TICK === 0) {
                    graphics.lineStyle(VoltmeterView.MAJOR_TICK_STROKE_WIDTH, color, 1);
                    length = VoltmeterView.MAJOR_TICK_LENGTH;
                }
                else {
                    graphics.lineStyle(VoltmeterView.MINOR_TICK_STROKE_WIDTH, color, 1);
                    length = VoltmeterView.MINOR_TICK_LENGTH;
                }
                
                // Positive tick mark
                vec.set(-radius, 0).rotate(angle);
                graphics.moveTo(vec.x, vec.y);
                vec.set(-radius + length, 0).rotate(angle);
                graphics.lineTo(vec.x, vec.y);
                
                // // Negative tick mark
                vec.set(radius, 0).rotate(-angle);
                graphics.moveTo(vec.x, vec.y);
                vec.set(radius - length, 0).rotate(-angle);
                graphics.lineTo(vec.x, vec.y);
                
                angle += VoltmeterView.MINOR_TICK_SPACING;
                tickCount++;
            }
        },

        drawNeedle: function() {
            var pivot = this._pivot.set(this.mvt.modelToViewDelta(VoltmeterView.PIVOT_POINT));
            var graphics = this.needle;
            var length     = this.mvt.modelToViewDeltaX(VoltmeterView.NEEDLE_LENGTH);
            var headWidth  = this.mvt.modelToViewDeltaX(VoltmeterView.NEEDLE_HEAD_WIDTH);
            var headLength = this.mvt.modelToViewDeltaX(VoltmeterView.NEEDLE_HEAD_HEIGHT);
            var tailWidth  = this.mvt.modelToViewDeltaX(VoltmeterView.NEEDLE_TAIL_WIDTH);
            var screwRadius = Math.floor(this.mvt.modelToViewDeltaX(VoltmeterView.SCREW_DIAMETER) / 2);

            graphics.clear();
            graphics.x = pivot.x;
            graphics.y = pivot.y;

            graphics.beginFill(this.needleColor, 1);
            graphics.moveTo(pivot.x, pivot.y);
            graphics.drawArrow(0, 0, 0, -length, tailWidth, headWidth, headLength);
            graphics.endFill();

            graphics.beginFill(this.screwColor, 1);
            graphics.drawCircle(0, 0, screwRadius);
            graphics.endFill();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var scale = this.mvt.modelToViewDeltaX(1);
            this.background.scale.x = scale;
            this.background.scale.y = scale;

            this.drawTicks();
            this.drawNeedle();

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        updateVisibility: function(model, enabled) {
            this.displayObject.visible = enabled;
        },

        update: function() {
            var angle = this.model.get('needleAngle');
            this.needle.rotation = angle;
        }

    }, Constants.VoltmeterView);


    return VoltmeterView;
});