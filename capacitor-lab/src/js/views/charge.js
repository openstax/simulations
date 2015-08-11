define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');

    var Constants = require('constants');

    var LINE_WIDTH = Constants.ChargeView.LINE_WIDTH;
    var SYMBOL_WIDTH = Constants.ChargeView.SYMBOL_WIDTH;
    var POSITIVE_COLOR = Colors.parseHex(Constants.ChargeView.POSITIVE_COLOR);
    var NEGATIVE_COLOR = Colors.parseHex(Constants.ChargeView.NEGATIVE_COLOR);

    /**
     * Base class for views that render charges
     */
    var ChargeView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            // Initialize graphics
            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.positiveCharges = new PIXI.Graphics();
            this.negativeCharges = new PIXI.Graphics();

            this.displayObject.addChild(this.positiveCharges);
            this.displayObject.addChild(this.negativeCharges);
        },

        draw: function() {
            this.positiveCharges.clear();
            this.negativeCharges.clear();

            this.positiveCharges.lineStyle(LINE_WIDTH, POSITIVE_COLOR, 1);
            this.negativeCharges.lineStyle(LINE_WIDTH, NEGATIVE_COLOR, 1);
        },

        drawNegativeSymbol: function(x, y, z) {
            var viewPoint = this.mvt.modelToViewDelta(x, y, z);
            this.negativeCharges.moveTo(viewPoint.x - SYMBOL_WIDTH / 2, viewPoint.y);
            this.negativeCharges.lineTo(viewPoint.x + SYMBOL_WIDTH / 2, viewPoint.y);
        },

        drawPositiveSymbol: function(x, y, z) {
            var viewPoint = this.mvt.modelToViewDelta(x, y, z);
            this.positiveCharges.moveTo(viewPoint.x - SYMBOL_WIDTH / 2, viewPoint.y);
            this.positiveCharges.lineTo(viewPoint.x + SYMBOL_WIDTH / 2, viewPoint.y);
            this.positiveCharges.moveTo(viewPoint.x, viewPoint.y - SYMBOL_WIDTH / 2);
            this.positiveCharges.lineTo(viewPoint.x, viewPoint.y + SYMBOL_WIDTH / 2);
        },
 
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    }, Constants.ChargeView);

    return ChargeView;
});