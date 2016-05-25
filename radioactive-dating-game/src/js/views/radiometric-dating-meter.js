define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/create-drop-shadow');
                         require('common/v3/pixi/dash-to');
    var HybridView     = require('common/v3/pixi/view/hybrid');
    var Colors         = require('common/colors/colors');
    var Rectangle      = require('common/math/rectangle');
    var Vector2        = require('common/math/vector2');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var RadiometricDatingMeter = require('radioactive-dating-game/models/radiometric-dating-meter');

    var Constants = require('constants');
    var Assets    = require('assets');

    // CSS
    require('less!radioactive-dating-game/styles/meter-panel');

    // HTML
    var panelHtml = require('text!radioactive-dating-game/templates/meter-panel.html');

    /**
     * The view that controls the radiometric dating meter.  It includes both a
     *   .displayObject (the detector and wire as Pixi objects) and .el (the
     *   panel as HTML).
     */
    var RadiometricDatingMeterView = HybridView.extend({

        htmlEvents: {
            'click .probe-type-carbon-14'   : 'selectCarbon14',
            'click .probe-type-uranium-238' : 'selectUranium238',
            'click .probe-type-custom'      : 'selectCustom',

            'click .measuring-target-objects' : 'setTargetToObjects',
            'click .measuring-target-air'     : 'setTargetToAir',

            'change .half-life' : 'changeHalfLife'
        },

        events: {
            'touchstart      .geigerProbe': 'dragStart',
            'mousedown       .geigerProbe': 'dragStart',
            'touchmove       .geigerProbe': 'drag',
            'mousemove       .geigerProbe': 'drag',
            'touchend        .geigerProbe': 'dragEnd',
            'mouseup         .geigerProbe': 'dragEnd',
            'touchendoutside .geigerProbe': 'dragEnd',
            'mouseupoutside  .geigerProbe': 'dragEnd'
        },

        template: _.template(panelHtml),

        /**
         * Initializes the new RadiometricDatingMeterView.
         */
        initialize: function(options) {
            options = _.extend({
                panelWidth: 190,
                panelHeight: 176,
                padding: 15,
                includeCustom: false
            }, options);

            this.simulation = options.simulation;
            this.mvt = options.mvt;
            this.panelWidth = options.panelWidth;
            this.panelHeight = options.panelHeight;
            this.padding = options.padding;
            this.includeCustom = options.includeCustom;

            this.tubeAnimationSpeed = 80;
            this.cordColor = 0x000000;
            this.cordWidth = 3;

            this.anchorPoint = new Vector2(this.panelWidth / 2, this.panelHeight);
            this._probeTail = new Vector2();
            this._vec = new Vector2();
            this._viewPosition = new Vector2();
            this._lastPosition = new PIXI.Point();

            // Initialize the graphics
            this.initGraphics();

            this.listenTo(this.model, 'change:nucleusType', this.nucleusTypeChanged);
            this.listenTo(this.model, 'change:position',    this.updatePosition);
            this.listenTo(this.simulation, 'change:mode',   this.simulationModeChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initTube();
            this.initGeigerProbe();
            
            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.$el.append(this.template({
                unique: this.model.cid,
                includeCustom: this.includeCustom
            }));

            this.$panel = this.$el.find('.meter-panel');
            this.$panel.width(this.panelWidth);
            this.$panel.height(this.panelHeight);

            this.$readoutValue = this.$el.find('.readout-value');

            this.$el.find('select').selectpicker();
        },

        initTube: function() {
            this.tube = Assets.createSprite(Assets.Images.AIR_PROBE);
            this.tube.anchor.x = 0.5;
            this.tube.scale.x = this.tube.scale.y = 0.5;
            this.tube.y = -this.tube.height;
            this.tubeOutY = -this.tube.height * 0.5;
            this.tubeInY = -this.tube.height;

            var mask = new PIXI.Graphics();
            mask.beginFill();
            mask.drawRect(-this.panelWidth / 2, 0, this.panelWidth, this.tube.height);
            mask.endFill();
            this.tube.mask = mask;

            this.tubeContainer = new PIXI.Container();
            this.tubeContainer.addChild(this.tube);
            this.tubeContainer.addChild(mask);

            this.displayObject.addChild(this.tubeContainer);
        },

        initGeigerProbe: function() {
            this.geigerProbe = Assets.createSprite(Assets.Images.GEIGER_PROBE);
            this.geigerProbe.anchor.x = 0.5;
            this.geigerProbe.rotation = 2.03444393579;
            this.geigerProbe.x = 400;
            this.geigerProbe.y = 400;
            this.geigerProbe.buttonMode = true;

            this.geigerCord = new PIXI.Graphics();

            this.geigerContainer = new PIXI.Container();
            this.geigerContainer.addChild(this.geigerCord);
            this.geigerContainer.addChild(this.geigerProbe);

            this.displayObject.addChild(this.geigerContainer);
        },

        drawCord: function() {
            var graphics = this.geigerCord;

            var tipToTailVec = this._vec
                .set(0, this.geigerProbe.height)
                .rotate(this.geigerProbe.rotation);

            var probeTail = this._probeTail
                .set(this.geigerProbe.x, this.geigerProbe.y)
                .add(tipToTailVec);

            graphics.clear();
            graphics.lineStyle(this.cordWidth, this.cordColor, 1);
            graphics.moveTo(this.anchorPoint.x, this.anchorPoint.y);
            graphics.lineTo(probeTail.x, probeTail.y);

            graphics.lineStyle(0, 0, 0);

            graphics.beginFill(this.cordColor, 1);
            graphics.drawCircle(probeTail.x, probeTail.y, 4);
            graphics.endFill();

            graphics.beginFill(this.cordColor, 1);
            graphics.drawCircle(this.anchorPoint.x, this.anchorPoint.y, 6);
            graphics.endFill();
        },

        update: function(time, deltaTime, paused) {
            if (this.model.get('measurementMode') === RadiometricDatingMeter.OBJECTS) {
                if (this.tube.y > this.tubeInY) {
                    this.tube.y -= this.tubeAnimationSpeed * deltaTime;
                    if (this.tube.y <= this.tubeInY) {
                        this.tube.y = this.tubeInY;
                        this.geigerContainer.visible = true;
                    }
                }
            }
            else {
                this.geigerContainer.visible = false;

                if (this.tube.y < this.tubeOutY) {
                    this.tube.y += this.tubeAnimationSpeed * deltaTime;
                    if (this.tube.y > this.tubeOutY)
                        this.tube.y = this.tubeOutY;
                }
            }

            if (!paused) {
                this.updateReadout();
            }
        },

        updateReadout: function() {
            var percentage = this.model.getPercentageOfDatingElementRemaining();
            if (percentage !== this._percentage) {
                this._percentage = percentage;
                if (isNaN(percentage))
                    this.$readoutValue.html('--');
                else if (Math.round(percentage) === 100)
                    this.$readoutValue.html(Math.round(percentage) + '%');
                else
                    this.$readoutValue.html(percentage.toFixed(1) + '%');
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetHeight = this.mvt.modelToViewDeltaX(100);
            var scale = targetHeight / this.geigerProbe.texture.height;
            this.geigerProbe.scale.x = scale;
            this.geigerProbe.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));

            this.drawCord();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.geigerProbe.x = viewPosition.x;
            this.geigerProbe.y = viewPosition.y;
            this.drawCord();

            // If we're paused, we still want it to work, but this is overkill if it's not paused.
            if (this.simulation.get('paused')) {
                this.simulation.updateMeter();
                this.updateReadout();
            }
        },

        dragStart: function(event) {
            this._lastPosition.x = event.data.global.x;
            this._lastPosition.y = event.data.global.y;

            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this._lastPosition.x;
                var dy = event.data.global.y - this._lastPosition.y;

                var viewPosition = this._viewPosition.set(this.geigerProbe.x + dx, this.geigerProbe.y + dy);
                var modelPosition = this.mvt.viewToModel(viewPosition);
                this.model.setPosition(modelPosition);

                this._lastPosition.x = event.data.global.x;
                this._lastPosition.y = event.data.global.y;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        setAnchorPoint: function(x, y) {
            this.anchorPoint.x = x;
            this.anchorPoint.y = y;

            this.tubeContainer.x = x;
            this.tubeContainer.y = y;

            this.drawCord();
        },

        setPanelPosition: function(x, y) {
            this.$el.find('.meter-panel').css({
                left: x + 'px',
                top: y + 'px'
            });

            this.setAnchorPoint(
                x + this.panelWidth / 2,
                y + this.panelHeight
            );
        },

        getPanelWidth: function() {
            return this.panelWidth;
        },

        getPanelHeight: function() {
            return this.panelHeight;
        },

        setTargetToObjects: function() {
            this.model.set('measurementMode', RadiometricDatingMeter.OBJECTS);
            this.updateReadout();
            this.$el.find('.measuring-target-objects').addClass('selected');
            this.$el.find('.measuring-target-air').removeClass('selected');
        },

        setTargetToAir: function() {
            this.model.set('measurementMode', RadiometricDatingMeter.AIR);
            this.updateReadout();
            this.$el.find('.measuring-target-air').addClass('selected');
            this.$el.find('.measuring-target-objects').removeClass('selected');
        },

        selectCarbon14: function() {
            this.model.set('nucleusType', NucleusType.CARBON_14);
            this.hideCustomOptions();
        },

        selectUranium238: function() {
            this.model.set('nucleusType', NucleusType.URANIUM_238);
            this.hideCustomOptions();
        },

        selectCustom: function() {
            this.model.set('nucleusType', NucleusType.HEAVY_CUSTOM);
            this.showCustomOptions();
        },

        showCustomOptions: function() {
            this.$el.find('.custom-options-wrapper').show();
        },

        hideCustomOptions: function() {
            this.$el.find('.custom-options-wrapper').hide();
        },

        changeHalfLife: function(event) {
            var years = parseInt($(event.target).val());
            var ms = HalfLifeInfo.convertYearsToMs(years);
            this.model.set('halfLifeOfCustomNucleus', ms);
        },

        nucleusTypeChanged: function(model, nucleusType) {
            var text;
            if (nucleusType === NucleusType.CARBON_14)
                text = 'Carbon-14';
            else if (nucleusType === NucleusType.URANIUM_238)
                text = 'Uranium-238';
            else
                text = 'Custom';
            
            this.$el.find('.readout-label').html(text + ':');
            this.updateReadout();
        },

        simulationModeChanged: function() {
            this.updateReadout();
        }

    });


    return RadiometricDatingMeterView;
});