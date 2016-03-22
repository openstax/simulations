define(function (require) {

    'use strict';

    var HalfLifeInfo = require('models/half-life-info');
    var NucleusType  = require('models/nucleus-type');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.FRAME_RATE = 25;
    Constants.DELTA_TIME_PER_FRAME = 5;

    //----------------------------------------------------------------------------
    // Paints and Colors
    //----------------------------------------------------------------------------
    var defaultColor   = '#ff0';
    var decayedColor   = '#fff';
    var alternateColor = '#0f0';

    // Color for the isotope labels used for the nucleus views.
    Constants.POLONIUM_LABEL_COLOR                  = defaultColor;
    Constants.LEAD_LABEL_COLOR                      = decayedColor;
    Constants.CUSTOM_NUCLEUS_LABEL_COLOR            = defaultColor;
    Constants.CUSTOM_NUCLEUS_POST_DECAY_LABEL_COLOR = decayedColor;
    Constants.HYDROGEN_3_LABEL_COLOR                = defaultColor;
    Constants.HELIUM_3_LABEL_COLOR                  = decayedColor;
    Constants.CARBON_14_LABEL_COLOR                 = defaultColor;
    Constants.NITROGEN_14_LABEL_COLOR               = decayedColor;
    Constants.URANIUM_235_LABEL_COLOR               = '#0f0';
    Constants.URANIUM_236_LABEL_COLOR               = '#f80';
    Constants.URANIUM_238_LABEL_COLOR               = '#ff0';
    Constants.URANIUM_239_LABEL_COLOR               = '#fff';
    
    // Color for nuclei when represented as a circle or sphere.
    Constants.HYDROGEN_COLOR = '#FFC0DB';
    Constants.HELIUM_COLOR = '#0ff';
    Constants.CARBON_COLOR = '#C80000';
    Constants.NITROGEN_COLOR = '#0E56C8';
    Constants.URANIUM_COLOR = '#969600';
    Constants.LEAD_COLOR = '#61757E';
    Constants.POLONIUM_COLOR = '#f80';
    Constants.CUSTOM_NUCLEUS_PRE_DECAY_COLOR = '#9B612A';
    Constants.CUSTOM_NUCLEUS_POST_DECAY_COLOR = '#368237';
    
    // Colors for the strata in the Radioactive Dating Game, assumed to go
    // from top to bottom.
    // public static final ArrayList<Color> strataColors = new ArrayList<Color>();
    // static {
    //     strataColors.add( new Color( 111, 131, 151 ) );
    //     strataColors.add( new Color( 153, 185, 216 ) );
    //     strataColors.add( new Color( 216, 175, 208 ) );
    //     strataColors.add( new Color( 198, 218, 119 ) );
    //     strataColors.add( new Color( 179, 179, 179 ) );
    //     strataColors.add( Color.DARK_GRAY );
    // }

    //----------------------------------------------------------------------------
    // Misc Constants Shared within the Sim
    //----------------------------------------------------------------------------
    Constants.NUCLEON_DIAMETER        = 1.6;  // In femtometers.
    Constants.ALPHA_PARTICLE_DIAMETER = 3.2;  // In femtometers.
    Constants.ELECTRON_DIAMETER       = 0.75; // In femtometers, not to scale, or even close.
    Constants.ANTINEUTRINO_DIAMETER   = 0.3;  // In femtometers, not to scale, or even close.

    Constants.PROTON_COLOR       = '#f00';
    Constants.NEUTRON_COLOR      = '#888';
    Constants.ELECTRON_COLOR     = '#069EC7';
    Constants.ANTINEUTRINO_COLOR = '#00C800';
    
    Constants.DEFAULT_CUSTOM_NUCLEUS_HALF_LIFE = HalfLifeInfo.convertYearsToMs(100E3);



    /*************************************************************************
     **                                                                     **
     **                   MULTI-NUCLEUS DECAY SIMULATION                    **
     **                                                                     **
     *************************************************************************/

    var MultiNucleusDecaySimulation = {};

    MultiNucleusDecaySimulation.DEFAULT_JITTER_LENGTH = 1;
    MultiNucleusDecaySimulation.FRAMES_PER_JITTER = 2;

    Constants.MultiNucleusDecaySimulation = MultiNucleusDecaySimulation;


    /*************************************************************************
     **                                                                     **
     **                               NUCLEON                               **
     **                                                                     **
     *************************************************************************/

    var Nucleon = {};

    // Possible types of nucleons.  Not done as subclasses since they can
    //   change into one another.
    Nucleon.PROTON  = 1;
    Nucleon.NEUTRON = 2;

    // Distance used for jittering the nucleons.
    Nucleon.JITTER_DISTANCE = Constants.NUCLEON_DIAMETER * 0.1;

    Constants.Nucleon = Nucleon;


    /*************************************************************************
     **                                                                     **
     **                            ALPHA PARTICLE                           **
     **                                                                     **
     *************************************************************************/

    var AlphaParticle = {};

    AlphaParticle.MAX_AUTO_TRANSLATE_AMT = 0.75;
    
    // Possible states for tunneling.
    AlphaParticle.IN_NUCLEUS               = 0;
    AlphaParticle.TUNNELING_OUT_OF_NUCLEUS = 1;
    AlphaParticle.TUNNELED_OUT_OF_NUCLEUS  = 2;
    
    // Distance at which we consider the particle done tunneling, in fm.
    AlphaParticle.MAX_TUNNELING_DISTANCE = 1000;

    Constants.AlphaParticle = AlphaParticle;


    /*************************************************************************
     **                                                                     **
     **                            ATOMIC NUCLEUS                           **
     **                                                                     **
     *************************************************************************/

    var AtomicNucleus = {};

    // Radius at which the repulsive electrical force overwhelms the strong
    // force.
    AtomicNucleus.DEFAULT_TUNNELING_REGION_RADIUS = 15;
    AtomicNucleus.MAX_TUNNELING_REGION_RADIUS = 200;

    Constants.AtomicNucleus = AtomicNucleus;


    /*************************************************************************
     **                                                                     **
     **                       COMPOSITE ATOMIC NUCLEUS                      **
     **                                                                     **
     *************************************************************************/

    var CompositeAtomicNucleus = {};

    // Default value for agitation.
    CompositeAtomicNucleus.DEFAULT_AGITATION_FACTOR = 5;
    // Maximum value for agitation.
    CompositeAtomicNucleus.MAX_AGITATION_FACTOR = 9;

    Constants.CompositeAtomicNucleus = CompositeAtomicNucleus;


    /*************************************************************************
     **                                                                     **
     **                     BETA DECAY COMPOSITE NUCLEUS                    **
     **                                                                     **
     *************************************************************************/

    var BetaDecayCompositeNucleus = {};

    BetaDecayCompositeNucleus.ANTINEUTRINO_EMISSION_SPEED = 0.8; // Femtometers per clock tick.  Weird, I know.
    BetaDecayCompositeNucleus.ELECTRON_EMISSION_SPEED     = 0.4; // Femtometers per clock tick.  Weird, I know.

    Constants.BetaDecayCompositeNucleus = BetaDecayCompositeNucleus;


    /*************************************************************************
     **                                                                     **
     **                     ABSTRACT BETA DECAY NUCLEUS                     **
     **                                                                     **
     *************************************************************************/

    var AbstractBetaDecayNucleus = {};

    AbstractBetaDecayNucleus.ANTINEUTRINO_EMISSION_SPEED = 1.5; // Femtometers per clock tick.  Weird, I know.
    AbstractBetaDecayNucleus.ELECTRON_EMISSION_SPEED     = 0.8; // Femtometers per clock tick.  Weird, I know.

    Constants.AbstractBetaDecayNucleus = AbstractBetaDecayNucleus;


    /*************************************************************************
     **                                                                     **
     **                  HEAVY ADJUSTABLE-HALF-LIFE NUCLEUS                 **
     **                                                                     **
     *************************************************************************/

    var HeavyAdjustableHalfLifeNucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.  The
    // values below are for Bismuth 208.
    HeavyAdjustableHalfLifeNucleus.ORIGINAL_NUM_PROTONS = 83;
    HeavyAdjustableHalfLifeNucleus.ORIGINAL_NUM_NEUTRONS = 125;

    // Random number generator used for calculating decay time based on half life.
    HeavyAdjustableHalfLifeNucleus.DEFAULT_HALF_LIFE = 1100;  // In milliseconds.

    Constants.HeavyAdjustableHalfLifeNucleus = HeavyAdjustableHalfLifeNucleus;


    /*************************************************************************
     **                                                                     **
     **                         POLONIUM 211 NUCLEUS                        **
     **                                                                     **
     *************************************************************************/

    var Polonium211Nucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.  The
    // values below are for Bismuth 208.
    Polonium211Nucleus.ORIGINAL_NUM_PROTONS = 84;
    Polonium211Nucleus.ORIGINAL_NUM_NEUTRONS = 127;

    // Random number generator used for calculating decay time based on half life.
    Polonium211Nucleus.HALF_LIFE = 516;  // In milliseconds.

    Constants.Polonium211Nucleus = Polonium211Nucleus;


    /*************************************************************************
     **                                                                     **
     **                          CARBON 14 NUCLEUS                          **
     **                                                                     **
     *************************************************************************/

    var Carbon14Nucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.
    Carbon14Nucleus.PROTONS  = 6;
    Carbon14Nucleus.NEUTRONS = 8;

    // Half life for Carbon 14.
    Carbon14Nucleus.HALF_LIFE = HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.CARBON_14);

    // Time scaling factor - scales the rate at which decay occurs so that we
    //   don't really have to wait around thousands of years.  Smaller values
    //   cause quicker decay.
    Carbon14Nucleus.DECAY_TIME_SCALING_FACTOR = 1500 / Carbon14Nucleus.HALF_LIFE;

    Constants.Carbon14Nucleus = Carbon14Nucleus;


    /*************************************************************************
     **                                                                     **
     **                     CARBON 14 COMPOSITE NUCLEUS                     **
     **                                                                     **
     *************************************************************************/

    var Carbon14CompositeNucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.
    Carbon14CompositeNucleus.PROTONS  = Carbon14Nucleus.PROTONS;
    Carbon14CompositeNucleus.NEUTRONS = Carbon14Nucleus.NEUTRONS;

    // Half life for Carbon 14.
    Carbon14CompositeNucleus.HALF_LIFE = Carbon14Nucleus.HALF_LIFE;

    // Time scaling factor - scales the rate at which decay occurs so that we
    //   don't really have to wait around thousands of years.  Smaller values
    //   cause quicker decay.
    Carbon14CompositeNucleus.DECAY_TIME_SCALING_FACTOR = 700 / HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.CARBON_14);

    // The "agitation factor" for the various types of nucleus.  The amount of
    //   agitation controls how dynamic the nucleus looks on the canvas. Values
    //   must be in the range 0-9.
    Carbon14CompositeNucleus.CARBON_14_AGITATION_FACTOR = 8;
    Carbon14CompositeNucleus.NITROGEN_14_AGITATION_FACTOR = 2;

    Constants.Carbon14CompositeNucleus = Carbon14CompositeNucleus;


    /*************************************************************************
     **                                                                     **
     **                     HYDROGEN 3 COMPOSITE NUCLEUS                    **
     **                                                                     **
     *************************************************************************/

    var Hydrogen3CompositeNucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.
    Hydrogen3CompositeNucleus.PROTONS  = 1;
    Hydrogen3CompositeNucleus.NEUTRONS = 2;

    // Time scaling factor - scales the rate at which decay occurs so that we
    // don't really have to wait around thousands of years.  Smaller values
    // cause quicker decay.
    Hydrogen3CompositeNucleus.DECAY_TIME_SCALING_FACTOR = 500 / HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.HYDROGEN_3);

    // The "agitation factor" for the various types of nucleus.  The amount of
    //   agitation controls how dynamic the nucleus looks on the canvas. Values
    //   must be in the range 0-9.
    Hydrogen3CompositeNucleus.HYDROGEN_3_AGITATION_FACTOR = 8;
    Hydrogen3CompositeNucleus.HELIUM_3_AGITATION_FACTOR   = 2;

    Constants.Hydrogen3CompositeNucleus = Hydrogen3CompositeNucleus;


    /*************************************************************************
     **                                                                     **
     **                         HYDROGEN 3 NUCLEUS                          **
     **                                                                     **
     *************************************************************************/

    var Hydrogen3Nucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.
    Hydrogen3Nucleus.PROTONS  = 1;
    Hydrogen3Nucleus.NEUTRONS = 2;

    // Time scaling factor - scales the rate at which decay occurs so that we
    //   don't really have to wait around thousands of years.  Smaller values
    //   cause quicker decay.
    Hydrogen3Nucleus.DECAY_TIME_SCALING_FACTOR = 1500 / HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.HYDROGEN_3);

    Constants.Hydrogen3Nucleus = Hydrogen3Nucleus;


    /*************************************************************************
     **                                                                     **
     **                 LIGHT ADJUSTABLE-HALF-LIFE NUCLEUS                  **
     **                                                                     **
     *************************************************************************/

    var LightAdjustableHalfLifeNucleus = {};

    // Number of neutrons and protons in the nucleus upon construction.
    LightAdjustableHalfLifeNucleus.PROTONS  = 8;
    LightAdjustableHalfLifeNucleus.NEUTRONS = 8;

    // Time scaling factor - scales the rate at which decay occurs so that we
    //   don't really have to wait around thousands of years.  Smaller values
    //   cause quicker decay.
    LightAdjustableHalfLifeNucleus.DECAY_TIME_SCALING_FACTOR = 1500 / HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.LIGHT_CUSTOM);

    Constants.LightAdjustableHalfLifeNucleus = LightAdjustableHalfLifeNucleus;


    /*************************************************************************
     **                                                                     **
     **                 LIGHT ADJUSTABLE COMPOSITE NUCLEUS                  **
     **                                                                     **
     *************************************************************************/

    var LightAdjustableCompositeNucleus = {};

    // Number of neutrons and protons in the nucleus upon construction. The
    //   values below are for Oxygen-16, which by convention in this sim is
    //   the light nucleus with adjustable half life.
    LightAdjustableCompositeNucleus.PROTONS  = 8;
    LightAdjustableCompositeNucleus.NEUTRONS = 8;

    // Time scaling factor - scales the rate at which decay occurs so that we
    //   don't really have to wait around thousands of years.  Smaller values
    //   cause quicker decay.
    LightAdjustableCompositeNucleus.DECAY_TIME_SCALING_FACTOR = 700 / HalfLifeInfo.getHalfLifeForNucleusType(NucleusType.LIGHT_CUSTOM);

    // The "agitation factor" for the various types of nucleus.  The amount of
    //   agitation controls how dynamic the nucleus looks on the canvas. Values
    //   must be in the range 0-9.
    LightAdjustableCompositeNucleus.PRE_DECAY_AGITATION_FACTOR = 8;
    LightAdjustableCompositeNucleus.POST_DECAY_AGITATION_FACTOR = 2;

    Constants.LightAdjustableCompositeNucleus = LightAdjustableCompositeNucleus;



    var NucleusDecayChart = {};

    // Total amount of time in milliseconds represented by this chart.
    NucleusDecayChart.DEFAULT_TIME_SPAN = 3200;

    // Minimum allowable half life.
    NucleusDecayChart.MIN_HALF_LIFE = 10; // In milliseconds.

    // Constants for controlling the appearance of the chart.
    NucleusDecayChart.AXIS_LABEL_FONT  = 'bold 14px Helvetica Neue';
    NucleusDecayChart.AXIS_LABEL_COLOR = '#000';
    NucleusDecayChart.AXIS_LINE_WIDTH = 2;
    NucleusDecayChart.AXIS_LINE_COLOR = '#000';
    NucleusDecayChart.TICK_MARK_LENGTH = 3;
    NucleusDecayChart.TICK_MARK_WIDTH = 2;
    NucleusDecayChart.TICK_MARK_COLOR = NucleusDecayChart.AXIS_LINE_COLOR;
    NucleusDecayChart.SMALL_LABEL_FONT = '12px Helvetica Neue';
    NucleusDecayChart.LARGE_LABEL_FONT = '14px Helvetica Neue';
    NucleusDecayChart.ISOTOPE_FONT_SIZE = 18;

    NucleusDecayChart.HALF_LIFE_LINE_WIDTH = 2;
    NucleusDecayChart.HALF_LIFE_LINE_DASHES = [3, 3];
    NucleusDecayChart.HALF_LIFE_LINE_COLOR = '#f00';
    NucleusDecayChart.HALF_LIFE_LINE_ALPHA = 1;
    NucleusDecayChart.HALF_LIFE_TEXT_COLOR = '#f00';
    NucleusDecayChart.HALF_LIFE_TEXT_ALPHA = 1;
    NucleusDecayChart.HALF_LIFE_TEXT_FONT  = 'bold 16px Helvetica Neue';
    NucleusDecayChart.HALF_LIFE_ARROW_LENGTH = 28;
    NucleusDecayChart.HALF_LIFE_ARROW_TAIL_WIDTH = 8;
    NucleusDecayChart.HALF_LIFE_ARROW_HEAD_WIDTH = 24;
    NucleusDecayChart.HALF_LIFE_ARROW_HEAD_LENGTH = 18;
    NucleusDecayChart.HALF_LIFE_HOVER_COLOR = '#fff';

    NucleusDecayChart.BUTTON_BG_COLOR = '#21366b';
    NucleusDecayChart.BUTTON_FG_COLOR = '#fff';
    NucleusDecayChart.BUTTON_HOVER_ALPHA = 0.9;
    NucleusDecayChart.BUTTON_FONT = '500 14px Helvetica Neue';

    NucleusDecayChart.DECAY_LABEL_COLOR = NucleusDecayChart.AXIS_LABEL_COLOR;
    NucleusDecayChart.DECAY_LABEL_FONT = NucleusDecayChart.AXIS_LABEL_FONT;
    NucleusDecayChart.DECAY_VALUE_FONT = '14px Helvetica Neue';

    // Tweakable values that can be used to adjust where the nuclei appear on
    // the chart.
    NucleusDecayChart.TIME_ZERO_OFFSET = 100; // In milliseconds
    NucleusDecayChart.FALL_TIME = 0.2; // Time in seconds for nucleus to fall from upper to lower line.
    NucleusDecayChart.TIME_ZERO_OFFSET_PROPORTION = 0.05; // Proportion of total time span

    // Constants that control the way the nuclei look.
    NucleusDecayChart.NUCLEUS_SIZE_PROPORTION = 0.15;  // Fraction of the overall height of the chart.

    Constants.NucleusDecayChart = NucleusDecayChart;


    return Constants;
});
