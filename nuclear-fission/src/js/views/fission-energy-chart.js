define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                             require('common/v3/pixi/create-drop-shadow');
                             require('common/v3/pixi/draw-stick-arrow');
                             require('common/v3/pixi/dash-to');
    var AppView            = require('common/v3/app/app');
    var PixiView           = require('common/v3/pixi/view');
    var Colors             = require('common/colors/colors');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');

    var Uranium235Nucleus        = require('models/nucleus/uranium-235');
    var DaughterNucleus          = require('models/nucleus/daughter');
    var DaughterCompositeNucleus = require('models/nucleus/daughter-composite');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var Constants = require('constants');

    var POTENTIAL_LINE_COLOR = Colors.parseHex(Constants.FissionEnergyChartView.POTENTIAL_LINE_COLOR);
    var TOTAL_ENERGY_LINE_COLOR = Colors.parseHex(Constants.FissionEnergyChartView.TOTAL_ENERGY_LINE_COLOR);

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var FissionEnergyChartView = PixiView.extend({

        /**
         * Initializes the new FissionEnergyChartView.
         */
        initialize: function(options) {
            options = _.extend({
                height: 210,
                paddingLeft: 15, // Number of pixels on the left before the chart starts
                paddingBottom: 37,
                paddingRight: 15,
                paddingTop: 15,
                padding: 15,
                bgColor: '#fff',
                bgAlpha: 0.2,
                legendColor: '#fff',
                legendAlpha: 0.2,

                yAxisLabelText: 'U-235 Nucleus\nEnergy'
            }, options);

            // Required options
            this.simulation = options.simulation;
            this.renderer = options.renderer;
            this.mvt = options.mvt;
            this.width = options.width;

            // Optional options
            this.height         = options.height;
            this.paddingLeft    = options.paddingLeft;
            this.paddingBottom  = options.paddingBottom;
            this.paddingRight   = options.paddingRight;
            this.paddingTop     = options.paddingTop;
            this.padding        = options.padding;
            this.bgColor        = Colors.parseHex(options.bgColor);
            this.bgAlpha        = options.bgAlpha;
            this.legendColor    = Colors.parseHex(options.legendColor);
            this.legendAlpha    = options.legendAlpha;
            this.yAxisLabelText = options.yAxisLabelText;

            this.axisLineColor = Colors.parseHex(FissionEnergyChartView.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(FissionEnergyChartView.TICK_MARK_COLOR);
            this.yAxisLineXOffset = 60;
            this.arrowHeadWidth = 8;
            this.arrowHeadLength = 6;
            this.energyLineMargin = 0;
            this.yAxisLabelWidth = 48;

            this.calculateGraphDimensions();

            // State variable for compact tracking of model state.
            this.fissionState = FissionEnergyChartView.STATE_IDLE;
            this.daughterNucleusModel = null;
            this.origNumNeturons = this.model.get('numNeutrons');

            // Initialize the graphics
            this.initGraphics();

            this.listenTo(this.simulation, 'nucleus-change', this.nucleusChanged);
        },

        calculateGraphDimensions: function() {
            this.graphWidth   = this.width - this.paddingLeft - this.paddingRight;
            this.graphHeight  = this.height - this.paddingTop - this.paddingBottom;
            this.graphOriginX = this.paddingLeft;
            this.graphOriginY = this.height - this.paddingBottom;
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initEnergyLines();
            this.initNuclei();
            this.initLegend();

            this.drawTotalEnergyLine();
            this.drawPotentialEnergyLine();
        },

        initPanel: function() {
            // Draw the shadow
            var rectangle = new Rectangle(0, 0, this.width, this.height);
            var shadow = PIXI.createDropShadow(rectangle);
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.bgColor, this.bgAlpha);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initXAxis: function() {
            this.xAxisContainer = new PIXI.Container();
            this.displayObject.addChild(this.xAxisContainer);

            this.drawXAxis();
        },

        initYAxis: function() {
            this.yAxisContainer = new PIXI.Container();
            this.displayObject.addChild(this.yAxisContainer);

            this.drawYAxis();
        },

        initEnergyLines: function() {
            this.totalEnergyGraphics = new PIXI.Graphics();
            this.potentialEnergyGraphics = new PIXI.Graphics();
            this.displayObject.addChild(this.totalEnergyGraphics);
            this.displayObject.addChild(this.potentialEnergyGraphics);
        },

        initNuclei: function() {
            var mvt = new ModelViewTransform.createScaleMapping(3);

            var uranium235 = Uranium235Nucleus.create();
            var daughterNucleus1 = DaughterNucleus.create({ numProtons: 30, numNeutrons: 40 });
            var daughterNucleus2 = DaughterNucleus.create({ numProtons: 40, numNeutrons: 60 });

            this.unfissionedNucleus = ParticleGraphicsGenerator.generateNucleus(uranium235,       mvt, this.renderer, false, true);
            this.daughterNucleus1   = ParticleGraphicsGenerator.generateNucleus(daughterNucleus1, mvt, this.renderer, false, true);
            this.daughterNucleus2   = ParticleGraphicsGenerator.generateNucleus(daughterNucleus2, mvt, this.renderer, false, true);

            this.daughterNucleus1.visible = false;
            this.daughterNucleus2.visible = false;

            this.displayObject.addChild(this.unfissionedNucleus);
            this.displayObject.addChild(this.daughterNucleus1);
            this.displayObject.addChild(this.daughterNucleus2);

            this.nucleusDiameter = 50;

            this.updateNucleiPositions();
        },

        initLegend: function() {
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.legendColor, this.legendAlpha);
            graphics.drawRect(0, 0, FissionEnergyChartView.LEGEND_WIDTH, FissionEnergyChartView.LEGEND_HEIGHT);
            graphics.endFill();

            var x = 15;
            var w = 20;
            var y1 = 20;
            var y2 = FissionEnergyChartView.LEGEND_HEIGHT - 20;

            graphics.lineStyle(FissionEnergyChartView.LINE_WIDTH, POTENTIAL_LINE_COLOR, FissionEnergyChartView.LINE_ALPHA);
            graphics.moveTo(x, y1);
            graphics.lineTo(x + w, y1);
            graphics.lineStyle(FissionEnergyChartView.LINE_WIDTH, TOTAL_ENERGY_LINE_COLOR, FissionEnergyChartView.LINE_ALPHA);
            graphics.moveTo(x, y2);
            graphics.lineTo(x + w, y2);

            var textSettings = {
                font: Constants.FissionEnergyChartView.LEGEND_LABEL_FONT,
                fill: Constants.FissionEnergyChartView.LEGEND_LABEL_COLOR,
                align: 'center'
            };
            var labelX = x + w + x;
            var potentialEnergyLabel = new PIXI.Text('Potential Energy', textSettings);
            var totalEnergyLabel = new PIXI.Text('Total Energy', textSettings);
            potentialEnergyLabel.x = labelX;
            potentialEnergyLabel.y = y1;
            potentialEnergyLabel.anchor.y = 0.5;
            potentialEnergyLabel.resolution = this.getResolution();
            totalEnergyLabel.x = labelX;
            totalEnergyLabel.y = y2;
            totalEnergyLabel.anchor.y = 0.5;
            totalEnergyLabel.resolution = this.getResolution();

            var textContainer = new PIXI.Container();
            textContainer.addChild(potentialEnergyLabel);
            textContainer.addChild(totalEnergyLabel);

            var legend = new PIXI.Container();
            legend.x = this.graphOriginX + this.graphWidth - FissionEnergyChartView.LEGEND_WIDTH;
            legend.y = this.graphOriginY - FissionEnergyChartView.LEGEND_Y - FissionEnergyChartView.LEGEND_HEIGHT;
            legend.addChild(graphics);
            legend.addChild(textContainer);

            this.displayObject.addChild(legend);
        },

        drawXAxis: function() {
            this.xAxisContainer.removeChildren();

            // Draw axis line
            var axisLine = new PIXI.Graphics();
            axisLine.lineStyle(FissionEnergyChartView.AXIS_LINE_WIDTH, this.axisLineColor, 1);

            var headWidth = this.arrowHeadWidth;
            var headLength = this.arrowHeadLength;
            var midPoint = this.graphOriginX + (this.graphWidth / 2);
            axisLine.drawStickArrow(
                midPoint,          this.graphOriginY,
                this.graphOriginX, this.graphOriginY,
                headWidth, headLength
            );
            axisLine.drawStickArrow(
                midPoint,                            this.graphOriginY,
                this.graphOriginX + this.graphWidth, this.graphOriginY,
                headWidth, headLength
            );

            // Create bottom axis label (time)
            var bottomAxisLabel = new PIXI.Text('Distance Between Daughter Nuclei', {
                font: Constants.FissionEnergyChartView.AXIS_LABEL_FONT,
                fill: Constants.FissionEnergyChartView.AXIS_LABEL_COLOR
            });
            bottomAxisLabel.resolution = this.getResolution();
            bottomAxisLabel.x = this.graphOriginX + this.graphWidth - 16;
            bottomAxisLabel.y = this.graphOriginY + 9;
            bottomAxisLabel.anchor.x = 1;

            // Create ticks
            this.xAxisTicks = new PIXI.Graphics();
            this.xAxisTickLabels = new PIXI.Container();

            // Add everything
            this.xAxisContainer.addChild(axisLine);
            this.xAxisContainer.addChild(this.xAxisTicks);
            this.xAxisContainer.addChild(this.xAxisTickLabels);
            this.xAxisContainer.addChild(bottomAxisLabel);

            this.drawXAxisTicks();
        },

        drawXAxisTicks: function() {
            // Remove the existing tick marks and labels.
            this.xAxisTicks.clear();
            this.xAxisTicks.lineStyle(FissionEnergyChartView.TICK_MARK_WIDTH, this.tickColor, 1);
            this.xAxisTickLabels.removeChildren();

            this.drawXAxisTick(this.graphWidth / 2, '0');
        },

        drawXAxisTick: function(x, labelText) {
            x = this.graphOriginX + x;
            var y = this.graphOriginY;
            
            this.xAxisTicks.moveTo(x, y);
            this.xAxisTicks.lineTo(x, y - FissionEnergyChartView.TICK_MARK_LENGTH);   

            var label = new PIXI.Text(labelText, {
                font: FissionEnergyChartView.SMALL_LABEL_FONT,
                fill: this.tickColor
            });

            label.x = x;
            label.y = y;
            label.anchor.x = 0.5;
            label.anchor.y = -0.2;
            label.resolution = this.getResolution();

            this.xAxisTickLabels.addChild(label);
        },

        drawYAxis: function() {
            this.yAxisContainer.removeChildren();

            var label = new PIXI.Text(this.yAxisLabelText, {
                font: Constants.FissionEnergyChartView.AXIS_LABEL_FONT,
                fill: Constants.FissionEnergyChartView.AXIS_LABEL_COLOR,
                align: 'center'
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX + this.yAxisLineXOffset;
            label.y = this.graphOriginY - this.graphHeight / 2 + 5;
            label.anchor.x = 0.5;
            label.anchor.y = 1.2;
            label.rotation = -Math.PI / 2;

            // Draw axis line
            var axisLine = new PIXI.Graphics();
            axisLine.lineStyle(FissionEnergyChartView.AXIS_LINE_WIDTH, this.axisLineColor, 1);
            axisLine.drawStickArrow(
                this.graphOriginX + this.yAxisLineXOffset, this.graphOriginY,
                this.graphOriginX + this.yAxisLineXOffset, this.graphOriginY - this.graphHeight,
                this.arrowHeadWidth, this.arrowHeadLength
            );

            this.yAxisContainer.addChild(axisLine);
            this.yAxisContainer.addChild(label);
        },

        drawTotalEnergyLine: function() {
            var graphics = this.totalEnergyGraphics;
            graphics.clear();
            graphics.lineStyle(FissionEnergyChartView.LINE_WIDTH, TOTAL_ENERGY_LINE_COLOR, FissionEnergyChartView.LINE_ALPHA);

            var margin = this.energyLineMargin;
            graphics.moveTo(this.graphOriginX + this.graphWidth - margin, 0);
            graphics.lineTo(this.graphOriginX + this.yAxisLineXOffset, 0);
            graphics.moveTo(this.graphOriginX + this.yAxisLineXOffset - this.yAxisLabelWidth, 0);
            graphics.lineTo(this.graphOriginX + margin, 0);

            graphics.lineStyle(FissionEnergyChartView.LINE_WIDTH, TOTAL_ENERGY_LINE_COLOR, 0.5);
            graphics.moveTo(this.graphOriginX + this.yAxisLineXOffset, 0);
            graphics.dashTo(this.graphOriginX + this.yAxisLineXOffset - this.yAxisLabelWidth, 0, [2, 2]);

            // Position it in its default position -- MAYBE THIS IS TEMPORARY TODO
            graphics.y = this.graphOriginY - this.graphHeight * 0.64;
        },

        /**
         * This method draws the line that represents the potential energy well
         *   for the nucleus.
         */
        drawPotentialEnergyLine: function() {
            
            // Clear the existing curve.
            var graphics = this.potentialEnergyGraphics;
            graphics.clear();
            graphics.lineStyle(FissionEnergyChartView.LINE_WIDTH, POTENTIAL_LINE_COLOR, FissionEnergyChartView.LINE_ALPHA);
            
            var margin     = this.energyLineMargin;
            var startX     = this.graphOriginX + margin;
            var centerX    = this.graphOriginX + this.graphWidth / 2;
            var endX       = this.graphOriginX + this.graphWidth - margin;
            var xScreenPos = startX;

            // The following multiplier is used to scale the left and right tails of
            //   the curve to values that make the visual representation reasonable.
            var energyWellWidth = this.nucleusDiameter;
            var tailMultiplier = energyWellWidth * FissionEnergyChartView.PEAK_OF_ENERGY_WELL / 2;
            
            // Define the crossover zone between the calculation for the tails
            //   and the calculation for the energy well.  This is arbitrarily
            //   chosen to make the curve look good.
            var crossoverDistanceFromCenter = energyWellWidth * 0.6;
            var crossoverZoneWidth = energyWellWidth / 4;
            
            // Move to the starting point for the curve.
            var yGraphPos = (1 / (centerX - xScreenPos)) * tailMultiplier;
            graphics.moveTo(xScreenPos, this.convertGraphToScreenY(yGraphPos)); 

            // Draw the curve.
            while (xScreenPos < endX) {
                xScreenPos += 1;
                
                var xGraphPos = xScreenPos - centerX;
                    
                if (xScreenPos < centerX - crossoverDistanceFromCenter - crossoverZoneWidth / 2) {
                    // Left side (tail) of the curve.
                    yGraphPos = (1/-xGraphPos) * tailMultiplier;
                    graphics.lineTo(xScreenPos, this.convertGraphToScreenY(yGraphPos));
                    xScreenPos += 5;
                }
                else if (xScreenPos < centerX - crossoverDistanceFromCenter + crossoverZoneWidth / 2) {
                    // Crossing into the well.
                    var wellWeightingFactor = this.computeWellWeightingFactor(
                        centerX, xScreenPos, crossoverDistanceFromCenter, crossoverZoneWidth
                    );
                    yGraphPos = (
                        (((1 / -xGraphPos) * tailMultiplier) * (1 - wellWeightingFactor)) + 
                        (this.calculateWellValue(xGraphPos) * (wellWeightingFactor))
                    );
                    graphics.lineTo(xScreenPos, this.convertGraphToScreenY(yGraphPos));
                    xScreenPos++;
                }
                else if (xScreenPos < centerX + crossoverDistanceFromCenter - crossoverZoneWidth / 2) {
                    // Inside the well.
                    yGraphPos = this.calculateWellValue(xGraphPos);
                    graphics.lineTo(xScreenPos, this.convertGraphToScreenY(yGraphPos));
                    xScreenPos++;
                }
                else if (xScreenPos < centerX + crossoverDistanceFromCenter + crossoverZoneWidth / 2) {
                    // Crossing out of the well.
                    var wellWeightingFactor = this.computeWellWeightingFactor(centerX, xScreenPos, crossoverDistanceFromCenter, crossoverZoneWidth);
                    yGraphPos = (
                        (((1 / xGraphPos) * tailMultiplier) * (1 - wellWeightingFactor)) + 
                        (this.calculateWellValue(xGraphPos) * (wellWeightingFactor))
                    );
                    graphics.lineTo(xScreenPos, this.convertGraphToScreenY(yGraphPos));
                    xScreenPos++;
                }
                else if (xScreenPos < endX) {
                    // Right side (tail) of the curve.
                    yGraphPos = (1 / xGraphPos) * tailMultiplier;
                    graphics.lineTo(xScreenPos, this.convertGraphToScreenY(yGraphPos));
                    xScreenPos += 5;
                }
                else {
                    // Just increment the screen position so we will fall out of the loop.
                    xScreenPos += 10;
                }
            }
        },

        /**
         * Compute the weighting factor that is used to "crossfade" between the tail
         *   portion of the graph and the center energy well.
         */
        computeWellWeightingFactor: function(centerX, xScreenPos, crossoverDistanceFromCenter, crossoverZoneWidth) {
            // The computation is not linear - it is made to be weighted more heavily on either end.
            var linearFactor = 1 - (
                (
                    Math.abs(centerX - xScreenPos) - crossoverDistanceFromCenter + crossoverZoneWidth / 2
                ) / crossoverZoneWidth
            );
            return (-Math.cos(Math.PI * linearFactor) + 1) / 2;
        },

        calculateWellValue: function(xGraphPos) {
            return FissionEnergyChartView.BOTTOM_OF_ENERGY_WELL + (
                (Math.cos(((xGraphPos * 2 / this.nucleusDiameter) - 1) * Math.PI) + 1) * 
                (FissionEnergyChartView.PEAK_OF_ENERGY_WELL - FissionEnergyChartView.BOTTOM_OF_ENERGY_WELL) / 
                2
            );
        },

        /**
         * Convert a Y axis value in graph units to a screen value.
         */
        convertGraphToScreenY: function(y) {
            return (this.graphOriginY - (y * (this.graphHeight / FissionEnergyChartView.Y_AXIS_TOTAL_POSITVE_SPAN)));
        },

        update: function(time, deltaTime, paused) {
            if (!paused && (
                    this.fissionState == FissionEnergyChartView.STATE_FISSIONING || 
                    this.fissionState == FissionEnergyChartView.STATE_FISSIONED
                )
            ) {
                this.updateNucleiPositions(time, deltaTime);
            }
        },

        updateNucleiPositions: function(time, deltaTime, paused) {
            var xPos;
            var yPos;
            
            switch (this.fissionState) {
                case FissionEnergyChartView.STATE_IDLE:
                    // Position the unfissioned nucleus image at the bottom of the energy well.
                    this.unfissionedNucleus.visible = true;
                    xPos = this.graphOriginX + this.graphWidth / 2;
                    yPos = this.convertGraphToScreenY(FissionEnergyChartView.BOTTOM_OF_ENERGY_WELL);
                    this.unfissionedNucleus.x = xPos;
                    this.unfissionedNucleus.y = yPos;
                    
                    // Position the total energy line, also at the bottom of the well.
                    this.totalEnergyGraphics.y = yPos;

                    break;
                
                case FissionEnergyChartView.STATE_FISSIONING:
                    // Move the unfissioned nucleus up toward the top of the energy
                    //   well.  Jitter it to create the impression of instability.

                    xPos = this.graphOriginX + this.graphWidth / 2;
                    
                    // Cause the nucleus to move upward.
                    var nucleusBasePosY = this.convertGraphToScreenY(FissionEnergyChartView.BOTTOM_OF_ENERGY_WELL);
                    var nucleusTopPosY  = this.convertGraphToScreenY(FissionEnergyChartView.PEAK_OF_ENERGY_WELL);
                    
                    if (this.unfissionedNucleus.y > nucleusTopPosY) {
                        yPos = this.unfissionedNucleus.y + (
                            (nucleusTopPosY - nucleusBasePosY) / FissionEnergyChartView.NUM_UPWARD_STEPS_FOR_NUCLEUS
                        );

                        if (yPos < nucleusTopPosY)
                            yPos = nucleusTopPosY;
                    }
                    else {
                        yPos = nucleusTopPosY;
                    }
                    
                    // Create a bit of jitter along the x-axis to create a look of
                    // instability.
                    xPos += xPos * (Math.random() - 0.5) * 0.10;//(Math.random() - 0.5) * this.nucleusDiameter * 0.8;
                    this.unfissionedNucleus.x = xPos;
                    this.unfissionedNucleus.y = yPos;
                    
                    // Move the total energy line up with the nucleus.
                    this.totalEnergyGraphics.y = yPos;

                    break;
                
                case FissionEnergyChartView.STATE_FISSIONED:
                    // Move the daughter nuclei based on their current distance from
                    //   the origin in the model.
                    
                    // Y position is the same for both nuclei - at the top of the energy well.
                    yPos = this.convertGraphToScreenY(FissionEnergyChartView.PEAK_OF_ENERGY_WELL);
                    
                    // Figure out X position of the larger daughter nucleus.
                    xPos = this.graphOriginX + this.graphWidth / 2 + this.mvt.modelToViewDeltaX(this.model.getX());
                    if ((xPos < this.graphOriginX + this.graphWidth) && (xPos > this.graphOriginX)) {
                        // Set the position for this image.
                        this.daughterNucleus2.x = xPos; 
                        this.daughterNucleus2.y = yPos;
                    }
                    else {
                        // Don't bother showing and updating the nucleus if it is off the chart.
                        this.daughterNucleus2.visible = false;
                    }
                    
                    // Figure out X position of the smaller daughter nucleus.
                    if (this.daughterNucleusModel) {
                        xPos = this.graphOriginX + this.graphWidth / 2 + this.mvt.modelToViewDeltaX(this.daughterNucleusModel.getX());
                        if ((xPos < this.graphOriginX + this.graphWidth) && (xPos > this.graphOriginX)) {
                            // Set the position for this image.
                            this.daughterNucleus1.x = xPos;
                            this.daughterNucleus1.y = yPos;
                        }
                        else {
                            // Don't bother showing and updating the nucleus if it is off the chart.
                            this.daughterNucleus1.visible = false;
                        }
                    }
                    
                    // Position the total energy line at the top of the well.
                    this.totalEnergyGraphics.y = this.convertGraphToScreenY(FissionEnergyChartView.PEAK_OF_ENERGY_WELL);

                    break;
            }
        },

        nucleusChanged: function(nucleus, byProducts) {
            if (byProducts !== null) {
                for (var i = 0; i < byProducts.length; i++) {
                    if (byProducts[i] instanceof DaughterCompositeNucleus)
                        this.daughterNucleusModel = byProducts[i];
                }

                if (this.daughterNucleusModel === null)
                    throw 'Daughter nucleus not found.';
                
                this.fissionState = FissionEnergyChartView.STATE_FISSIONED;
                this.unfissionedNucleus.visible = false;
                this.daughterNucleus1.visible = true;
                this.daughterNucleus2.visible = true;
                this.updateNucleiPositions();
            }
            else if (nucleus.get('numNeutrons') > this.origNumNeturons) {
                // This event signifies the capture of a neutron and thus
                // the start of the fissioning process.
                this.fissionState = FissionEnergyChartView.STATE_FISSIONING;
                this.updateNucleiPositions();
            }
            else if (nucleus.get('numNeutrons') == this.origNumNeturons) {
                // This event signifies the nucleus being reset to its
                // original configuration.
                this.fissionState = FissionEnergyChartView.STATE_IDLE;
                this.daughterNucleusModel = null;
                this.unfissionedNucleus.visible = true;
                this.daughterNucleus1.visible = false;
                this.daughterNucleus2.visible = false;
                this.updateNucleiPositions();
            }
            else {
                // This should never happen, debug it if it does.
                throw 'Error: Unable to interpret decay event.';
            }
        }

    }, Constants.FissionEnergyChartView);


    return FissionEnergyChartView;
});