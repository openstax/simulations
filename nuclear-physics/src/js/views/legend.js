define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    // CSS
    require('less!styles/legend');

    // HTML
    var templateHtml = require('text!templates/legend.html');

    /**
     * 
     */
    var LegendView = Backbone.View.extend({

        className: 'legend-view',

        template: _.template(templateHtml),

        initialize: function(options) {
            options = _.extend({
                scale: 1
            }, options);

            this.scale = options.scale;

            this.initMVT();
        },

        /**
         * Initializes the MVT to be used for rendering the items
         */
        initMVT: function() {
            this.mvt = new ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0), 
                new Vector2(0, 0), 
                this.scale
            );
        },

        /**
         * Creates the views and labels that will be used to render the legend
         */
        initItems: function() {
            this.items = [];
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.initItems();

            var widestItem = _.max(this.items, function(item) {
                if (item.width)
                    return item.width;
                else
                    return item.displayObject.width * item.displayObject.scale.x;
            });
            // Need to grab value now because when the widest item gets mapped to and updates,
            // the width on widestItem updates as well.
            var widestWidth = widestItem.width ?
                widestItem.width :
                Math.ceil(widestItem.displayObject.width * widestItem.displayObject.scale.x);

            var items = _.map(this.items, function(item) {
                return {
                    label: item.label,
                    img: PixiToImage.displayObjectToDataURI(item.displayObject, 1),
                    width: item.width ? item.width : item.displayObject.width,
                    height: item.height ? item.height : item.displayObject.height,
                    containerWidth: widestWidth
                };
            });

            this.$el.html(this.template({ items: items }));

            return this;
        },

        getMVT: function() {
            return this.mvt;
        }

    });

    return LegendView;
});
