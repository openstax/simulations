define(function (require) {

    'use strict';

    var $ = require('jquery');

    var Vector2 = require('common/math/vector2');

    var Circuit         = require('models/circuit');
    var Branch          = require('models/branch');
    var Junction        = require('models/junction');
    var Switch          = require('models/components/switch');
    var Wire            = require('models/components/wire');
    var Resistor        = require('models/components/resistor');
    var ACVoltageSource = require('models/components/ac-voltage-source');
    var Battery         = require('models/components/battery');
    var Capacitor       = require('models/components/capacitor');
    var Bulb            = require('models/components/bulb');
    var SeriesAmmeter   = require('models/components/series-ammeter');
    var GrabBagResistor = require('models/components/grab-bag-resistor');
    var Inductor        = require('models/components/inductor');

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
            circuit.addJunction(junction);
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
        var type = getComponentType($xml.attr('type'));
        
        if (type === 'Wire') {
            return new Wire({
                startJunction: startJunction,
                endJunction: endJunction
            });
        }
        
        var length = parseFloat($xml.attr('length'));
        var height = parseFloat($xml.attr('height'));

        if (type === 'Resistor') {
            return new Resistor({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                resistance: parseFloat($xml.attr('resistance'))
            });
        }
        else if (type === 'ACVoltageSource') {
            return new ACVoltageSource({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                internalResistance: parseFloat($xml.attr('internalResistance')), 
                internalResistanceOn: true,
                amplitude: parseFloat($xml.attr('amplitude')),
                frequency: parseFloat($xml.attr('frequency'))
            });
        }
        else if (type === 'Capacitor') {
            return new Capacitor({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                voltageDrop: parseFloat($xml.attr('voltage')),
                current:     parseFloat($xml.attr('current')),
                capacitance: parseFloat($xml.attr('capacitance'))
            });
        }
        else if (type === 'Battery') {
            return new Battery({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                internalResistance: parseFloat($xml.attr('internalResistance')), 
                internalResistanceOn: true,
                voltageDrop: parseFloat($xml.attr('voltage'))
            });
        }
        else if (type === 'Switch') {
            return new Switch({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                closed: ($xml.attr('closed') && $xml.attr('closed') === 'true')
            });
        }
        else if (type === 'Bulb') {
            return new Bulb({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                width: parseFloat($xml.attr('width')),
                resistance: parseFloat($xml.attr('resistance')),
                connectAtLeft: ($xml.attr('connectAtLeft') && $xml.attr('connectAtLeft') === 'true')
            });
        }
        else if (type === 'SeriesAmmeter') {
            return new SeriesAmmeter({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height
            });
        }
        else if (type === 'GrabBagResistor') {
            return new GrabBagResistor({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                resistance: parseFloat($xml.attr('resistance'))
            });
        }
        else if (type === 'Inductor') {
            return new Inductor({
                startJunction: startJunction,
                endJunction: endJunction,
                length: length,
                height: height,
                voltageDrop: parseFloat($xml.attr('voltage')),
                current:     parseFloat($xml.attr('current')),
                inductance:  parseFloat($xml.attr('inductance'))
            });
        }
        
        return null;
    };

    var getComponentType = function(type) {
        if (type == 'edu.colorado.phet.cck3.circuit.Branch')
            return 'Wire';
        
        return type.substr(type.lastIndexOf('.') + 1);
    };

    /**
     * Converts a circuit object into an XML string and returns it.
     */
    var toXML = function(circuit) {
        return '';
    };


    var Persistence = {
        parseXML: parseXML,
        toXML: toXML
    };

    return Persistence;
});
