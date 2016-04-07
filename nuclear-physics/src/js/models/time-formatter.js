define(function (require) {

    'use strict';

    var MILLISECONDS_PER_SECOND = 1000;
    var MILLISECONDS_PER_MINUTE = 60000;
    var MILLISECONDS_PER_HOUR = 3600000;
    var MILLISECONDS_PER_DAY = 86400000;
    var MILLISECONDS_PER_YEAR = 3.16e10;
    var MILLISECONDS_PER_MILLENIUM = 3.16e13;
    var MILLISECONDS_PER_MILLION_YEARS = 3.16e16;
    var MILLISECONDS_PER_BILLION_YEARS = 3.16e19;
    var MILLISECONDS_PER_TRILLION_YEARS = 3.16e22;
    var MILLISECONDS_PER_QUADRILLION_YEARS = 3.16e25;

    var TimeFormatter = {

        formatTime: function(milliseconds) {
            // Convert to years.
            var timeInYears = milliseconds / MILLISECONDS_PER_YEAR;
            
            // Based on input received during reviews of this simulation, some
            //   very specific behavior is desired in terms of the resolution that
            //   is displayed for the various ranges of time.
            var resolution;
            if (timeInYears < 1)
                resolution = -2;
            else if (timeInYears < 1000000)
                resolution = 1;
            else
                resolution = 6;
            
            var text;
            var valueToDisplay = this.roundToResolution(timeInYears, resolution);
            if (valueToDisplay < 1 && valueToDisplay !== 0)
                text = valueToDisplay.toFixed(2);
            else
                text =  valueToDisplay.toLocaleString();
            
            text += ' yrs';
            return text;
        },

        /**
         * Returns a string with the milliseconds formatted into the appropriate
         *   unit with the appropriate precision.
         */
        formatTimeWithScientificNotation: function(milliseconds, htmlIsOkay) {
            var mantissaDecimals = 3;

            var text;

            if (milliseconds < MILLISECONDS_PER_SECOND) {
                // Milliseconds range.
                text = milliseconds.toFixed(0) + ' ms';
            }
            else if (milliseconds < MILLISECONDS_PER_MINUTE) {
                // Seconds range.
                text = (milliseconds / MILLISECONDS_PER_SECOND).toFixed(1) + ' secs';
            }
            else if (milliseconds < MILLISECONDS_PER_HOUR) {
                // Minutes range.
                text = (milliseconds / MILLISECONDS_PER_MINUTE).toFixed(1) + ' mins';
            }
            else if (milliseconds < MILLISECONDS_PER_DAY) {
                // Hours range.
                text = (milliseconds / MILLISECONDS_PER_HOUR).toFixed(1) + ' hrs';
            }
            else if (milliseconds < MILLISECONDS_PER_YEAR) {
                // Days range.
                text = (milliseconds / MILLISECONDS_PER_DAY).toFixed(0) + ' days';
            }
            else if (milliseconds < MILLISECONDS_PER_MILLENIUM) {
                // Years range.
                text = (milliseconds / MILLISECONDS_PER_YEAR).toFixed(0) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_MILLION_YEARS) {
                // Thousand years range (millenia).
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 3, mantissaDecimals, htmlIsOkay) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_BILLION_YEARS) {
                // Million years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 6, mantissaDecimals, htmlIsOkay) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_TRILLION_YEARS) {
                // Billion years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 9, mantissaDecimals, htmlIsOkay) + ' yrs';
            }
            else if (milliseconds < MILLISECONDS_PER_QUADRILLION_YEARS) {
                // Trillion years range.
                text = this.toScientificNotation((milliseconds / MILLISECONDS_PER_YEAR), 12, mantissaDecimals, htmlIsOkay) + ' yrs';
            }
            else {
                text = '\u221e'; // Infinity.
            }

            return text;
        },

        toScientificNotation: function(number, exponent, mantissaDecimals, htmlIsOkay) {
            if (mantissaDecimals === undefined)
                mantissaDecimals = 3;

            // Find tha mantissa
            var mantissa = number / Math.pow(10, exponent);

            // Create the exponent string
            var exponentString = ' ';
            if (htmlIsOkay) {
                // Just use <sup> tags for the exponent
                exponentString += '<sup>' + exponent + '</sup>';
            }
            else {
                // Render unicode characters representing the exponential digits
                var chars = exponent.toString();
                for (var i = 0; i < chars.length; i++) {
                    var digit = parseInt(chars.charAt(i));
                    if (digit == '2' || digit == '3')
                        exponentString += String.fromCharCode(parseInt('00B' + digit, 16));
                    else
                        exponentString += String.fromCharCode(parseInt('207' + digit, 16));
                }    
            }
            
            // Put it all together
            return mantissa.toFixed(mantissaDecimals) + ' x 10' + exponentString;
        },

        roundToResolution: function(value, resolution) {
            if (value === 0) {
                // Can't do much with this.
                return 0;
            }
            
            // Calculate a value where the decimal point has the number of
            //   desired significant digits to the left of the decimal point.
            var retVal = value / Math.pow(10, resolution);
            
            // Round the value.
            retVal = Math.round(retVal);
            
            // Multiply back to the original number of places.
            retVal = retVal * Math.pow(10, resolution);
            
            // We're done.
            return retVal;
        }

    };

    return TimeFormatter;
});