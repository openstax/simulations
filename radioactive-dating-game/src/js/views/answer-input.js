define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var Rectangle = require('common/math/rectangle');
    var Vector2 = require('common/math/vector2');

    var RadiometricDatingMeter = require('radioactive-dating-game/models/radiometric-dating-meter');
    var DatableItem            = require('radioactive-dating-game/models/datable-item');

    // CSS
    require('less!radioactive-dating-game/styles/answer-input');

    // HTML
    var html = require('text!radioactive-dating-game/templates/answer-input.html');

    /**
     * 
     */
    var AnswerInputView = Backbone.View.extend({

        className: 'answer-input-view',

        events: {
            'submit form' : 'formSubmitted'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.sceneWidth = options.sceneWidth;
            this.sceneHeight = options.sceneHeight;
            this.itemViews = options.itemViews;

            this._point = new Vector2();
            this._rect = new Rectangle();

            this.listenTo(this.simulation.meter, 'change:itemBeingTouched', this.itemChanged);
            this.listenTo(this.simulation.meter, 'change:measurementMode',  this.measurementModeChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.$el.html(html);

            return this;
        },

        postRender: function() {
            this.panelWidth = this.$el.outerWidth();
            this.panelHeight = this.$el.outerHeight();
            this.hide();
        },

        reset: function() {
            this.$('.answer').val('');
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        formSubmitted: function() {
            var item = this.simulation.meter.get('itemBeingTouched');
            if (item) {
                var estimate = parseInt(this.$('.answer').val());
                this.simulation.setEstimate(item, estimate);
                this.hide();
                this.reset();
            }

            return false;
        },

        itemChanged: function(meter, itemBeingTouched) {
            this.determineVisibility();
        },

        measurementModeChanged: function() {
            this.determineVisibility();
        },

        determineVisibility: function() {
            var measurementMode = this.simulation.meter.get('measurementMode');
            var itemBeingTouched = this.simulation.meter.get('itemBeingTouched');
            if (itemBeingTouched && itemBeingTouched !== DatableItem.DATABLE_AIR && measurementMode === RadiometricDatingMeter.OBJECTS) {
                // Move it into position
                var position = this.findSpotForWindow(itemBeingTouched);
                this.$el.css({ 
                    left: position.x + 'px', 
                    top: position.y + 'px' 
                });

                // Change name
                this.$('.item-name').html(itemBeingTouched.get('name'));

                // Show it
                this.show();

                this.$('.answer').focus();
            }
            else {
                // Hide it
                this.hide();
            }
        },

        /**
         * Finds a location in the scene near the specified object.  This is necessary 
         *   prevent the view from going off the sides or the top/bottom of the scene.
         */
        findSpotForWindow: function(item) {
            var itemView = this.getItemView(item);
            var itemPosition = this.mvt.modelToView(item.getPosition());
            var viewBounds = itemView.getBounds();
            var itemBounds = this._rect;
            itemBounds.x = viewBounds.x;
            itemBounds.y = viewBounds.y;
            itemBounds.w = viewBounds.width;
            itemBounds.h = viewBounds.height;

            var panelWidth = this.panelWidth;
            var panelHeight = this.panelHeight;
            var margin = 8;

            // Try positioning the node to the right of the associated object.
            var xPos = itemBounds.right() + margin;
            var yPos = itemPosition.y - panelHeight / 2;
            var maxX = xPos + panelWidth;
            var maxY = yPos + panelHeight;

            if ((maxX > this.sceneWidth) || (maxY > this.sceneHeight)) {
                // Some portion of the window will be off the canvas if we use the
                // default position, so we need to try alternatives.

                if (maxX > this.sceneWidth) {
                    // The window would be off the right edge of the canvas, so
                    // set its x position such that it just fits in the x
                    // direction.
                    xPos = this.sceneWidth - panelWidth - margin;

                    // Set the Y position so that it is just below the object.
                    // This will be checked and possibly changed below.
                    yPos = itemBounds.top() + margin;
                    maxY = yPos + panelHeight;
                }

                if (maxY > this.sceneHeight) {
                    // The window would be off the bottom of the canvas if left
                    // unadjusted.
                    if (itemBounds.right() + panelWidth < this.sceneWidth) {
                        // The window can fit between the right edge of the object
                        // and the right edge of the canvas, so position it at the
                        // bottom of the canvas.
                        yPos = this.sceneHeight - panelHeight;
                    }
                    else {
                        // Position it above the item.
                        yPos = itemBounds.bottom() - panelHeight;
                    }
                }
            }

            return this._point.set(xPos, yPos);
        },

        getItemView: function(item) {
            for (var i = 0; i < this.itemViews.length; i++) {
                if (this.itemViews[i].model === item)
                    return this.itemViews[i];
            }
            return null;
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }

    });

    return AnswerInputView;
});
