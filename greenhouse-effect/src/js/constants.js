define(function (require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = {}; 

    /*************************************************************************
     **                                                                     **
     **                         UNIVERSAL CONSTANTS                         **
     **                                                                     **
     *************************************************************************/

    Constants.SPEED_OF_LIGHT = 0.01 * 1000; 

    // Plank's constant
    Constants.h = 6.6310E-34;
    // Boltzmann's constant
    Constants.k = 1.3806503E-23;
    // Speed of light (m/s)
    Constants.C = 0.299792458E9;

    Constants.SUNLIGHT_WAVELENGTH = 400E-9;
    Constants.MICRO_WAVELENGTH    = 20;
    Constants.IR_WAVELENGTH       = 850E-9;
    Constants.VISIBLE_WAVELENGTH  = 580E-9;
    Constants.UV_WAVELENGTH       = 100E-9;

    Constants.DEFAULT_TIME_DELTA_PER_TICK = 1 / 10;
    Constants.DEFAULT_DELAY_BETWEEN_TICKS = 1 / 30;

    Constants.MAX_GLASS_PANES = 3;


    /*************************************************************************
     **                                                                     **
     **                                EARTH                                **
     **                                                                     **
     *************************************************************************/

    var Earth = {};

    Earth.RADIUS = 6370;
    Earth.DIAMETER = Earth.RADIUS * 2;
    Earth.BASE_TEMPERATURE = 251;
    Earth.MAX_EMISSIVITY = 10;
    Earth.DEFAULT_EMISSIVITY = Earth.MAX_EMISSIVITY / 2;
    Earth.PHOTON_EMISSION_TIME = Constants.DEFAULT_TIME_DELTA_PER_TICK;

    Constants.Earth = Earth;


    /*************************************************************************
     **                                                                     **
     **                                 SUN                                 **
     **                                                                     **
     *************************************************************************/

    var Sun = {};

    Sun.DIAMETER = Earth.DIAMETER * 5;
    Sun.RADIUS = Sun.DIAMETER / 2;
    Sun.DISTANCE_FROM_EARTH = Sun.DIAMETER * 5;
    Sun.DEFAULT_PRODUCTION_RATE = 0.034 * 1000;

    Constants.Sun = Sun;


    /*************************************************************************
     **                                                                     **
     **                             ATMOSPHERE                              **
     **                                                                     **
     *************************************************************************/

    var Atmosphere = {};

    Atmosphere.TROPOSPHERE_THICKNESS  = 16;
    Atmosphere.STRATOSPHERE_THICKNESS = 30;

    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY   = 0.0052;
    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_1750    = 0.0050;
    Atmosphere.GREENHOUSE_GAS_CONCENTRATION_ICE_AGE = 0.0044;
    Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION     = 0.009;
    Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION     = 0.00001;
    Atmosphere.DEFAULT_GREENHOUSE_GAS_CONCENTRATION = Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION;
    Atmosphere.CONCENTRATION_RESOLUTION = 100000;

    Atmosphere.POLLUTION_TOP_COLOR = '#555554';
    Atmosphere.POLLUTION_BOTTOM_COLOR = '#fffc86';

    Constants.Atmosphere = Atmosphere;


    /*************************************************************************
     **                                                                     **
     **                               PHOTON                                **
     **                                                                     **
     *************************************************************************/

    var Photon = {};

    Photon.RADIUS = 0.1;
    Photon.MASS = 1;

    Constants.Photon = Photon;


    var PhotonView = {};

    PhotonView.MODEL_DIAMETER = 0.46; // Meters, model space

    Constants.PhotonView = PhotonView;



    /*************************************************************************
     **                                                                     **
     **                             GLASS PANE                              **
     **                                                                     **
     *************************************************************************/

    var GlassPaneView = {};

    GlassPaneView.FILL_COLOR = '#8EBEE1';
    GlassPaneView.FILL_ALPHA = 1;

    Constants.GlassPaneView = GlassPaneView;


    /*************************************************************************
     **                                                                     **
     **                    PHOTON ABSORPTION SIMULATION                     **
     **                                                                     **
     *************************************************************************/

    var PhotonAbsorptionSimulation = {};

    // Constants that controls where and how photons are emitted.
    PhotonAbsorptionSimulation.PHOTON_EMISSION_LOCATION = new Vector2(-1400, 0);
    PhotonAbsorptionSimulation.PHOTON_EMISSION_ANGLE_RANGE = Math.PI / 2;

    // Location used when a single molecule is sitting in the area where the
    //   photons pass through.
    PhotonAbsorptionSimulation.SINGLE_MOLECULE_LOCATION = new Vector2(0, 0);

    // Velocity of emitted photons.  Since they are emitted horizontally, only
    //   one value is needed.  Velocity given in picometers per second.
    PhotonAbsorptionSimulation.PHOTON_VELOCITY = 2000;

    // Distance for a photon to travel before being removed from the model.
    //   This value is essentially arbitrary, and needs to be set such that the
    //   photons only disappear after they have traveled beyond the bounds of
    //   the play area.
    PhotonAbsorptionSimulation.MAX_PHOTON_DISTANCE = 4500;

    // Constants that define the size of the containment area, which is the
    //   rectangle that surrounds the molecule(s).
    PhotonAbsorptionSimulation.CONTAINMENT_AREA_WIDTH  = 3100; // In picometers.
    PhotonAbsorptionSimulation.CONTAINMENT_AREA_HEIGHT = 3000; // In picometers.
    PhotonAbsorptionSimulation.CONTAINMENT_AREA_CENTER = new Vector2(0, 0);
    PhotonAbsorptionSimulation.CONTAINMENT_AREA_RECT = new Rectangle(
        PhotonAbsorptionSimulation.CONTAINMENT_AREA_CENTER.x - PhotonAbsorptionSimulation.CONTAINMENT_AREA_WIDTH / 2,
        PhotonAbsorptionSimulation.CONTAINMENT_AREA_CENTER.y - PhotonAbsorptionSimulation.CONTAINMENT_AREA_HEIGHT / 2,
        PhotonAbsorptionSimulation.CONTAINMENT_AREA_WIDTH,
        PhotonAbsorptionSimulation.CONTAINMENT_AREA_HEIGHT
    );

    // Constants used when trying to find an open location in the atmosphere.
    PhotonAbsorptionSimulation.MIN_DIST_FROM_WALL_X = 20; // In picometers.
    PhotonAbsorptionSimulation.MIN_DIST_FROM_WALL_Y = 20; // In picometers.
    PhotonAbsorptionSimulation.EMITTER_AVOIDANCE_COMP_X = 300;
    PhotonAbsorptionSimulation.EMITTER_AVOIDANCE_COMP_Y = 800;

    // Choices of targets for the photons.
    var PhotonTargets = {
        SINGLE_CO_MOLECULE:      0, 
        SINGLE_CO2_MOLECULE:     1, 
        SINGLE_H2O_MOLECULE:     2, 
        SINGLE_CH4_MOLECULE:     3,
        SINGLE_N2O_MOLECULE:     4, 
        SINGLE_N2_MOLECULE:      5, 
        SINGLE_NO2_MOLECULE:     6, 
        SINGLE_O2_MOLECULE:      7, 
        SINGLE_O3_MOLECULE:      8,
        CONFIGURABLE_ATMOSPHERE: 9
    };
    PhotonAbsorptionSimulation.PhotonTargets = PhotonTargets;

    PhotonAbsorptionSimulation.MAX_NUMBER_OF_MOLECULES = 15;

    // Minimum and defaults for photon emission periods.  Note that the max is
    // assumed to be infinity.
    PhotonAbsorptionSimulation.MIN_PHOTON_EMISSION_PERIOD_SINGLE_TARGET = 0.4;
    PhotonAbsorptionSimulation.DEFAULT_PHOTON_EMISSION_PERIOD = Number.POSITIVE_INFINITY; // Milliseconds of sim time.
    PhotonAbsorptionSimulation.MIN_PHOTON_EMISSION_PERIOD_MULTIPLE_TARGET = 0.1;

    // Default values for various parameters that weren't already covered.
    PhotonAbsorptionSimulation.DEFAULT_PHOTON_TARGET = PhotonTargets.SINGLE_CH4_MOLECULE;
    PhotonAbsorptionSimulation.DEFAULT_EMITTED_PHOTON_WAVELENGTH = Constants.IR_WAVELENGTH;
    PhotonAbsorptionSimulation.INITIAL_COUNTDOWN_WHEN_EMISSION_ENABLED = 0.3;

    Constants.PhotonAbsorptionSimulation = PhotonAbsorptionSimulation;


    /*************************************************************************
     **                                                                     **
     **                               MOLECULE                              **
     **                                                                     **
     *************************************************************************/

    var Molecule = {};

    Molecule.PHOTON_EMISSION_SPEED = 2000; // Picometers per second.
    Molecule.PHOTON_ABSORPTION_DISTANCE = 100;
    Molecule.VIBRATION_FREQUENCY = 5;  // Cycles per second of sim time.
    Molecule.ROTATION_RATE = 1.1;  // Revolutions per second of sim time.
    Molecule.ABSORPTION_HYSTERESIS_TIME = 0.2; // Seconds of sim time.
    Molecule.PASS_THROUGH_PHOTON_LIST_SIZE = 10;

    // Scaler quantity representing the speed at which the constituent particles
    //   move away from each other.  Note that this is a relative speed, not one
    //   that is absolute in model space.
    Molecule.BREAK_APART_VELOCITY = 3.0;

    Constants.Molecule = Molecule;


    /*************************************************************************
     **                                                                     **
     **                                ATOMS                                **
     **                                                                     **
     *************************************************************************/

    var CarbonAtom = {};

    CarbonAtom.COLOR = '#606060';
    CarbonAtom.MASS = 12.011; // In atomic mass units (AMU)
    CarbonAtom.RADIUS = 77;   // In picometers

    Constants.CarbonAtom = CarbonAtom;


    var HydrogenAtom = {};

    HydrogenAtom.COLOR = '#fff';
    HydrogenAtom.MASS = 1;    // In atomic mass units (AMU)
    HydrogenAtom.RADIUS = 37; // In picometers

    Constants.HydrogenAtom = HydrogenAtom;


    var NitrogenAtom = {};

    NitrogenAtom.COLOR = '#7ED738';//'#7ED738';
    NitrogenAtom.MASS = 14.00674;  // In atomic mass units (AMU)
    NitrogenAtom.RADIUS = 75;      // In picometers

    Constants.NitrogenAtom = NitrogenAtom;


    var OxygenAtom = {};

    OxygenAtom.COLOR = '#FF430B';//'#7B00FF';
    OxygenAtom.MASS = 12.011; // In atomic mass units (AMU)
    OxygenAtom.RADIUS = 73;   // In picometers

    Constants.OxygenAtom = OxygenAtom;


    /*************************************************************************
     **                                                                     **
     **                             ATOMIC BOND                             **
     **                                                                     **
     *************************************************************************/

    var AtomicBondView = {};

    AtomicBondView.COLOR = '#0488D3';//'#aaa';
    AtomicBondView.BOND_WIDTH_PROPORTION_SINGLE = 0.45;
    AtomicBondView.BOND_WIDTH_PROPORTION_DOUBLE = 0.28;
    AtomicBondView.BOND_WIDTH_PROPORTION_TRIPLE = 0.24;

    Constants.AtomicBondView = AtomicBondView;



    return Constants;
});
