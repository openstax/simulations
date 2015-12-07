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

            this.solderLayer = new PIXI.Graphics();

            this.hoverGraphics = new PIXI.Graphics();
            this.hoverLayer.addChild(this.hoverGraphics);

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
        }

    }, Constants.JunctionView);

    return JunctionView;
});