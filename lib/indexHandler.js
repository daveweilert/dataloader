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
var Cloudant = require('cloudant'),
    Q = require('q'),
    cldr = require('../lib/cldr'),
    dbHandler = require('../lib/dbHandler');

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // list the indexes that are defined for the database
    //------------------------------------------------------------------------------
    indexList: function () {
        dbHandler.listIndexes()
            .then(function (listResult) {
                console.log('cldr0010i - Index list status: ' + listResult);
            })
            .catch(function (listErr) {
                console.log('cldr0011e - Index list error message: ' + listErr);
            });
    },

    //------------------------------------------------------------------------------
    // build indexes if any are defined in the configuration file
    //------------------------------------------------------------------------------
    indexCreate: function () {

        dbHandler.listIndexes()
            .then(function (listResult) {
                console.log('cldr0010i - Index list status: ' + listResult);
            })
            .catch(function (listErr) {
                console.log('cldr0011e - Index list error message: ' + listErr);
            });



        var hl = cldr.buildindexes.length;
        var iName, iType, iFields, iBld;
        console.log('cldr0600i - ' + hl + ' index definitions to be processed');
        try {
            for (var p = 0; p < hl; p++) {
                iBld = true;
                // validate index name 
                if (typeof cldr.buildindexes[p].name === 'undefined') {
                    console.log('cldr0601e - PARM - buildindexes.name is not defined at position: ' + p);
                    iBld = false;
                } else {
                    iName = cldr.buildindexes[p].name;
                }

                // validate index fields
                if (typeof cldr.buildindexes[p].fields === 'undefined') {
                    console.log('cldr0602e - PARM - buildindexes.fields is not defined at position: ' + p);
                    iBld = false;
                } else {
                    iFields = cldr.buildindexes[p].fields;
                }

                // validate index type
                if (typeof cldr.buildindexes[p].type === 'undefined') {
                    // FIX: parameter for type will default to JSON
                    //console.log('cldr0603e - PARM - buildindexes.type is not defined at position: ' + p + ' using default: json');
                    iType - 'json'
                    iBld = true;
                } else {
                    iType = cldr.buildindexes[p].type;
                    //TODO might need to validate for json, text, ??
                }

                if (iBld === true) {
                    // create indexes
                    dbHandler.bldIndex(iName, iType, iFields)
                        .then(function (bldResult) {
                            //console.log('cldr0604i - Index: ' + iName + ' build status: ' + bldResult);
                        })
                        .catch(function (bldErr) {
                            console.log('cldr0605e - Index creation error for: ' + iName + ' , message: ' + bldErr);
                        });
                } else {
                    console.log('cldr0606i - Index creation skipped for definition at position: ' + p);
                }
            }

        } catch (e) {
            console.log('cldr0607i - Index creation failed, message: ' + e);
        }
    }
}