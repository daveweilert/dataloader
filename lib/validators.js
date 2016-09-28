"use strict";

/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
*/

//------------------------------------------------------------------------------
// Require statements and vars
//------------------------------------------------------------------------------
var cldr = require('../lib/cldr');

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // read and load validators from configuration file
    // parm 'v' is the validator array from the configuration file
    //------------------------------------------------------------------------------
    loadValidators: function (v) {

        var l, i, m, d;
        var hl = v.length;
        var vvPtr = -1;
        var rgPtr = -1;
        var rpPtr = -1;
        var tyPtr = -1;

        // initialize validators array of arrays 
        var aSize = 200;
        cldr.validators = new Array(aSize);
        for (d = 0; d < aSize; d++) {
            cldr.validators[d] = new Array(4);
            cldr.validators[d][0] = 'x'; // Valid value
            cldr.validators[d][1] = 'x'; // Data type
            cldr.validators[d][2] = 'x'; // Ranges
            cldr.validators[d][3] = 'x'; // Replace
        }
		debugger;
        console.log('cldr1402i - ' + hl + ' validator definition(s) defined in configuration file');
        for (l = 0; l < hl; l++) {
            m = l + 1;

            console.log('cldr1403i - Configuring validator: ' + m);
            var task;
            if (typeof v[l].task !== 'undefined') {
                task = v[l].task;
                task = task.toUpperCase();
            } else {
                task = 'UNDEFINED';
            }
            if (task === "VALUES") {
                if (typeof v[l].data !== 'undefined') {
                    if (typeof v[l].fld !== 'undefined') {
                        vvPtr++;
                        cldr.validValues[vvPtr] = vvIt(v[l].data);
                        console.log('cldr1413i - Type Validator: ValidValues, defined at: V' + vvPtr);
                        setValidators(v[l].fld, 0, vvPtr, m)
                    } else {
                        console.log('cldr1404e - ERROR Missing fld parameter for validator at position ' + m);
                        cldr.failedValidation = true;
                    }
                } else {
                    console.log('cldr1400e - ERROR Missing values parameter for validator at position ' + m);
                    cldr.failedValidation = true;
                }
            } else if (task === "DATATYPE") {
                if (typeof v[l].data !== 'undefined') {
                    var dt = v[l].data.toUpperCase();
                    if (dt === 'INTEGER' || dt === 'STRING' || dt === 'DECIMAL' || dt === 'ALPHA' ||
                        dt === 'ALPHAB' || dt === 'ALPHAH' || dt === 'ALPHABH' || dt === 'ALPHAHB' ||
                        dt === 'NAME' || dt === 'HEX') {
                        tyPtr++;
                        cldr.dataTypes[tyPtr] = dt;
                        console.log('cldr1414i - Type Validator: DataTypes, defined at: T' + tyPtr);
                        setValidators(v[l].fld, 1, tyPtr, m)
                    } else {
                        console.log('cldr1411e - ERROR Validator: ' + m + ' type data parm value: ' + v[l].data + ' not valid, use alpha, decimal, integer, or string');
                        cldr.failedValidation = true;
                    }
                } else {
                    console.log('cldr1400e - ERROR Missing data parameter for validator at position ' + m);
                    cldr.failedValidation = true;
                }
            } else if (task === "RANGE") {
                if (typeof v[l].data !== 'undefined') {
                    var rhl = v[l].data.length;
                    if (rhl === 2) {
                    	// removed checking for data type and replace var with NA
                        var p1 = "NA";
                        if (p1 === 'NA') {
                            rgPtr++;
                            cldr.ranges.push(new Array(3));
                            cldr.ranges[rgPtr][0] = "NA";
                            cldr.ranges[rgPtr][1] = v[l].data[0];
                            cldr.ranges[rgPtr][2] = v[l].data[1];
                            console.log('cldr1414i - Type Validator: Range, defined at: R' + rgPtr);
                            setValidators(v[l].fld, 2, rgPtr, m);
                        }
                    } else {
                        console.log('cldr1420e - ERROR Validator: ' + m + ' range parm value: ' + v[l].data + ' does not have two parms begin value, end value]');
                        cldr.failedValidation = true;
                    }
                } else {
                    console.log('cldr1422e - ERROR Missing data parameter for validator at position ' + m);
                    cldr.failedValidation = true;
                }
            } else if (task === "REPLACE") {
                if (typeof v[l].data !== 'undefined') {
                    var phl = v[l].data.length;
                    if (phl === 2) {
                        rpPtr++;
                        cldr.replacers.push(new Array(2));
                        cldr.replacers[rpPtr][0] = v[l].data[0];
                        cldr.replacers[rpPtr][1] = v[l].data[1];
                        console.log('cldr1423i - Type Validator: Replace, defined at: P' + rpPtr);
                        setValidators(v[l].fld, 3, rpPtr, m);
                    } else {
                        console.log('cldr1424e - ERROR Validator: ' + m + ' type data parm value: ' + v[l].data + ' should have two values, source and replacement values');
                        cldr.failedValidation = true;
                    }
                } else {
                    console.log('cldr1425e - ERROR Missing values parameter for validator at position ' + m);
                    cldr.failedValidation = true;
                }
            } else {
                console.log('cldr1426e - ERROR No valid task defined for validator, use: values, range, replace, datatype');
                cldr.failedValidation = true;
            }
        }

        for (var x = 0; x < cldr.validators.length; x++) {
            if (typeof cldr.validators[x] !== 'undefined') {
                for (var g = 0; g < cldr.validators[x].length; g++) {
                    if (typeof cldr.validators[x][g] !== 'undefined') {
                        if (cldr.validators[x][g] !== 'x') {
                            if (g === 0) {
                                console.log('cldr1407i - Field ' + x + ' will be validated for Valid Values using entry: V' + cldr.validators[x][g]);
                            } else if (g === 1) {
                                console.log('cldr1408i - Field ' + x + ' will be validated for Data Type using entry: T' + cldr.validators[x][g]);;
                            } else if (g === 2) {
                                if (x <= rgPtr) {
                                    console.log('cldr1409i - Field ' + x + ' will be validated for Range Values using entry: R' + cldr.validators[x][g]);
                                }
                            } else if (g === 3) {
                                if (cldr.validators[x][g] !== '') {
                                    console.log('cldr1410i - Field ' + x + ' will replace data using entry: P' + cldr.validators[x][g]);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (typeof cldr.validValues !== 'undefined') {
            if (typeof cldr.validValues[0] !== 'undefined') {
                for (var w = 0; w < cldr.validValues.length; w++) {
                    // strip the .#. separator and replace with a comma & space for printing 
                    var prtValues = cldr.validValues[w];
                    prtValues = prtValues.substring(3, prtValues.length - 3);
                    prtValues = prtValues.split(".#.").join(", ");
                    console.log('cldr1411i - V' + w + ' - ValueValues : ' + prtValues);
                }
            }
        }

        if (typeof cldr.dataTypes !== 'undefined') {
            if (typeof cldr.dataTypes[0] !== 'undefined') {
                // set easy to read alpha type message
                var pVal;
                for (var z = 0; z < cldr.dataTypes.length; z++) {
                    pVal = cldr.dataTypes[z];
                    if (pVal === 'ALPHAB') {
                        pVal = 'ALPHA with BLANK(s)';
                    } else if (pVal === 'ALPHAH') {
                        pVal = 'ALPHA with HYPHEN(s)';
                    } else if (pVal === 'ALPHABH') {
                        pVal = 'ALPHA with BLANK(s) and HYPHEN(s)';
                    } else if (pVal === 'ALPHAHB') {
                        pVal = 'ALPHA with BLANK(s) and HYPHEN(s)';
                    }
                    console.log('cldr1412i - T' + z + ' - DataType : ' + pVal);
                }
            }
        }

        if (typeof cldr.ranges !== 'undefined') {
            if (typeof cldr.ranges[0] !== 'undefined') {
                for (var r = 0; r < cldr.ranges.length; r++) {
                    console.log('cldr1429i - R' + r + ' - Ranges for - Begin: ' + cldr.ranges[r][1] + ' End: ' + cldr.ranges[r][2]);
                }
            }
        }

        if (typeof cldr.replacers !== 'undefined') {
            if (typeof cldr.replacers[0] !== 'undefined') {
                for (var p = 0; p < cldr.replacers.length; p++) {
                    var toV = cldr.replacers[p][1];
                    if (toV.length === 0) {
                        toV = '<blank>';
                    }
                    console.log('cldr1455i - P' + p + ' - Replace - From value: ' + cldr.replacers[p][0] + ' To value: ' + toV);
                }
            }
        }

    },

    //------------------------------------------------------------------------------
    // valid values validation
    //------------------------------------------------------------------------------
    checkValidValues: function (data, ptr, rec, t) {
        var check = cldr.validValues[ptr];

        if (typeof check === 'undefined') {
            console.log('Pointer: ' + ptr);
            console.log('Record : ' + rec);
            console.log('Field  : ' + t);
        }

        if (check.indexOf(cldr.vvSep + data + cldr.vvSep) === -1) {
            cldr.writeRec = false;
            validationMsg('V', t, rec, data);
        }
    },

    //------------------------------------------------------------------------------
    // check type validation
    //------------------------------------------------------------------------------
    checkType: function (data, ptr, rec, t) {

        var dt = typeof data;
        dt = dt.toUpperCase();

        //INTEGER
        if (cldr.dataTypes[ptr] === 'INTEGER') {
            if (data.indexOf('.') > -1) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
                return;
            }

            if (isNaN(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
                return;
            }

            if (parseInt(data, 10) === NaN) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }

        //DECIMAL
        if (cldr.dataTypes[ptr] === 'DECIMAL') {
            if (data.indexOf('.') === -1) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
                return;
            }

            if (isNaN(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
                return;
            }

            if (parseFloat(data) === NaN) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
                return;
            } else {
                return;
            }
            return;
        }

        //Name
        if (cldr.dataTypes[ptr] === 'NAME') {
            if (!isName(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }

        //Hex
        if (cldr.dataTypes[ptr] === 'HEX') {
            if (!isHex(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }


        //ALPHA only
        if (cldr.dataTypes[ptr] === 'ALPHA') {
            if (!isAlpha(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }

        //ALPHA and blanks/spaces
        if (cldr.dataTypes[ptr] === 'ALPHAB') {
            if (!isAlphaB(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }


        //ALPHA and hyphens
        if (cldr.dataTypes[ptr] === 'ALPHAH') {
            if (!isAlphaH(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }


        //ALPHA with blanks/spaces and hyphens
        if (cldr.dataTypes[ptr] === 'ALPHABH' || cldr.dataTypes[ptr] === 'ALPHAHB') {
            if (!isAlphaBH(data)) {
                cldr.writeRec = false;
                validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
            } else {
                return;
            }
            return;
        }


        //STRING
        if (cldr.dataTypes[ptr] !== dt) {
            cldr.writeRec = false;
            validationMsg('T', t, rec, data, dt, cldr.dataTypes[ptr]);
        }

    },

    //------------------------------------------------------------------------------
    // check ranges validation
    //------------------------------------------------------------------------------
    checkRange: function (data, ptr, rec, t) {
        //var rType = cldr.ranges[ptr][0];
        var rS = cldr.ranges[ptr][1];
        var rE = cldr.ranges[ptr][2];
        if (data < rS || data > rE) {
            cldr.writeRec = false;
            validationMsg('R', t, rec, data);
        }
    },

    //------------------------------------------------------------------------------
    // replace data validation
    //------------------------------------------------------------------------------
    checkReplace: function (data, ptr, rec, t) {
        debugger;
        var from = cldr.replacers[ptr][0];
        var to = cldr.replacers[ptr][1];
        var newData = '';
        var shl = data.length;
        var s = -1;
        var q;
        var rtn = '';

        // if either a double or single quote handle here, else do global replace with RegExp
        if (from === '"' || from === "'") {
            for (var r = 0; r < shl; r++) {
                q = r + 1;
                if (data.substring(r, q) !== from) {
                    newData = newData + data.substring(r, q);
                } else {
                    cldr.repCnt++;
                    if (to.length > 0) {
                        newData = newData + to;
                    }
                    if (cldr.printRep === true) {
                        console.log('cldr1491i - Replacement source data: ' + from + ' located in record: ' + rec + ' field: ' + t + ' at position: ' + r)
                    }
                }
            }
            rtn = newData;
        } else {
            rtn = data.replace(new RegExp(from, "g"), to);
            cldr.repCnt++;
            if (cldr.printRep === true) {
                console.log('cldr1490i - Replacement source data: ' + from + ' located in record: ' + rec)
            }
        }

        return rtn;
    }
}

var setValidators = function (where, ptr, val, m) {
	debugger;
    var i;
    // loop all entries in fld and update cldr.validators array
    for (i = 0; i < where.length; i++) {
        // validate fld entry is a number and less than 100
        if (!isNaN(where[i])) {
            if (where[i] < 199 && where[i] > -1) {
                // valid so update validator array
                cldr.validators[where[i]][ptr] = val;
                // update so validators will be called
                cldr.checkValidators = true;
            } else {
                console.log('cldr1406e - validators fld parameter: ' + where[i] + ', for validator at position ' + m + ' is greater than 199 or less than 0');
            }
        } else {
            console.log('cldr1405e - validators fld parameter: ' + where[i] + ', for validator at position ' + m + ' is not a number');
        }
    } // end of for loop
}

//------------------------------------------------------------------------------
// check for only alpha combinations: 
//------------------------------------------------------------------------------
var isAlpha = function (xStr) {
    // allow lower or uppercase letters
    var regEx = /^[a-zA-Z]+$/;
    return xStr.match(regEx);
}

var isAlphaB = function (xStr) {
    // allow lower or uppercase letters plus space / blank
    var regEx = /^[a-zA-Z() ]+$/;
    return xStr.match(regEx);
}

var isAlphaH = function (xStr) {
    // allow lower or uppercase letters plus hyphen
    var regEx = /^[a-zA-Z\-]+$/;
    return xStr.match(regEx);
}

var isAlphaBH = function (xStr) {
    // allow lower or uppercase letters plus space / blank and hyphen
    var regEx = /^[a-zA-Z() \-]+$/;
    return xStr.match(regEx);
}

var isName = function (xStr) {
    // allow lower or uppercase letters plus space / blank and hyphen
    var regEx = /^[a-zA-Z() \-\.\'\,]+$/;
    return xStr.match(regEx);
}

var isHex = function (xStr) {
    // allow lower or uppercase letters plus space / blank and hyphen
    var regEx = /^[a-fA-F() 0-9\-]+$/;
    return xStr.match(regEx);
}


//------------------------------------------------------------------------------
// parse values to be used for valid values validation and build a string of 
// values separated by .#.   This string will have a indexOf used to locate
// if a valid value is used when processing validations
//------------------------------------------------------------------------------
var vvIt = function (data) {
    var rtn = cldr.vvSep;
    if (data instanceof Array) {
        for (var p = 0; p < data.length; p++) {
            rtn = rtn + data[p] + cldr.vvSep;
        }
    } else {
        rtn = rtn + data + cldr.vvSep;
    }
    return rtn;
}


//------------------------------------------------------------------------------
// print validation messages 
//------------------------------------------------------------------------------

var validationMsg = function (v, t, r, d, ty, dd) {
    var msg = '';
    if (v === 'V') {
        msg = 'cldr1440w - Invalid value found in Record: ' + r + ' Field: ' + t + ' Value: ' + d;
        cldr.vCnt++;
    } else if (v === 'T') {
        msg = 'cldr1441w - Invalid data type found in Record: ' + r + ' Field: ' + t + ' Value: ' + d + ' Expected: ' + dd;
        cldr.tCnt++;
    } else if (v === 'R') {
        msg = 'cldr1442w - Invalid range found in Record: ' + r + ' Field: ' + t + ' Value: ' + d;
        cldr.rCnt++;
    } else if (v === 'P') {
        msg = 'cldr1443w - Replace error in Record: ' + r + ' Field: ' + t + ' Value: ' + d;
        cldr.pCnt++;
    }
    console.log(msg)
}