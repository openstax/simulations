define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Nucleon = require('models/nucleon');

    var NucleonView          = require('views/nucleon');
    var ExplodingNucleusView = require('views/nucleus/exploding');
    
    var Assets = require('assets');
    var Constants = require('constants');

    var REACTOR_WALL_COLOR = Colors.parseHex(Constants.NuclearReactorView.REACTOR_WALL_COLOR);
    var CHAMBER_WALL_COLOR = Colors.parseHex(Constants.NuclearReactorView.CHAMBER_WALL_COLOR);
    var CONTROL_ROD_COLOR  = Colors.parseHex(Constants.NuclearReactorView.CONTROL_ROD_COLOR);
    var CONTROL_ROD_ADJUSTOR_COLOR = Colors.parseHex(Constants.NuclearReactorView.CONTROL_ROD_ADJUSTOR_COLOR);
    var CONTROL_ROD_ADJUSTOR_HANDLE_COLOR = Colors.parseHex(Constants.NuclearReactorView.CONTROL_ROD_ADJUSTOR_HANDLE_COLOR);

    /**
     * A view that represents a nuclear reactor
     */
    var NuclearReactorView = PixiView.extend({

        events: {
            'touchstart .button': 'click',
            'mousedown  .button': 'click',

            'touchstart      .controlRodAdjustor': 'dragStart',
            'mousedown       .controlRodAdjustor': 'dragStart',
            'touchmove       .controlRodAdjustor': 'drag',
            'mousemove       .controlRodAdjustor': 'drag',
            'touchend        .controlRodAdjustor': 'dragEnd',
            'mouseup         .controlRodAdjustor': 'dragEnd',
            'touchendoutside .controlRodAdjustor': 'dragEnd',
            'mouseupoutside  .controlRodAdjustor': 'dragEnd'
        },

        /**
         * Initializes the new NuclearReactorView.
         */
        initialize: function(options) {
            options = _.extend({
                cooldownTime: 0.4
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.cooldownTime = options.cooldownTime;
            this.cooldownTimer = 0;

            // Cached objects
            this._dragOffset = new PIXI.Point();
            this._rect = new Rectangle();

            this.initGraphics();

            this.listenTo(this.simulation.freeNeutrons, 'add',     this.neutronAdded);
            this.listenTo(this.simulation.freeNeutrons, 'destroy', this.neutronDestroyed);

            this.listenTo(this.simulation, 'nucleus-added',        this.nucleusAdded);
            this.listenTo(this.simulation, 'nucleus-removed',      this.nucleusRemoved);
            this.listenTo(this.simulation, 'remove-all-particles', this.allParticlesRemoved);

            this.listenTo(this.simulation, 'change:temperature', this.temperatureChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initBackground();
            this.initOutline();
            this.initParticles();
            this.initButton();
            this.initStartingNuclei();
            this.initControlRods();

            this.updateMVT(this.mvt);
        },

        initBackground: function() {
            this.backgroundGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.backgroundGraphics);
        },

        initOutline: function() {
            this.outlineGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.outlineGraphics);
        },

        initParticles: function() {
            this.neutronViews = [];
            this.nucleusViews = [];

            this.neutronLayer = new PIXI.Container();
            this.nucleusLayer = new PIXI.Container();

            this.displayObject.addChild(this.neutronLayer);
            this.displayObject.addChild(this.nucleusLayer);
        },

        initButton: function() {
            this.pressedButtonTexture   = Assets.Texture(Assets.Images.FIRE_BUTTON_PRESSED);
            this.unpressedButtonTexture = Assets.Texture(Assets.Images.FIRE_BUTTON_UNPRESSED);

            var targetWidth = NuclearReactorView.BUTTON_WIDTH;
            var scale = targetWidth / this.pressedButtonTexture.width;
            var paddingLeft = 14;
            var paddingTop = 10;

            this.button = new PIXI.Sprite(this.unpressedButtonTexture);
            this.button.buttonMode = true;
            this.button.defaultCursor = 'pointer';
            this.button.anchor.x = 0.5;
            this.button.anchor.y = 0.5;
            this.button.scale.x = this.button.scale.y = scale;
            this.button.x = paddingLeft + this.button.width / 2;
            this.button.y = paddingTop + this.button.height / 2;

            var label = new PIXI.Text('Fire Neutrons', {
                font: NuclearReactorView.BUTTON_LABEL_FONT,
                fill: NuclearReactorView.BUTTON_LABEL_COLOR
            });
            label.x = NuclearReactorView.BUTTON_WIDTH + paddingLeft * 2;
            label.y = NuclearReactorView.BUTTON_PANEL_HEIGHT / 2;
            label.anchor.y = 0.5;
            label.resolution = this.getResolution();

            this.buttonPanel = new PIXI.Graphics();
            this.buttonPanel.addChild(this.button);
            this.buttonPanel.addChild(label);

            this.buttonPanel.lineStyle(NuclearReactorView.BUTTON_PANEL_BORDER_WIDTH, REACTOR_WALL_COLOR, 1);
            this.buttonPanel.beginFill(Colors.parseHex(NuclearReactorView.COOL_REACTOR_CHAMBER_COLOR), 1);
            this.buttonPanel.drawRect(0, 0, NuclearReactorView.BUTTON_PANEL_WIDTH, NuclearReactorView.BUTTON_PANEL_HEIGHT);
            this.buttonPanel.endFill();

            this.displayObject.addChild(this.buttonPanel);
        },

        initStartingNuclei: function() {
            for (var i = 0; i < this.simulation.u235Nuclei.length; i++)
                this.nucleusAdded(this.simulation.u235Nuclei.at(i));
        },

        initControlRods: function() {
            this.controlRodAdjustor = new PIXI.Graphics();
            this.controlRodAdjustor.buttonMode = true;
            this.controlRodAdjustor.defaultCursor = 'ns-resize';

            this.controlRods = new PIXI.Graphics();
            this.controlRods.addChild(this.controlRodAdjustor);

            this.displayObject.addChild(this.controlRods);
        },

        createParticleView: function(particle) {
            if (particle instanceof Nucleon) {
                // Add a visible representation of the nucleon to the canvas.
                return new NucleonView({
                    model: particle,
                    mvt: this.mvt
                });
            }
            else {
                // There is some unexpected object in the list of constituents
                //   of the nucleus.  This should never happen and should be
                //   debugged if it does.
                throw 'unexpected particle';
            }
        },

        drawBackground: function() {
            var wallWidth = this.mvt.modelToViewDeltaX(this.simulation.getReactorWallWidth());
            var outerRect = this.mvt.modelToView(this.simulation.getReactorRect());
            var graphics = this.backgroundGraphics;

            graphics.clear();
            graphics.beginFill(this.getInternalReactorColor(), 1);
            graphics.drawRect(
                outerRect.left() + wallWidth / 2, outerRect.bottom() + wallWidth / 2,
                outerRect.w - wallWidth, outerRect.h - wallWidth
            );
            graphics.endFill();
        },

        drawOutline: function() {
            var wallWidth = this.mvt.modelToViewDeltaX(this.simulation.getReactorWallWidth());
            var outerRect = this._rect.set(this.mvt.modelToView(this.simulation.getReactorRect()));
            var graphics = this.outlineGraphics;

            graphics.clear();
            graphics.lineStyle(wallWidth, REACTOR_WALL_COLOR, 1);
            graphics.drawRect(
                outerRect.left() + wallWidth / 2, outerRect.bottom() + wallWidth / 2,
                outerRect.w - wallWidth, outerRect.h - wallWidth
            );

            graphics.lineStyle(1, CHAMBER_WALL_COLOR, 1);
            var y1 = outerRect.bottom() + wallWidth;
            var y2 = outerRect.top() - wallWidth;
            var controlRods = this.simulation.controlRods;
            for (var i = 0; i < controlRods.length; i++) {
                var rect = this.mvt.modelToView(controlRods[i].getRectangle());

                graphics.moveTo(Math.round(rect.left()), y1);
                graphics.lineTo(Math.round(rect.left()), y2);

                graphics.moveTo(Math.round(rect.right()), y1);
                graphics.lineTo(Math.round(rect.right()), y2);
            }
        },

        drawControlRods: function() {
            var wallWidth = this.mvt.modelToViewDeltaX(this.simulation.getReactorWallWidth());
            var outerRect = this._rect.set(this.mvt.modelToView(this.simulation.getReactorRect()));
            var graphics = this.controlRods;
            var minX = Number.POSITIVE_INFINITY;
            var rodWidth;

            graphics.clear();
            graphics.beginFill(CONTROL_ROD_COLOR, 1);

            var y1 = outerRect.bottom() + wallWidth;
            var y2 = outerRect.top() + wallWidth;
            var controlRods = this.simulation.controlRods;
            for (var i = 0; i < controlRods.length; i++) {
                var rect = this.mvt.modelToView(controlRods[i].getRectangle());
                var left = Math.round(rect.left()) - 1;
                var right = Math.round(rect.right()) + 1;
                rodWidth = right - left;

                graphics.drawRect(left, y1, rodWidth, (y2 - y1));

                if (left < minX)
                    minX = left;
            }

            graphics.endFill();

            // Draw the adjustor
            var adjustorRight = outerRect.right() + 10 + rodWidth;
            var adjustor = this.controlRodAdjustor;
            adjustor.clear();
            adjustor.beginFill(CONTROL_ROD_ADJUSTOR_COLOR, 1);
            adjustor.drawRect(minX, y2, (adjustorRight - minX), rodWidth);
            adjustor.drawRect(adjustorRight - rodWidth, y1, rodWidth, (y2 - y1));
            adjustor.endFill();

            // Draw the handle
            var handleHeight = 130;
            var handleWidth = 20;
            var handleThickness = 10;
            var handleRadius = handleThickness / 2;
            adjustor.beginFill(CONTROL_ROD_ADJUSTOR_HANDLE_COLOR, 1);
            adjustor.drawRect(adjustorRight, y1, handleWidth - handleRadius, handleThickness);
            adjustor.drawRect(adjustorRight, y1 + handleHeight - handleThickness, handleWidth - handleRadius, handleThickness);
            adjustor.drawRoundedRect(adjustorRight + handleWidth - handleThickness, y1, handleThickness, handleHeight, handleRadius);
            adjustor.endFill();

            // Create the label
            adjustor.removeChildren();
            var label = new PIXI.Text('Control Rod Adjustor', {
                font: NuclearReactorView.CONTROL_ROD_ADJUSTOR_LABEL_FONT,
                fill: NuclearReactorView.CONTROL_ROD_ADJUSTOR_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.anchor.y = 0.5;
            label.rotation = -Math.PI / 2;
            label.x = adjustorRight - rodWidth / 2;
            label.y = y2;

            adjustor.addChild(label);
        },

        getInternalReactorColor: function() {
            var reactorTemperature = this.simulation.get('temperature');
            if (reactorTemperature > NuclearReactorView.MAX_TEMPERATURE)
                reactorTemperature = NuclearReactorView.MAX_TEMPERATURE;
            
            // Blend the hot and cold colors together based on the current temp.
            var weighting = (NuclearReactorView.MAX_TEMPERATURE - reactorTemperature) / NuclearReactorView.MAX_TEMPERATURE;
            
            var hex = Colors.interpolateHex(
                NuclearReactorView.COOL_REACTOR_CHAMBER_COLOR, 
                NuclearReactorView.HOT_REACTOR_CHAMBER_COLOR, 
                weighting
            );

            return Colors.parseHex(hex);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var outerRect = this.mvt.modelToView(this.simulation.getReactorRect());
            this.buttonPanel.x = outerRect.left() + outerRect.w / 2 - NuclearReactorView.BUTTON_PANEL_WIDTH / 2
            this.buttonPanel.y = outerRect.bottom() - NuclearReactorView.BUTTON_PANEL_HEIGHT + NuclearReactorView.BUTTON_PANEL_BORDER_WIDTH / 2;

            this.drawBackground();
            this.drawOutline();
            this.drawControlRods();
        },

        update: function(time, deltaTime, paused) {
            if (this.cooldownTimer > 0) {
                this.cooldownTimer -= deltaTime;

                // Check to see if it has cooled down
                if (this.cooldownTimer <= 0) {
                    this.cooldownTimer = 0;
                    this.showUnpressedButtonTexture();
                }
            }

            var i;

            for (i = 0; i < this.neutronViews.length; i++)
                this.neutronViews[i].update(time, deltaTime, paused);

            for (i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].update(time, deltaTime, paused);
        },

        dragStart: function(event) {
            this.dragging = true;

            
        },

        drag: function(event) {
            if (this.dragging) {
                
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        click: function() {
            // Only fire it if it has cooled down
            if (this.cooldownTimer === 0) {
                this.cooldownTimer = this.cooldownTime;
                this.simulation.fireNeutrons();
                this.showPressedButtonTexture();
            }
        },

        showPressedButtonTexture: function() {
            this.button.texture = this.pressedButtonTexture;
        },

        showUnpressedButtonTexture: function() {
            this.button.texture = this.unpressedButtonTexture;
        },

        neutronAdded: function(neutron) {
            var nucleonView = this.createParticleView(neutron);
            this.neutronViews.push(nucleonView);
            this.neutronLayer.addChild(nucleonView.displayObject);
        },

        neutronDestroyed: function(nucleon) {
            for (var i = 0; i < this.neutronViews.length; i++) {
                if (this.neutronViews[i].model === nucleon) {
                    this.neutronViews[i].remove();
                    this.neutronViews.splice(i, 1);
                    return;
                }
            }
        },

        nucleusAdded: function(nucleus) {
            var nucleusView = new ExplodingNucleusView({
                model: nucleus,
                mvt: this.mvt,
                renderer: this.renderer
            });

            this.nucleusViews.push(nucleusView);
            this.nucleusLayer.addChild(nucleusView.displayObject);
        },

        nucleusRemoved: function(nucleus) {
            for (var i = 0; i < this.nucleusViews.length; i++) {
                if (this.nucleusViews[i].model === nucleus) {
                    this.nucleusViews[i].remove();
                    this.nucleusViews.splice(i, 1);
                    return;
                }
            }
        },

        nucleusChanged: function() {
            if (this.simulation.getChangedNucleiExist())
                this.showResetButtonWithDelay();
        },

        numReactiveNucleiChanged: function() {
            if (!this.simulation.getChangedNucleiExist())
                this.hideResetButton();
        },

        allParticlesRemoved: function() {
            var i;

            for (i = this.nucleusViews.length - 1; i >= 0; i--) {
                this.nucleusViews[i].remove();
                this.nucleusViews.splice(i, 1);
            }

            for (i = 0; i < this.neutronViews.length; i++) {
                this.neutronViews[i].remove();
                this.neutronViews.splice(i, 1);
            }
        },

        temperatureChanged: function() {
            this.drawBackground();
        }

    }, Constants.NuclearReactorView);


    return NuclearReactorView;
});