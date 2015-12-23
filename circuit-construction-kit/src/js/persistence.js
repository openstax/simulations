define(function (require) {

    'use strict';

    var $ = require('jquery');

    var Vector2 = require('common/math/vector2');

    var Circuit  = require('models/circuit');
    var Branch   = require('models/branch');
    var Junction = require('models/junction');

    /**
     * Parses an XML string and creates and returns a circuit object.
     */
    var parseXML = function(xml) {
        var circuit = new Circuit();
        var xmlDoc = $.parseXML(xml);
        var $xml = $(xmlDoc);

        var $circuit = $xml.find('circuit');
        var $junctions = $circuit.find('junction');
        var $branches = $circuit.find('branch');

        $junctions.each(function() {
            var $junction = $(this);
            var x = parseFloat($junction.attr('x'));
            var y = parseFloat($junction.attr('y'));
            var junction = new Junction({
                position: new Vector2(x, y)
            });
            circuit.addJunction(j);
        });

        $branches.each(function() {
            var $branch = $(this);
            var startIndex = $branch.attr('startJunction') ? parseInt($branch.attr('startJunction')) : -1;
            var endIndex   = $branch.attr('endJunction')   ? parseInt($branch.attr('endJunction'))   : -1;
            if (startIndex >= 0 && endIndex >= 0) {
                var startJunction = circuit.junctions.at(startIndex); // This only works if everything stays in order.
                var endJunction   = circuit.junctions.at(endIndex);
                var branch = toBranch(startJunction, endJunction, $branch);
                circuit.addBranch(branch);
            }
            else
                console.error('Bad File: Branch exists with no junctions!');
        });
        
        return circuit;
    };

    var toBranch = function(startJunction, endJunction, $xml) {
        String type = xml.getAttribute( "type", "null" );
        type = updateToLatestVersion( type );
        if ( type.equals( Wire.class.getName() ) ) {
            return new Wire( kl, startJunction, endJunction );
        }
        double length = Double.parseDouble( xml.getAttribute( "length", "-1" ) );
        double height = Double.parseDouble( xml.getAttribute( "height", "-1" ) );

        if ( type.equals( Resistor.class.getName() ) ) {
            Resistor res = new Resistor( kl, startJunction, endJunction, length, height );
            String resVal = xml.getAttribute( "resistance", Double.NaN + "" );
            double val = Double.parseDouble( resVal );
            res.setResistance( val );
            return res;
        }
        else if ( type.equals( ACVoltageSource.class.getName() ) ) {
            double amplitude = Double.parseDouble( xml.getAttribute( "amplitude", Double.NaN + "" ) );
            double freq = Double.parseDouble( xml.getAttribute( "frequency", Double.NaN + "" ) );
            double internalResistance = Double.parseDouble( xml.getAttribute( "internalResistance", Double.NaN + "" ) );
            ACVoltageSource voltageSource = new ACVoltageSource( kl, startJunction, endJunction, length, height, CCKModel.MIN_RESISTANCE, CCKModel.INTERNAL_RESISTANCE_ON );
            voltageSource.setInternalResistance( internalResistance );
            voltageSource.setAmplitude( amplitude );
            voltageSource.setFrequency( freq );
            return voltageSource;
        }
        else if ( type.equals( Capacitor.class.getName() ) ) {
            Capacitor capacitor = new Capacitor( kl, startJunction, endJunction, length, height );
            capacitor.setVoltageDrop( Double.parseDouble( xml.getAttribute( "voltage", Double.NaN + "" ) ) );
            capacitor.setCurrent( Double.parseDouble( xml.getAttribute( "current", Double.NaN + "" ) ) );
            capacitor.setCapacitance( Double.parseDouble( xml.getAttribute( "capacitance", Double.NaN + "" ) ) );
            return capacitor;
        }
        else if ( type.equals( Battery.class.getName() ) ) {
            double internalResistance = Double.parseDouble( xml.getAttribute( "internalResistance", Double.NaN + "" ) );
            Battery batt = new Battery( kl, startJunction, endJunction, length, height, CCKModel.MIN_RESISTANCE, CCKModel.INTERNAL_RESISTANCE_ON );
            batt.setInternalResistance( internalResistance );
            String voltVal = xml.getAttribute( "voltage", Double.NaN + "" );
            double val = Double.parseDouble( voltVal );
            batt.setVoltageDrop( val );
            return batt;
        }
        else if ( type.equals( Switch.class.getName() ) ) {
            String closedVal = xml.getAttribute( "closed", "false" );
            boolean closed = closedVal != null && closedVal.equals( new Boolean( true ).toString() );
            return new Switch( kl, startJunction, endJunction, closed, length, height );
        }
        else if ( type.equals( Bulb.class.getName() ) ) {
            String widthStr = xml.getAttribute( "width", Double.NaN + "" );
            double width = Double.parseDouble( widthStr );
            boolean schematic = !module.isLifelike();
            Bulb bulb = new Bulb( kl, startJunction, endJunction, width, length, height, schematic );
            String resVal = xml.getAttribute( "resistance", Double.NaN + "" );
            double val = Double.parseDouble( resVal );
            bulb.setResistance( val );
            String connectAtLeftStr = xml.getAttribute( "connectAtLeft", "true" );
            boolean connectAtLeft = connectAtLeftStr != null && connectAtLeftStr.equals( new Boolean( true ).toString() );
            bulb.setConnectAtLeftXML( connectAtLeft );
            return bulb;
        }
        else if ( type.equals( SeriesAmmeter.class.getName() ) ) {
            return new SeriesAmmeter( kl, startJunction, endJunction, length, height );
        }
        else if ( type.equals( GrabBagResistor.class.getName() ) ) {
            Resistor res = new Resistor( kl, startJunction, endJunction, length, height );
            String resVal = xml.getAttribute( "resistance", Double.NaN + "" );
            double val = Double.parseDouble( resVal );
            res.setResistance( val );
            return res;
        }
        else if ( type.equals( Inductor.class.getName() ) ) {
            Inductor inductor = new Inductor( kl, startJunction, endJunction, length, height );
            inductor.setVoltageDrop( Double.parseDouble( xml.getAttribute( "voltage", Double.NaN + "" ) ) );
            inductor.setCurrent( Double.parseDouble( xml.getAttribute( "current", Double.NaN + "" ) ) );
            inductor.setInductance( Double.parseDouble( xml.getAttribute( "inductance", Double.NaN + "" ) ) );
            return inductor;
        }
        else if ( type.equals( Wire.class.getName() ) ) {
            Wire res = new Wire( kl, startJunction, endJunction );
            String resVal = xml.getAttribute( "resistance", Double.NaN + "" );
            double val = Double.parseDouble( resVal );
            res.setResistance( val );
            return res;
        }
        return null;
    };

    /**
     * Converts a circuit object into an XML string and returns it.
     */
    var toXML = function(circuit) {

    };


    var Persistence = {
        parseXML: parseXML,
        toXML: toXML
    };

    return Persistence;
});
