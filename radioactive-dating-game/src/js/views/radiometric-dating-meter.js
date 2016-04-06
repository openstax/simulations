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
            'click .measuring-target-objects' : 'setTargetToObjects',
            'click .measuring-target-air'     : 'setTargetToAir'
        },

        events: {

        },

        template: _.template(panelHtml),

        /**
         * Initializes the new RadiometricDatingMeterView.
         */
        initialize: function(options) {
            options = _.extend({
                panelWidth: 190,
                panelHeight: 216,
                padding: 15
            }, options);

            this.simulation = options.simulation;
            this.mvt = options.mvt;
            this.panelWidth = options.panelWidth;
            this.panelHeight = options.panelHeight;
            this.padding = options.padding;
            this.tubeAnimationSpeed = 80;

            this.anchorPoint = new Vector2(this.panelWidth / 2, this.panelHeight);

            // Initialize the graphics
            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initTube();
            
            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.$el.append(this.template({
                unique: this.model.cid
            }));

            this.$panel = this.$el.find('.meter-panel');
            this.$panel.width(this.panelWidth);
            this.$panel.height(this.panelHeight);
        },

        initTube: function() {
            this.tube = Assets.createSprite(Assets.Images.AIR_PROBE);
            this.tube.anchor.x = 0.5;
            this.tube.scale.x = this.tube.scale.y = 0.5;
            this.tube.y = -this.tube.height;
            this.tubeOutY = -this.tube.height * 0.5;

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

        update: function(time, deltaTime, paused) {
            if (this.model.get('measurementMode') === RadiometricDatingMeter.OBJECTS) {
                if (this.tube.y > -this.tube.height)
                    this.tube.y = Math.max(this.tube.y - this.tubeAnimationSpeed * deltaTime, -this.tube.height);
            }
            else {
                if (this.tube.y < this.tubeOutY)
                    this.tube.y = Math.min(this.tube.y + this.tubeAnimationSpeed * deltaTime, this.tubeOutY);
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        setAnchorPoint: function(x, y) {
            this.anchorPoint.x = x;
            this.anchorPoint.y = y;

            this.tubeContainer.x = x;
            this.tubeContainer.y = y;
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
            return this.panelHeight
        },

        setTargetToObjects: function() {
            this.model.set('measurementMode', RadiometricDatingMeter.OBJECTS);
        },

        setTargetToAir: function() {
            this.model.set('measurementMode', RadiometricDatingMeter.AIR);
        }

    });


    return RadiometricDatingMeterView;
});