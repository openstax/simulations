define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');
    var Colors  = require('common/colors/colors');

    var CircuitInteraction = require('models/circuit-interaction');

    var Draggable = require('views/draggable');

    var Constants = require('constants');

    /**
     * We don't want the hover overlays visible on any object while another object is dragging.
     */
    var someComponentIsDragging = false;

    /**
     * A view that represents a circuit component
     */
    var JunctionView = Draggable.extend({

        contextMenuContent: '<li><a class="split-btn"><span class="fa fa-chain-broken"></span>&nbsp; Split Junction</a></li>',

        /**
         * Overrides Draggable's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new JunctionView.
         */
        initialize: function(options) {
            this.color = Colors.parseHex(JunctionView.SOLDER_COLOR);

            // Cached objects
            this._point = new Vector2();

            Draggable.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.circuit, 'junctions-collapsed junction-split', this.updateSolder);
            this.listenTo(this.circuit.branches, 'add remove reset', this.updateSolder);
            this.listenTo(this.circuit.junctions, 'add remove reset', this.updateSolder);
        },

        detach: function() {
            Draggable.prototype.detach.apply(this, arguments);

            if (this.solderLayer.parent)
                this.solderLayer.parent.removeChild(this.solderLayer);
        },

        initGraphics: function() {
            this.displayObject.hitArea = new PIXI.Circle(0, 0, 1);
            this.displayObject.buttonMode = true;
            this.displayObject.defaultCursor = 'move';

            this.schematicGraphics = new PIXI.Graphics();
            this.schematicGraphics.visible = false;
            this.displayObject.addChild(this.schematicGraphics);

            this.solderLayer = new PIXI.Graphics();

            this.hoverGraphics = new PIXI.Graphics();
            this.hoverLayer.addChild(this.hoverGraphics);

            this.schematicModeChanged(this.circuit, this.circuit.get('schematic'));

            Draggable.prototype.initGraphics.apply(this, arguments);
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            var viewX = viewPosition.x;
            var viewY = viewPosition.y;

            this.solderLayer.x = viewX;
            this.solderLayer.y = viewY;

            this.displayObject.x = viewX;
            this.displayObject.y = viewY;
            this.displayObject.hitArea.radius = this.getRadius();

            this.hoverGraphics.x = viewX;
            this.hoverGraphics.y = viewY;
        },

        draw: function() {
            var radius = this.getRadius();
            var solderRadius = this.getSolderRadius();

            var solderGraphics = this.solderLayer;
            solderGraphics.clear();
            solderGraphics.beginFill(this.color, 1);
            solderGraphics.drawCircle(0, 0, solderRadius);
            solderGraphics.endFill();

            var schematicGraphics = this.schematicGraphics;
            schematicGraphics.clear();
            schematicGraphics.beginFill();
            schematicGraphics.drawCircle(0, 0, radius * 0.5);
            schematicGraphics.endFill();

            var hoverGraphics = this.hoverGraphics;
            hoverGraphics.clear();
            hoverGraphics.beginFill(this.selectionColor, 1);
            hoverGraphics.drawCircle(0, 0, radius);
            hoverGraphics.endFill();
            hoverGraphics.beginFill(this.selectionColor, Constants.SELECTION_AURA_ALPHA);
            hoverGraphics.drawCircle(0, 0, radius * 2);
            hoverGraphics.endFill();
        },

        updateMVT: function(mvt) {
            Draggable.prototype.updateMVT.apply(this, arguments);

            this.draw();
            this.updatePosition(this.model, this.model.get('position'));
            this.updateSolder();
        },

        updateSolder: function(j1, j2, replacement) {
            if (this.isConnected() && !this.circuit.get('schematic'))
                this.solderLayer.visible = true;
            else
                this.solderLayer.visible = false;
        },

        getRadius: function() {
            return Math.round(this.mvt.modelToViewDeltaX(JunctionView.RADIUS));
        },

        getSolderRadius: function() {
            return Math.round(this.mvt.modelToViewDeltaX(JunctionView.SOLDER_RADIUS));
        },

        _drag: function(event) {
            this._point.set(event.data.global.x, event.data.global.y);
            var modelPoint = this.mvt.viewToModel(this._point);
            
            CircuitInteraction.dragJunction(this.model, modelPoint);

            this.circuit.clearSelection();
        },

        _drop: function(event) {
            CircuitInteraction.dropJunction(this.model);
        },

        initContextMenu: function($contextMenu) {
            $contextMenu.on('click', '.split-btn', _.bind(this.split, this));
            if (this.circuit.getAdjacentBranches(this.model).length <= 1) {
                $contextMenu
                    .find('.split-btn')
                    .attr('disabled', 'disabled')
                    .addClass('disabled');
            }
        },
         
        split: function() {
            this.circuit.split(this.model);
            this.hidePopover();
        },

        isConnected: function() {
            return (this.circuit.getJunctionNeighbors(this.model).length > 1);
        },

        schematicModeChanged: function(circuit, schematic) {
            this.solderLayer.visible = !schematic;
            this.schematicGraphics.visible = schematic;
        }

    }, Constants.JunctionView);

    return JunctionView;
});