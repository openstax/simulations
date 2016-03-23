define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiView  = require('common/v3/pixi/view');
    var Rectangle = require('common/math/rectangle');
    var Vector2   = require('common/math/vector2');

    var NucleusView = require('views/nucleus');

    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A visual representation of some kind of object supply.  The
     *   user creates new objects with this view.  Dragging from 
     *   the view creates a new object and places it in the scene,
     *   while dragging an existing object back onto this view
     *   destroys it.
     */
    var AtomCanisterView = PixiView.extend({

        events: {
            'touchstart      .backgroundLayer': 'dragStart',
            'mousedown       .backgroundLayer': 'dragStart',
            'touchmove       .backgroundLayer': 'drag',
            'mousemove       .backgroundLayer': 'drag',
            'touchend        .backgroundLayer': 'dragEnd',
            'mouseup         .backgroundLayer': 'dragEnd',
            'touchendoutside .backgroundLayer': 'dragEnd',
            'mouseupoutside  .backgroundLayer': 'dragEnd',

            'mouseover       .backgroundLayer': 'hover',
            'mouseout        .backgroundLayer': 'unhover'
        },

        initialize: function(options) {
            options = _.extend({
                width: 160,
                height: undefined,
                areasToAvoid: [],

                labelText: 'Atoms',
                labelFont: 'bold 16px Helvetica Neue',
                labelColor: '#000',
                labelAlpha: 1,

                overlayAlpha: 0.4,

                showHints: true
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.dummyLayer = options.dummyLayer;
            this.areasToAvoid = options.areasToAvoid;

            this.width = options.width;
            this.height = options.height;

            this.labelText = options.labelText;
            this.labelFont = options.labelFont;
            this.labelColor = options.labelColor;
            this.labelAlpha = options.labelAlpha;

            this.overlayAlpha = options.overlayAlpha;

            this.showHints = options.showHints;
            this._showingDragHint = options.showHints;

            this.nucleusPlacementBounds = new Rectangle(this.simulation.getNucleusBounds());
            this.nucleusPlacementBounds.x += AtomCanisterView.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE;
            this.nucleusPlacementBounds.y += AtomCanisterView.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE;
            this.nucleusPlacementBounds.w -= AtomCanisterView.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE * 2;
            this.nucleusPlacementBounds.h -= AtomCanisterView.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE * 2;

            // Cached objects
            this._bounds = new Rectangle();

            this.initGraphics();

            this.listenTo(this.simulation.atomicNuclei, 'add', this.hideDragHint);
        },

        initGraphics: function() {
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();
            this.hoverLayer = new PIXI.Container();

            this.displayObject.addChild(this.backgroundLayer);
            this.displayObject.addChild(this.foregroundLayer);
            this.displayObject.addChild(this.hoverLayer);

            this.backgroundLayer.buttonMode = true;

            this.initSprites();
            this.initDecorativeDummyObjects();
            this.initLabel();

            this.updateMVT(this.mvt);
        },

        initSprites: function() {
            var fg = Assets.createSprite(Assets.Images.CANISTER_FG);
            var bg = Assets.createSprite(Assets.Images.CANISTER_BG);
            var glow = Assets.createSprite(Assets.Images.CANISTER_GLOW);
            var drag = Assets.createSprite(Assets.Images.CANISTER_DRAG);
            var remove = Assets.createSprite(Assets.Images.CANISTER_REMOVE);

            var scale;

            // Calculate the scale
            if (this.width === undefined && this.height === undefined) {
                throw 'A width or height must be specified for the canister.';
            }
            else if (this.width === undefined) {
                scale = this.height / fg.height;
                this.width = this.height * (fg.width / fg.height);
            }
            else {
                scale = this.width / fg.width;
                this.height = this.width * (fg.height / fg.width);
            }

            // Apply the scale
            fg.scale.x = bg.scale.x = glow.scale.x = drag.scale.x = remove.scale.x = scale;
            fg.scale.y = bg.scale.y = glow.scale.y = drag.scale.y = remove.scale.y = scale;

            // Make overlays invisible by default
            drag.alpha = 0;
            remove.alpha = 0;

            // Add everything to their proper layers
            this.backgroundLayer.addChild(bg);
            this.foregroundLayer.addChild(fg);
            this.foregroundLayer.addChild(glow);
            this.hoverLayer.addChild(drag);
            this.hoverLayer.addChild(remove);

            // Save references to certain sprites
            this.glowSprite = glow;
            this.dragOverlay = drag;
            this.removeOverlay = remove;
        },

        initDecorativeDummyObjects: function() {
            this.decorativeDummyObjects = new PIXI.Container();
            this.displayObject.addChild(this.decorativeDummyObjects);

            this.drawDecorativeDummyObjects();
        },

        initLabel: function() {
            var textSettings = {
                font: this.labelFont,
                fill: this.labelColor
            };

            var label = new PIXI.Text(this.labelText, textSettings);
            label.anchor.x = 0.5;
            label.anchor.y = -0.11;
            label.x = this.width / 2;
            label.y = this.thickness;

            this.displayObject.addChild(label);
        },

        drawDecorativeDummyObjects: function() {
            var windowCenterX = this.width / 2;
            var windowCenterY = this.height * (108 / 260);
            var windowRadius  = this.height *  (55 / 260);

            var numberOfDummies = 3;
            var angleStep = (Math.PI * 2) / numberOfDummies;
            var startingAngle = Math.random() * Math.PI;
            var radius = windowRadius * 0.7;
            var dummy;
            var vec = new Vector2();
            
            for (var n = 0; n < numberOfDummies; n++) {
                vec.set(radius, 0).rotate(startingAngle + n * angleStep);

                // dummy = this.createDummyObject();
                // dummy.setPosition(windowCenterX + vec.x, windowCenterY + vec.y);

                // this.decorativeDummyObjects.addChild(dummy.displayObject);
            }
        },

        /**
         * Creates a new object (of whatever this reservoir contains)
         *   and returns it so it can be added to the scene as a
         *   dummy object.  Note the dummy object will not be added
         *   to the simulation until it gets turned into a real
         *   object after the user drops it.
         */
        createDummyObject: function() {
            var model = new Charge();
            var view = new ReservoirObjectView({
                model: model,
                mvt: this.mvt,
                interactive: false
            });
            return view;
        },

        destroyObject: function(object) {
            object.destroy();
        },

        /**
         * Creates the actual object based off of the position of the
         *   dummy object and adds it to the simulation/scene.
         */
        createAndAddObject: function(dummyObject) {},

        /**
         * Finds a spot for a randomly-placed atom and adds it to the simulation
         */
        addNewAtom: function() {
            // Don't add one if we've already reached the max nuclei count
            if (this.simulation.atomicNuclei.length >= this.simulation.get('maxNuclei'))
                return;

            var bounds = this.nucleusPlacementBounds;

            var x;
            var y;
            var openSpotFound = false;

            for (var i = 0; i < 3 && !openSpotFound; i++) {
                var minInterNucleusDistance = AtomCanisterView.PREFERRED_INTER_NUCLEUS_DISTANCE;

                if (i === 1) {
                    // Lower our standards.
                    minInterNucleusDistance = AtomCanisterView.PREFERRED_INTER_NUCLEUS_DISTANCE / 2;
                }
                else if (i === 3) {
                    // Anything goes - nuclei may end up on top of each other.
                    minInterNucleusDistance = 0;
                    console.warn('WARNING: Allowing nucleus to overlap with others.');
                }

                for (var j = 0; j < AtomCanisterView.MAX_PLACEMENT_ATTEMPTS & !openSpotFound; j++) {
                    // Generate a candidate location.
                    x = bounds.x + Math.random() * bounds.w;
                    y = bounds.y + Math.random() * bounds.h;

                    // Innocent until proven guilty.
                    openSpotFound = true;

                    if (this.pointInsideInvalidArea(x, y) || 
                        this.pointTooCloseToOtherNuclei(x, y, minInterNucleusDistance)
                    ) {
                        openSpotFound = false;
                        continue;
                    }
                }
            }

            this.simulation.addNucleusAt(x, y);
        },

        pointInsideInvalidArea: function(x, y) {
            for (var i = 0; i < this.modelAreasToAvoid.length; i++) {
                if (this.modelAreasToAvoid[i].contains(x, y))
                    return true;
            }
            return false;
        },

        pointTooCloseToOtherNuclei: function(x, y, minInterNucleusDistance) {
            var nuclei = this.simulation.atomicNuclei.models;
            var minDistSquared = minInterNucleusDistance * minInterNucleusDistance;

            for (var i = 0; i < nuclei.length; i++) {
                if (nuclei[i].get('position').distanceSq(x, y) < minDistSquared)
                    return true;
            }

            return false;
        },

        setAreasToAvoid: function(areas) {
            this.areasToAvoid = areas;
            this.updateAreasToAvoid();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawDecorativeDummyObjects();

            this.updateAreasToAvoid();
        },

        updateAreasToAvoid: function() {
            var padding = AtomCanisterView.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE;

            this.modelAreasToAvoid = [];
            for (var i = 0; i < this.areasToAvoid.length; i++) {
                var modelArea = new Rectangle(this.mvt.viewToModel(this.areasToAvoid[i]));
                modelArea.x -= padding;
                modelArea.y -= padding;
                modelArea.w += padding * 2;
                modelArea.h += padding * 2;
                this.modelAreasToAvoid.push(modelArea);
            }

            var canisterBounds = new Rectangle(this.mvt.viewToModel(this.getBounds()));
            canisterBounds.x -= padding;
            canisterBounds.y -= padding;
            canisterBounds.w += padding * 2;
            canisterBounds.h += padding * 2;
            this.modelAreasToAvoid.push(canisterBounds);
        },

        update: function(time, deltaTime, paused) {
            if (this._showingDragHint)
                this.oscillateDragOverlayAlpha(time);

            if (!paused)
                this.oscillateGlow(time);
        },

        /**
         * Makes the drag overlay fade in and out
         */
        oscillateDragOverlayAlpha: function(time) {
            if (!this.hovering)
                this.dragOverlay.alpha = (Math.sin(3 * time) * 0.25 + 0.5) * this.overlayAlpha;
        },

        oscillateGlow: function(time) {
            this.glowSprite.alpha = Math.sin(2 * time) * 0.5 + 0.5;
        },

        dragStart: function(data) {
            this.dragging = true;

            this.dummyObject = this.createDummyObject();
            this.dummyLayer.addChild(this.dummyObject.displayObject);
        },

        drag: function(data) {
            if (this.dragging) {
                this.dummyObject.setPosition(
                    data.global.x,
                    data.global.y
                );
            }
        },

        dragEnd: function(data) {
            this.dragging = false;

            if (this.dummyObject) {
                var x = this.dummyObject.displayObject.x;
                var y = this.dummyObject.displayObject.y;

                if (!this.contains(x, y)) {
                    // Create a real object and add it to the sim
                    this.createAndAddObject(this.dummyObject.model);
                }

                this.dummyObject.removeFrom(this.dummyLayer);
                this.dummyObject.model.destroy();
                this.dummyObject = null;
            }
        },

        hover: function(event) {
            this.hovering = true;
            this.dragOverlay.alpha = this.overlayAlpha;
        },

        unhover: function(event) {
            this.hovering = false;
            this.dragOverlay.alpha = 0;
        },

        getBounds: function() {
            return this._bounds.set(
                this.displayObject.x,
                this.displayObject.y,
                this.width,
                this.height
            );
        },

        /**
         * Returns whether or not a circle on the screen at point (x, y)
         *   with the given radius would overlap with the reservoir.
         */
        overlapsCircle: function(x, y, radius) {
            return this.getBounds().overlapsCircle(x, y, radius);
        },

        /**
         * Returns whether or not a point on the screen lies inside the
         *   reservoir's bounds.
         */
        contains: function(x, y) {
            return this.getBounds().contains(x, y);
        },

        showDestroyOverlay: function() {
            this.removeOverlay.alpha = this.overlayAlpha;
        },

        hideDestroyOverlay: function() {
            this.removeOverlay.alpha = 0;
        },

        showDragHint: function() {
            this._showingDragHint = true;
        },

        hideDragHint: function() {
            this._showingDragHint = false;
            this.dragOverlay.alpha = 0;
        },

        addAtoms: function(numberOfAtoms) {
            for (var i = 0; i < numberOfAtoms; i++)
                this.addNewAtom();
        },

        removeAtoms: function(numberOfAtoms) {
            for (var i = 0; i < numberOfAtoms; i++)
                this.simulation.removeRandomNucleus();
        }

    }, Constants.AtomCanisterView);


    return AtomCanisterView;
});