define(function(require) {

    'use strict';

    var $ = require('jquery');
    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/pixi/view/slider');
    var Vector2    = require('common/math/vector2');

    var EnergySourceView = require('views/energy-source');

    var Constants = require('constants');
    var Biker = Constants.Biker;

    var Assets = require('assets');

    var backLegTextures = [
        Assets.Images.BACK_LEG_01,
        Assets.Images.BACK_LEG_02,
        Assets.Images.BACK_LEG_03,
        Assets.Images.BACK_LEG_04,
        Assets.Images.BACK_LEG_05,
        Assets.Images.BACK_LEG_06,
        Assets.Images.BACK_LEG_07,
        Assets.Images.BACK_LEG_08,
        Assets.Images.BACK_LEG_09,
        Assets.Images.BACK_LEG_10,
        Assets.Images.BACK_LEG_11,
        Assets.Images.BACK_LEG_12,
        Assets.Images.BACK_LEG_13,
        Assets.Images.BACK_LEG_14,
        Assets.Images.BACK_LEG_15,
        Assets.Images.BACK_LEG_16,
        Assets.Images.BACK_LEG_17,
        Assets.Images.BACK_LEG_18,
        Assets.Images.BACK_LEG_19,
        Assets.Images.BACK_LEG_20,
        Assets.Images.BACK_LEG_21,
        Assets.Images.BACK_LEG_22,
        Assets.Images.BACK_LEG_23,
        Assets.Images.BACK_LEG_24
    ];

    var frontLegTextures = [
        Assets.Images.FRONT_LEG_01,
        Assets.Images.FRONT_LEG_02,
        Assets.Images.FRONT_LEG_03,
        Assets.Images.FRONT_LEG_04,
        Assets.Images.FRONT_LEG_05,
        Assets.Images.FRONT_LEG_06,
        Assets.Images.FRONT_LEG_07,
        Assets.Images.FRONT_LEG_08,
        Assets.Images.FRONT_LEG_09,
        Assets.Images.FRONT_LEG_10,
        Assets.Images.FRONT_LEG_11,
        Assets.Images.FRONT_LEG_12,
        Assets.Images.FRONT_LEG_13,
        Assets.Images.FRONT_LEG_14,
        Assets.Images.FRONT_LEG_15,
        Assets.Images.FRONT_LEG_16,
        Assets.Images.FRONT_LEG_17,
        Assets.Images.FRONT_LEG_18,
        Assets.Images.FRONT_LEG_19,
        Assets.Images.FRONT_LEG_20,
        Assets.Images.FRONT_LEG_21,
        Assets.Images.FRONT_LEG_22,
        Assets.Images.FRONT_LEG_23,
        Assets.Images.FRONT_LEG_24
    ];

    var texturesInitialized = false;
    var initTextures = function() {
        var i;
        for (i = 0; i < backLegTextures.length; i++)
            backLegTextures[i] = Assets.Texture(backLegTextures[i]);
        for (i = 0; i < frontLegTextures.length; i++)
            frontLegTextures[i] = Assets.Texture(frontLegTextures[i]);
        texturesInitialized = true;
    };

    var BikerView = EnergySourceView.extend({

        initialize: function(options) {
            // This is a hybrid PIXI/HTML view
            this.el = document.createElement('div');
            this.$el = $(this.el);

            EnergySourceView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:bikerHasEnergy', this.bikerStateChanged);
            this.listenTo(this.model, 'change:rearWheelAngle', this.updateRearWheelAngle);
            this.listenTo(this.model, 'change:crankAngle',     this.updateCrankAngle);
            this.listenTo(this.model, 'change:active',         this.updateFeedMeButton);

            this.bikerStateChanged(this.model, this.model.get('bikerHasEnergy'));
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            this.initImages();
            this.initControls();
        },

        initImages: function() {
            if (!texturesInitialized)
                initTextures();

            var legImageOffset = this.mvt.modelToViewDelta(new Vector2(0.009, 0.002).add(Biker.FRAME_CENTER_OFFSET));

            var backLeg  = new PIXI.MovieClip(backLegTextures);
            var frontLeg = new PIXI.MovieClip(frontLegTextures);

            backLeg.x = frontLeg.x = legImageOffset.x;
            backLeg.y = frontLeg.y = legImageOffset.y;

            backLeg.anchor.x = frontLeg.anchor.x = 0.5;
            backLeg.anchor.y = frontLeg.anchor.y = 0.5;

            backLeg.scale.x = frontLeg.scale.x = this.getImageScale();
            backLeg.scale.y = frontLeg.scale.y = this.getImageScale();

            var frame      = this.createSpriteWithOffset(Assets.Images.BICYCLE_FRAME_3,     Biker.FRAME_CENTER_OFFSET);
            var spokes     = this.createSpriteWithOffset(Assets.Images.BICYCLE_SPOKES,      new Vector2( 0.035, -0.020 ).add(Biker.FRAME_CENTER_OFFSET), 0.5);
            var rider      = this.createSpriteWithOffset(Assets.Images.BICYCLE_RIDER,       new Vector2(-0.0025, 0.0620).add(Biker.FRAME_CENTER_OFFSET));
            var riderTired = this.createSpriteWithOffset(Assets.Images.BICYCLE_RIDER_TIRED, new Vector2(-0.0032, 0.056 ).add(Biker.FRAME_CENTER_OFFSET));

            this.riderNormal = rider;
            this.riderTired  = riderTired;
            this.spokes      = spokes;
            this.backLeg     = backLeg;
            this.frontLeg    = frontLeg;

            this.displayObject.addChild(backLeg);
            this.displayObject.addChild(spokes);
            this.displayObject.addChild(frame);
            this.displayObject.addChild(rider);
            this.displayObject.addChild(riderTired);
            this.displayObject.addChild(frontLeg);
        },

        initControls: function() {
            // Create a panel
            var panel = new PIXI.DisplayObjectContainer();
            var panelOffset =  this.mvt.modelToViewDelta(BikerView.PANEL_OFFSET).clone();
            var panelWidth  =  this.mvt.modelToViewDeltaX(BikerView.PANEL_WIDTH);
            var panelHeight = -this.mvt.modelToViewDeltaY(BikerView.PANEL_HEIGHT);

            // Paint it
            var panelRgba = Colors.toRgba($('.energy-system-elements-panel').css('background-color'), true);
            var panelColor = Colors.rgbToHexInteger(panelRgba.r, panelRgba.g, panelRgba.b);
            var panelAlpha = panelRgba.a;

            var panelBackground = new PIXI.Graphics();
            panelBackground.beginFill(panelColor, panelAlpha);
            panelBackground.drawRect(0, 0, panelWidth, panelHeight);
            panelBackground.endFill();
            panel.addChild(panelBackground);

            // Move it
            panel.x = panelOffset.x;
            panel.y = panelOffset.y;
            
            // Add it
            this.displayObject.addChild(panel);

            // Create slider
            var sliderView = new SliderView({
                start: 0,
                range: {
                    min: 0,
                    max: Constants.Biker.MAX_ANGULAR_VELOCITY_OF_CRANK
                },

                width: panelWidth * 0.39,
                backgroundHeight: 3,
                backgroundAlpha: 0.5,
                handleSize: 12,
            });

            // Position it
            sliderView.displayObject.x = (panelWidth - sliderView.background.width) / 2;
            sliderView.displayObject.y = panelHeight / 2;

            // Bind events for it
            this.listenTo(sliderView, 'slide', function(value, prev) {
                this.model.set('targetCrankAngularVelocity', value);
            });
            this.listenTo(this.model, 'change:active', function(model, active) {
                if (!active)
                    sliderView.val(0);
            });

            // Add it
            panel.addChild(sliderView.displayObject);

            // Create labels
            var textStyle = {
                font: Math.round(BikerView.LABEL_FONT_SIZE * this.getImageScale()) + 'px ' + BikerView.LABEL_FONT_FAMILY,
                fill: BikerView.LABEL_COLOR
            };

            var slow = new PIXI.Text('Slow', textStyle);
            slow.anchor.y = 0.5;
            slow.x = 15 * this.getImageScale();
            slow.y = panelHeight * 0.5;
            panel.addChild(slow);

            var fast = new PIXI.Text('Fast', textStyle);
            fast.anchor.x = 1;
            fast.anchor.y = 0.5;
            fast.x = panelWidth - 15 * this.getImageScale();
            fast.y = panelHeight * 0.5;
            panel.addChild(fast);

            // Create button
            var self = this;
            this.$button = $('<button class="btn feed-me-btn">Feed Me</button>');
            this.$button.on('click', function() {
                self.feedMeClicked();
            });

            // Add button
            this.$el.append(this.$button);
        },

        bikerStateChanged: function(model, bikerHasEnergy) {
            this.riderNormal.visible =  bikerHasEnergy;
            this.riderTired.visible  = !bikerHasEnergy;

            this.updateFeedMeButton();
        },

        updateRearWheelAngle: function(model, rearWheelAngle) {
            this.spokes.rotation = -rearWheelAngle;
        },

        updateCrankAngle: function(model, crankAngle) {
            var index = model.mapAngleToImageIndex(crankAngle);
            this.backLeg.gotoAndStop(index);
            this.frontLeg.gotoAndStop(index);
        },

        updateFeedMeButton: function() {
            if (this.model.active() && !this.model.get('bikerHasEnergy'))
                this.$button.show();
            else
                this.$button.hide();
        },

        feedMeClicked: function() {
            this.model.replenishEnergyChunks();
        }

    }, Constants.BikerView);

    return BikerView;
});