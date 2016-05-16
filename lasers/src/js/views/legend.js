define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;
    var PIXI     = require('pixi');

    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var VanillaCollection  = require('common/collections/vanilla');
    var Atom               = require('common/quantum/models/atom');
    var Photon             = require('common/quantum/models/photon');

    var AtomView             = require('views/atom');
    var PhotonCollectionView = require('views/photon-collection');

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
            // Just to keep the models happy
            this.simulation = options.simulation;
        },

        /**
         * Creates the views and labels that will be used to render the legend
         */
        initItems: function() {
            var items = [];

            // Atom
            var atomMVT = new ModelViewTransform.createScaleMapping(0.8);
            var atomModel = new Atom({}, {
                simulation: this.simulation
            });
            var atomView = new AtomView({
                mvt: atomMVT,
                model: atomModel
            });

            items.push({
                label: 'Atom',
                displayObject: atomView.displayObject
            });

            // Photon
            var photonMVT = new ModelViewTransform.createScaleMapping(1);
            var photons = new VanillaCollection();
            photons.add(new Photon({ position: new Vector2(-20, 0), visible: true, wavelength: Photon.RED }));
            photons.add(new Photon({ position: new Vector2(  0, 0), visible: true, wavelength: Photon.BLUE }));

            var photonCollectionView = new PhotonCollectionView({
                mvt: photonMVT,
                collection: photons,
                simulation: this.simulation
            });
            photonCollectionView.update(0, 0);

            items.push({
                label: 'Photon',
                displayObject: photonCollectionView.displayObject
            });

            this.items = items;
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
                var width  = item.width ? item.width : item.displayObject.width;
                var height = item.height ? item.height : item.displayObject.height;

                var container = new PIXI.Container();
                container.addChild(item.displayObject);
                container.scale.x = 2;
                container.scale.y = 2;

                return {
                    label: item.label,
                    img: PixiToImage.displayObjectToDataURI(container, 1),
                    width: width,
                    height: height,
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
