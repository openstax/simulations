define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');


    var Wireframe3DView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            options = _.extend({
                color: '#fff',
                alpha: 1,
                width: 2
            }, options);

            this.color = Colors.parseHex(options.color);
            this.alpha = options.alpha;
            this.width = options.width;

            this.vertices = [];
            this.transformedVertices = [];
            this.lines = [];
            this.numVertices = 0;
            this.numLines = 0;
            this._verticesDirty = false;

            this.updateMatrix3D(options.matrix3D);
        },

        draw: function() {
            if (this._verticesDirty)
                this.transformVertices();

            var graphics = this.displayObject;
            graphics.clear();
            graphics.lineStyle(this.width, this.color, this.alpha);
            
            for (var i = 0; i < this.numLines; i++) {
                var T = this.lines[i];
                var p1 = ((T >> 16) & 0xFFFF) * 3;
                var p2 = (T & 0xFFFF) * 3;

                graphics.moveTo(this.transformedVertices[p1], this.transformedVertices[p1 + 1]);
                graphics.lineTo(this.transformedVertices[p2], this.transformedVertices[p2 + 1]);
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMatrix3D: function(matrix3D) {
            this.matrix3D = matrix3D;

            this.draw();
        },

        reset: function() {
            this.numVertices = 0;
            this.numLines = 0;
            this._verticesDirty = true;
        },

        addVertex: function(x, y, z) {
            var i = this.numVertices * 3;

            this.vertices[i]     = x;
            this.vertices[i + 1] = y;
            this.vertices[i + 2] = z;

            this.numVertices++;
            this._verticesDirty = true;
        },

        addLine: function(index1, index2) {
            if (index1 >= this.numVertices)
                throw 'line index1 out of range: ' + index1;

            if (index2 >= this.numVertices)
                throw 'line index2 out of range: ' + index2;

            // Swap indices if they're out of order
            if (index1 > index2) {
                var tmp = index1;
                index1 = index2;
                index2 = tmp;
            }

            this.lines[this.numLines] = (index1 << 16) | index2;

            this.numLines++;
        },

        connectVerticesAsLoop: function() {
            for (var i = 0; i < this.numVertices - 1; i++)
                this.addLine(i, i + 1);
            this.addLine(this.numVertices - 1, 0); // Close the loop
        },

        transformVertices: function() {
            this.matrix3D.transform(this.vertices, this.transformedVertices, this.numVertices);

            this._verticesDirty = false;
        }

    });

    return Wireframe3DView;
});