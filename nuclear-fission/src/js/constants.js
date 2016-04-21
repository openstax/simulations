define(function (require) {

    'use strict';

    var range   = require('common/math/range');
    var Vector2 =require('common/math/vector2');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var Constants = require('nuclear-physics/constants'); 

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 40;


    /*************************************************************************
     **                                                                     **
     **                       ONE NUCLEUS SIMULATION                        **
     **                                                                     **
     *************************************************************************/

    var OneNucleusSimulation = {};

    OneNucleusSimulation.MOVING_NUCLEON_VELOCITY      = 1.0;  // Femtometers per tick.
    OneNucleusSimulation.INITIAL_NUCLEUS_VELOCITY     = 0.05; // Femtometers per tick.
    OneNucleusSimulation.INITIAL_NUCLEUS_ACCELERATION = 0.4;  // Femtometers per tick per tick.

    // Time, in sim milliseconds, from the capture of a neutron until fission occurs.
    OneNucleusSimulation.FISSION_INTERVAL = 1200;

    Constants.OneNucleusSimulation = OneNucleusSimulation;


    /*************************************************************************
     **                                                                     **
     **                      FISSION ENERGY CHART VIEW                      **
     **                                                                     **
     *************************************************************************/

    var FissionEnergyChartView = {};

    FissionEnergyChartView.AXIS_LABEL_FONT  = Constants.NucleusDecayChart.AXIS_LABEL_FONT;
    FissionEnergyChartView.AXIS_LABEL_COLOR = Constants.NucleusDecayChart.AXIS_LABEL_COLOR;
    FissionEnergyChartView.AXIS_LINE_WIDTH  = Constants.NucleusDecayChart.AXIS_LINE_WIDTH;
    FissionEnergyChartView.AXIS_LINE_COLOR  = Constants.NucleusDecayChart.AXIS_LINE_COLOR;
    FissionEnergyChartView.TICK_MARK_LENGTH = 6;
    FissionEnergyChartView.TICK_MARK_WIDTH  = Constants.NucleusDecayChart.TICK_MARK_WIDTH;
    FissionEnergyChartView.TICK_MARK_COLOR  = Constants.NucleusDecayChart.TICK_MARK_COLOR;
    FissionEnergyChartView.SMALL_LABEL_FONT = Constants.NucleusDecayChart.SMALL_LABEL_FONT;
    FissionEnergyChartView.LARGE_LABEL_FONT = Constants.NucleusDecayChart.LARGE_LABEL_FONT;

    FissionEnergyChartView.DECAY_LABEL_COLOR = Constants.NucleusDecayChart.DECAY_LABEL_COLOR
    FissionEnergyChartView.DECAY_LABEL_FONT  = Constants.NucleusDecayChart.DECAY_LABEL_FONT
    FissionEnergyChartView.DECAY_VALUE_FONT  = Constants.NucleusDecayChart.DECAY_VALUE_FONT

    FissionEnergyChartView.LINE_WIDTH = 2;
    FissionEnergyChartView.LINE_ALPHA = 1;
    FissionEnergyChartView.POTENTIAL_LINE_COLOR    = '#00f';
    FissionEnergyChartView.TOTAL_ENERGY_LINE_COLOR = '#ff0';

    FissionEnergyChartView.LEGEND_WIDTH = 160;
    FissionEnergyChartView.LEGEND_HEIGHT = 60;
    FissionEnergyChartView.LEGEND_Y = 50;
    FissionEnergyChartView.LEGEND_LABEL_FONT = 'bold 12px Helvetica Neue';
    FissionEnergyChartView.LEGEND_LABEL_COLOR = '#000';

    Constants.FissionEnergyChartView = FissionEnergyChartView;


    return Constants;
});
