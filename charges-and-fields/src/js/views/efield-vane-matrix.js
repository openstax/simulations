define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var ArrowView = require('common/v3/pixi/view/arrow');

    var Constants = require('constants');

    /**
     * 
     */
    var EFieldVaneMatrix = PixiView.extend({

        initialize: function(options) {
            // options = _.extend({
                
            // }, options);

            this.simulation = options.simulation;
            this.visible = true;
            this.displayObject.visible = false;

            this.updateMVT(options.mvt);

            this.listenTo(this.simulation.charges, 'change add remove reset',  this.chargesChanged);
        },

        initArrows: function() {
            this.clearArrows();

            var arrowLength     = this.mvt.modelToViewDeltaX(EFieldVaneMatrix.ARROW_LENGTH);
            var arrowWidth      = this.mvt.modelToViewDeltaX(EFieldVaneMatrix.ARROW_WIDTH);
            var arrowHeadWidth  = this.mvt.modelToViewDeltaX(EFieldVaneMatrix.ARROW_HEAD_WIDTH);
            var arrowHeadLength = this.mvt.modelToViewDeltaX(EFieldVaneMatrix.ARROW_HEAD_LENGTH);

            var halfLength = arrowLength / 2;
            var halfWidth = arrowHeadWidth / 2;

            var arrowViewModel = new ArrowView.ArrowViewModel({
                targetX: arrowLength,
                minLength: 5
            });

            var spacing = this.mvt.modelToViewDeltaX(EFieldVaneMatrix.SPACING);
            var xOffset = this.mvt.modelToViewX(0) + spacing / 2;
            var yOffset = this.mvt.modelToViewY(0) + spacing / 2;
            var cols = this.mvt.modelToViewDeltaX(this.simulation.get('width'))  / spacing + 1;
            var rows = this.mvt.modelToViewDeltaX(this.simulation.get('height')) / spacing + 1;
            var totalArrows = cols * rows;

            this.arrowContainers = [];
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    // Create an arrow view and center it within its parent
                    var arrowView = new ArrowView({
                        model:      arrowViewModel,
                        tailWidth:  arrowWidth,
                        headWidth:  arrowHeadWidth,
                        headLength: arrowHeadLength
                    });
                    arrowView.displayObject.x = -halfLength;

                    // Put the arrow view in a container and then position the container
                    var arrowContainer = new PIXI.Container();
                    arrowContainer.addChild(arrowView.displayObject);
                    arrowContainer.x = xOffset + c * spacing;
                    arrowContainer.y = yOffset + r * spacing;

                    // Add
                    this.displayObject.addChild(arrowContainer);
                    this.arrowContainers[r * cols + c] = arrowContainer;
                }
            }

            this.cols = cols;
            this.rows = rows;
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.initArrows();
        },

        update: function() {
            if (this.updateOnNextFrame) {
                this.updateOnNextFrame = false;

                if (this.visible && this.simulation.hasCharges()) {
                    this.updateArrows();
                    this.displayObject.visible = true;
                }
                else {
                    this.displayObject.visible = false;
                }
            }
        },

        updateArrows: function() {
            var efieldVec;
            var spacing = EFieldVaneMatrix.SPACING;
            var xOffset = spacing / 2;
            var yOffset = spacing / 2;

            var cols = this.cols;
            var rows = this.rows;
            var arrowContainer;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    efieldVec = this.simulation.getE(xOffset + c * spacing, yOffset + r * spacing);
                    arrowContainer = this.arrowContainers[r * cols + c];
                    arrowContainer.rotation = efieldVec.angle();
                    if (!this.directionOnly)
                        arrowContainer.alpha = EFieldVaneMatrix.eFieldVecLengthToAlpha(efieldVec.length());
                    else
                        arrowContainer.alpha = 1;
                }
            }
        },

        chargesChanged: function() {
            this.updateOnNextFrame = true;
        },

        show: function() {
            this.visible = true;
            this.updateOnNextFrame = true;
        },

        hide: function() {
            this.visible = false;
            this.updateOnNextFrame = true;
        },

        setDirectionOnly: function(directionOnly) {
            this.directionOnly = directionOnly;
            this.updateOnNextFrame = true;
        },

        clearArrows: function() {
            if (this.arrowContainers) {
                for (var i = this.arrowContainers.length - 1; i >= 0; i--) {
                    this.arrowContainers[i].removeFrom(this.displayObject);
                    this.arrowContainers.splice(i, 1);
                }
            }
        }

    }, Constants.EFieldVaneMatrix);

    return EFieldVaneMatrix;
});