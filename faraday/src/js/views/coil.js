define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Electron               = require('models/electron');
    var ElectronPathDescriptor = require('models/electron-path-descriptor');
    var QuadBezierSpline       = require('models/quad-bezier-spline');

    var ElectronView = require('views/electron');

    var Assets = require('assets');

    var Constants = require('constants');
    var ELECTRON_SPACING       = Constants.CoilView.ELECTRON_SPACING;
    var ELECTRONS_IN_LEFT_END  = Constants.CoilView.ELECTRONS_IN_LEFT_END;
    var ELECTRONS_IN_RIGHT_END = Constants.CoilView.ELECTRONS_IN_RIGHT_END;

    /**
     * CoilGraphic is the graphical representation of a coil of wire.
     * In order to simulate objects passing "through" the coil, the coil graphic
     * consists of two layers, called the "foreground" and "background".
     * 
     * The coil is drawn as a set of curves, with a "wire end" joined at the each
     * end of the coil.  The wire ends is where things can be connected to the coil
     * (eg, a lightbulb or voltmeter). 
     * 
     * The coil optionally shows electrons flowing. The number of electrons is 
     * a function of the coil radius and number of loops.  Electrons are part of 
     * the simulation model, and they know about the path that they need to follow.
     * The path is a describe by a set of ElectronPathDescriptors.
     * 
     * The set of ElectronPathDescriptors contains the information that the electrons
     * need to determine which layer that are in (foreground or background) 
     * and how to adjust ("scale") their speed so that they appear to flow at
     * the same rate in all curve segments.  (For example, the wire ends are
     * significantly shorter curves that the other segments in the coil.) 
     * 
     * WARNING!  The updateCoil method in particular is very complicated, and
     * the curves that it creates have been tuned so that all curve segments 
     * are smoothly joined to form a 3D-looking coil.  If you change values,
     * do so with caution, test frequently, and perform a close visual 
     * inspection of your changes.
     */
    var CoilView = PixiView.extend({

        /**
         * Initializes the new CoilView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.electronAnimationEnabled = true;
            this.foregroundLayerColor   = CoilView.FOREGROUND_COLOR;
            this.middlegroundColor = CoilView.MIDDLEGROUND_COLOR;
            this.backgroundLayerColor   = CoilView.BACKGROUND_COLOR;
            
            this.electronPath = [];
            this.electrons = [];
            
            this.numberOfLoops = -1; // force update
            this.loopRadius    = -1; // force update
            this.wireWidth     = -1; // force update
            this.loopSpacing   = -1; // force update
            this.current       = -1; // force update
            this.electronSpeedScale = 1;
            this.endsConnected = false;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._vec          = new Vector2();
            this._endPoint     = new Vector2();
            this._startPoint   = new Vector2();
            this._controlPoint = new Vector2();

            this.initGraphics();
            this.update();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();

            this.displayObject.addChild(this.backgroundLayer);
            this.displayObject.addChild(this.foregroundLayer);

            this.updateMVT(this.mvt);
        },

        /**
         * Enables/disables animation of current flow.
         */
        setElectronAnimationEnabled: function(enabled) {
            if (this.electronAnimationEnabled !== enabled){
                this.electronAnimationEnabled = enabled;
                this.updateElectrons();
            }
        },

        enableElectronAnimation: function() {
            this.setElectronAnimationEnabled(true);
        },

        disableElectronAnimation: function() {
            this.setElectronAnimationEnabled(false);
        },
        
        /**
         * Determines whether animation of current flow is enabled.
         */
        isElectronAnimationEnabled: function() {
            return this.electronAnimationEnabled;
        },

        /**
         * Sets the scale used for electron speed.
         *
         * @param electronSpeedScale
         */
        setElectronSpeedScale: function(electronSpeedScale) {
            if (electronSpeedScale !== this.electronSpeedScale) {
                this.electronSpeedScale = electronSpeedScale;
                // Update all electrons
                var numberOfElectrons = this.electrons.length;
                for (var i = 0; i < numberOfElectrons; i++)
                    this.electrons[i].set('speedScale', this.electronSpeedScale);
            }
        },

        setEndsConnected: function(endsConnected) {
            if (endsConnected !== this.endsConnected) {
                this.endsConnected = endsConnected;
                this.updateCoil();
            }
        },
        
        isEndsConnected: function() {
            return this.endsConnected;
        },

        /**
         * Determines if the physical appearance of the coil has changed.
         */
        coilChanged: function() {
            var changed = false;
            if (this.numberOfLoops !== this.model.get('numberOfLoops') ||
                this.loopRadius    !== this.model.get('radius') ||
                this.wireWidth     !== this.model.get('wireWidth') ||
                this.loopSpacing   !== this.model.get('loopSpacing')
            ) {
                changed = true;
                this.numberOfLoops = this.model.get('numberOfLoops');
                this.loopRadius    = this.model.get('radius');
                this.wireWidth     = this.model.get('wireWidth');
                this.loopSpacing   = this.model.get('loopSpacing');
            }
            return changed;
        },
        
        /*
         * Determines if the electron animation has changed.
         * 
         * @return true or false
         */
        electronsChanged: function() {
            var changed = !(this.current === 0 && this.model.get('currentAmplitude') === 0);
            this.current = this.model.get('currentAmplitude');
            return changed;
        },

        /**
         * Updates the view to match the model.
         */
        update: function(time, deltaTime, paused) {
            if (this.displayObject.visible && !paused) {
                // Update the physical appearance of the coil.
                if (this.coilChanged())
                    this.updateCoil();
                
                // Change the speed/direction of electrons to match the voltage.
                if (this.electronAnimationEnabled && this.electronsChanged())
                    this.updateElectrons();
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        /**
         * Updates the coil, recreating all graphics and electron model elements.
         * 
         * WARNING! A lot of time was spent tweaking points so that the curves appear
         * to form one 3D continuous coil.  Be very careful what you change, and visually 
         * inspect the results closely.
         */
        updateCoil: function() {
            // Start with a clean slate.
            this.foregroundLayer.removeChildren();
            this.backgroundLayer.removeChildren();

            // Clear electron path descriptions
            this.clearElectronPath();

            // Remove electrons from model
            this.clearElectrons();

            this.width  = this.getWidth();
            this.height = this.getHeight();

            // Draw the loops
            var radius = this.mvt.modelToViewDeltaX(this.model.get('radius'));
            var numberOfLoops = this.model.get('numberOfLoops');
            var loopSpacing = parseInt(this.mvt.modelToViewDeltaX(this.model.get('loopSpacing')));
            var wireWidth = this.mvt.modelToViewDeltaX(this.model.get('wireWidth'));
            
            // Start at the left-most loop, keeping the coil centered.
            var xStart = -(loopSpacing * (numberOfLoops - 1) / 2);//(loopSpacing * numberOfLoops) / 2 + wireWidth; //-(loopSpacing * (numberOfLoops - 1) / 2);
            
            var leftEndPoint;
            var rightEndPoint;

            // Create canvases to draw to because we're drawing gradients
            var bg = this.backgroundLayer;
            var bgCanvas = this.createCoilCanvas();
            var bgCtx = bgCanvas.getContext('2d');
            var fg = this.foregroundLayer;
            var fgCanvas = this.createCoilCanvas();
            var fgCtx = fgCanvas.getContext('2d');

            fgCtx.lineWidth = bgCtx.lineWidth = wireWidth;
            fgCtx.lineJoin = bgCtx.lineJoin = 'bevel';
            fgCtx.lineCap = bgCtx.lineCap = 'round';

            // bgCtx.fillStyle = '#00d';
            // bgCtx.fillRect(0, 0, 600, 600);
            
            // Create the wire ends & loops from left to right.
            // Curves are created in the order that they are pieced together.
            for (var i = 0; i < numberOfLoops; i++) {
                var xOffset = xStart + (i * loopSpacing);// + this.getWidth() / 2;
                var yOffset = 0//Math.floor(radius) + 40;
                
                // If first loop (left)
                if (i === 0) {     
                    // Left wire end
                    leftEndPoint = this.createWireLeftEnd(bg, bgCtx, loopSpacing, xOffset, yOffset, radius);

                    // Back top (left-most) is slightly different so it connects to the left wire end.
                    this.createWireLeftBackTop(bg, bgCtx, loopSpacing, xOffset, yOffset, radius);
                }
                else {
                    // Back top (no wire end connected)
                    this.createWireBackTop(bg, bgCtx, loopSpacing, xOffset, yOffset, radius);
                }
                
                // Back bottom
                this.createWireBackBottom(bg, bgCtx, xOffset, yOffset, radius);
                
                // Front bottom
                this.createWireFrontBottom(fg, fgCtx, xOffset, yOffset, radius);

                // Front top
                this.createWireFrontTop(fg, fgCtx, loopSpacing, xOffset, yOffset, radius);
                
                // If last loop (right)
                if (i === numberOfLoops - 1) {
                    // Right wire end
                    rightEndPoint = this.createWireRightEnd(fg, fgCtx, loopSpacing, xOffset, yOffset, radius);
                }
            }

            // Connect the ends
            if (this.endsConnected) {
                fgCtx.strokeStyle = this.middlegroundColor;
                fgCtx.moveTo(leftEndPoint.x, leftEndPoint.y);
                fgCtx.lineTo(rightEndPoint.x, rightEndPoint.y);
                fgCtx.stroke();
            }

            // Create sprites from the canvases
            var bgSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(bgCanvas));
            var fgSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(fgCanvas));
            bg.addChild(bgSprite);
            fg.addChild(fgSprite);
            bgSprite.x = -this.width / 2;
            fgSprite.x = -this.width / 2;
            bgSprite.y = -this.height / 2;
            fgSprite.y = -this.height / 2;
            
            // Add electrons to the coil.
            var speed = this.calculateElectronSpeed();
            
            var leftEndIndex = 0;
            var rightEndIndex = this.electronPath.length - 1;

            // For each curve...
            for (var pathIndex = 0; pathIndex < this.electronPath.length; pathIndex++) {
                /*
                 * The wire ends are a different size, 
                 * and therefore contain a different number of electrons.
                 */
                var numberOfElectrons;
                if (pathIndex === leftEndIndex)
                    numberOfElectrons = ELECTRONS_IN_LEFT_END;
                else if (pathIndex === rightEndIndex)
                    numberOfElectrons = ELECTRONS_IN_RIGHT_END;
                else
                    numberOfElectrons = Math.floor(radius / ELECTRON_SPACING);

                // Add the electrons to the curve.
                for (var i = 0; i < numberOfElectrons; i++) {

                    var pathPosition = i / numberOfElectrons;

                    // Model
                    var electron = new Electron({
                        speed: speed,
                        speedScale: this.electronSpeedScale,
                        enabled: this.electronAnimationEnabled
                    }, {
                        path: this.electronPath,
                        pathIndex: pathIndex,
                        pathPosition: pathPosition
                    });

                    this.electrons.push(electron);
                    this.simulation.addElectron(electron);

                    // View
                    var descriptor = electron.getPathDescriptor();
                    var parent = descriptor.getParent();
                    var electronView = new ElectronView({
                        mvt: this.mvt,
                        model: electron 
                    });
                    parent.addChild(electronView.displayObject);
                    descriptor.getParent().addChild(electronView.displayObject);
                }
            }
        },

        /**
         * Updates the speed and direction of electrons.
         */
        updateElectrons: function() {
            // Speed and direction is a function of the voltage.
            var speed = this.calculateElectronSpeed();
            
            // Update all electrons.
            var numberOfElectrons = this.electrons.length;
            for (var i = 0; i < numberOfElectrons; i++) {
                var electron = this.electrons[i];
                electron.set('enabled', this.electronAnimationEnabled);
                electron.set('speed', speed);
            }
        },

        createCoilCanvas: function() {
            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;
            return canvas;
        },

        clearElectronPath: function() {
            for (var i = this.electronPath.length - 1; i >= 0; i--)
                this.electronPath.splice(i, 1);
        },

        clearElectrons: function() {
            this.simulation.clearElectrons();
        },

        drawQuadBezierSpline: function(ctx, spline, startColor, endColor, x1, y1, x2, y2) {
            var ox = this.width  / 2; // x offset to make sure it draws within the canvas bounds
            var oy = this.height / 2; // y offset to make sure it draws within the canvas bounds

            if (endColor !== undefined) {
                var gradient = ctx.createLinearGradient(x1 + ox, y1 + oy, x2 + ox, y2 + oy);
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(1, endColor);

                ctx.strokeStyle = gradient;
            }
            else {
                ctx.strokeStyle = startColor;
            }

            ctx.beginPath();
            ctx.moveTo(spline.x1 + ox, spline.y1 + oy);
            ctx.quadraticCurveTo(spline.cx + ox, spline.cy + oy, spline.x2 + ox, spline.y2 + oy);
            ctx.stroke();
        },

        /**
         * Left wire end. Returns the left end point
         */
        createWireLeftEnd: function(background, ctx, loopSpacing, xOffset, yOffset, radius) {
            var endPoint = this._endPoint.set(-loopSpacing / 2 + xOffset, Math.floor(-radius) + yOffset); // lower
            var startPoint = this._startPoint.set(endPoint.x - 15, endPoint.y - 40); // upper
            var controlPoint = this._controlPoint.set(endPoint.x - 20, endPoint.y - 20);
            var curve = new QuadBezierSpline(startPoint, controlPoint, endPoint);
            
            // Scale the speed, since this curve is different than the others in the coil.
            var speedScale = (radius / ELECTRON_SPACING) / ELECTRONS_IN_LEFT_END;
            var d = new ElectronPathDescriptor(curve, background, ElectronPathDescriptor.BACKGROUND, speedScale);
            this.electronPath.push(d);
            
            // Horizontal gradient, left to right.
            this.drawQuadBezierSpline(
                ctx, curve, this.middlegroundColor, this.backgroundLayerColor, 
                startPoint.x, yOffset, 
                endPoint.x, yOffset
            );
            
            return startPoint;
        },

        /**
         * Back top (left-most) is slightly different so it connects to the left wire end
         */
        createWireLeftBackTop: function(background, ctx, loopSpacing, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(-loopSpacing / 2 + xOffset, Math.floor(-radius) + yOffset); // upper
            var endPoint = this._endPoint.set(Math.floor(radius * 0.25) + xOffset, yOffset); // lower
            var controlPoint = this._controlPoint.set(Math.floor(radius * 0.15) + xOffset, Math.floor(-radius * 0.70) + yOffset);
            var curve = new QuadBezierSpline(startPoint, controlPoint, endPoint);

            var d = new ElectronPathDescriptor(curve, background, ElectronPathDescriptor.BACKGROUND);
            this.electronPath.push(d);
            
            this.drawQuadBezierSpline(ctx, curve, this.backgroundLayerColor);
        },

        /**
         * Back top (no wire end connected)
         */
        createWireBackTop: function(background, ctx, loopSpacing, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(-loopSpacing + xOffset, Math.floor(-radius) + yOffset); // upper
            var endPoint = this._endPoint.set(Math.floor(radius * 0.25) + xOffset, yOffset); // lower
            var controlPoint = this._controlPoint.set(Math.floor(radius * 0.15) + xOffset, Math.floor(-radius * 1.20) + yOffset);
            var curve = new QuadBezierSpline( startPoint, controlPoint, endPoint );

            var d = new ElectronPathDescriptor( curve, background, ElectronPathDescriptor.BACKGROUND );
            this.electronPath.push(d);

            // Diagonal gradient, upper left to lower right.
            this.drawQuadBezierSpline(
                ctx, curve, this.middlegroundColor, this.backgroundLayerColor, 
                Math.floor(startPoint.x + (radius * 0.10)), -Math.floor(radius) + yOffset, 
                xOffset, -Math.floor(radius * 0.92) + yOffset
            );
        },

        /**
         * Back bottom
         */
        createWireBackBottom: function(background, ctx, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(Math.floor(radius * 0.25) + xOffset, 0 + yOffset); // upper
            var endPoint = this._endPoint.set(xOffset, Math.floor(radius) + yOffset); // lower
            var controlPoint = this._controlPoint.set(Math.floor(radius * 0.35) + xOffset, Math.floor(radius * 1.20) + yOffset);
            var curve = new QuadBezierSpline(startPoint, controlPoint, endPoint);

            var d = new ElectronPathDescriptor(curve, background, ElectronPathDescriptor.BACKGROUND);
            this.electronPath.push(d);

            // Vertical gradient, upper to lower
            this.drawQuadBezierSpline(
                ctx, curve, this.backgroundLayerColor, this.middlegroundColor, 
                0, Math.floor(radius * 0.92) + yOffset, 
                0, Math.floor(radius) + yOffset
            );
        },

        /**
         * Front bottom
         */
        createWireFrontBottom: function(foreground, ctx, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(xOffset, Math.floor(radius) + yOffset); // lower
            var endPoint = this._endPoint.set(Math.floor(-radius * 0.25) + xOffset, 0 + yOffset); // upper
            var controlPoint = this._controlPoint.set(Math.floor(-radius * 0.25) + xOffset, Math.floor(radius * 0.80) + yOffset);
            var curve = new QuadBezierSpline(startPoint, controlPoint, endPoint);

            var d = new ElectronPathDescriptor(curve, foreground, ElectronPathDescriptor.FOREGROUND);
            this.electronPath.push(d);

            // Horizontal gradient, left to right
            this.drawQuadBezierSpline(
                ctx, curve, this.foregroundLayerColor, this.middlegroundColor, 
                Math.floor(-radius * 0.25) + xOffset, yOffset, 
                Math.floor(-radius * 0.15) + xOffset, yOffset
            );
        },

        /**
         * Front top
         */
        createWireFrontTop: function(foreground, ctx, loopSpacing, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(Math.floor(-radius * 0.25) + xOffset, 0 + yOffset); // lower
            var endPoint = this._endPoint.set(xOffset, Math.floor(-radius) + yOffset); // upper
            var controlPoint = this._controlPoint.set(Math.floor(-radius * 0.25) + xOffset, Math.floor(-radius * 0.80) + yOffset);
            var curve = new QuadBezierSpline( startPoint, controlPoint, endPoint );

            var d = new ElectronPathDescriptor(curve, foreground, ElectronPathDescriptor.FOREGROUND);
            this.electronPath.push(d);
            
            // Horizontal gradient, left to right
            this.drawQuadBezierSpline(
                ctx, curve, this.foregroundLayerColor, this.middlegroundColor, 
                Math.floor(-radius * 0.25) + xOffset, yOffset, 
                Math.floor(-radius * 0.15) + xOffset, yOffset
            );
        },

        /**
         * Right wire end. Returns right end point
         */
        createWireRightEnd: function(foreground, ctx, loopSpacing, xOffset, yOffset, radius) {
            var startPoint = this._startPoint.set(xOffset, Math.floor(-radius) + yOffset); // lower
            var endPoint = this._endPoint.set(startPoint.x + 15, startPoint.y - 40); // upper
            var controlPoint = this._controlPoint.set(startPoint.x + 20, startPoint.y - 20);
            var curve = new QuadBezierSpline(startPoint, controlPoint, endPoint);

            // Scale the speed, since this curve is different than the others in the coil.
            var speedScale = (radius / ELECTRON_SPACING) / ELECTRONS_IN_RIGHT_END;
            var d = new ElectronPathDescriptor(curve, foreground, ElectronPathDescriptor.FOREGROUND, speedScale);
            this.electronPath.push(d);

            this.drawQuadBezierSpline(ctx, curve, this.middlegroundColor);
            
            return endPoint;
        },

        getWidth: function() {
            var numberOfLoops = this.model.get('numberOfLoops');
            return numberOfLoops * this.mvt.modelToViewDeltaX(30) + this.model.get('radius') * 0.58;
        },

        getHeight: function() {
            var radius = this.mvt.modelToViewDeltaX(this.model.get('radius'));
            return 2 * (radius * 1.2) + 40;
        },

        /**
         * Calculates the speed of electrons, a function of the voltage across the coil.
         * Direction is indicated by the sign of the value.
         * Magnitude of 0 indicates no motion.
         * Magnitude of 1 moves along an entire curve segment in one clock tick.
         */
        calculateElectronSpeed: function() {
            var currentAmplitude = this.model.get('currentAmplitude');
            // Current below the threshold is effectively zero.
            if (Math.abs(currentAmplitude) < Constants.CURRENT_AMPLITUDE_THRESHOLD)
                currentAmplitude = 0;
            
            return currentAmplitude;
        }

    }, Constants.CoilView);


    return CoilView;
});