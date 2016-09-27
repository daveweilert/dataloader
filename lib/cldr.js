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
var cldr = module.exports = {
    // configuration file info and data
    configFileName: './config.json',
    runConfig: '',
    failedValidation: false,

    // validation vars
    checkValidators: false,
    validators: [
        []
    ],
    validValues: [],
    dataTypes: [],
    ranges: [],    
    replacers: [],

    // processing options
    writeRec: true,
    vvSep: '.#.',
    trialrun: true,
    batchSize: 2000,
    printRep: false,

    // nosql database info
    db_url: '',
    db_database: '',
    db_create: '',

    // input file options
    in_file: '',
    in_headerrow: '',
    in_delimiter: '\t',
    in_keepfields: '#',
    in_skipfirstrow: false,
    in_fieldnames: [],

    // validation failure counts
    vCnt: 0,
    tCnt: 0,
    rCnt: 0,
    pCnt: 0,
    repCnt: 0,

    // index definitions 
    buildindexes: []
}