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
var cfenv = require('cfenv'),
    Cloudant = require('cloudant'),
    fs = require('fs'),
    lblreader = require('line-by-line'),
    Q = require('q'),
    cldr = require('../lib/cldr'),
    dbHandler = require('../lib/dbHandler'),
    validators = require('../lib/validators');

var lr;                              // line-by-line reader
var cnt = 0;
var docCnt = 0;                      
var data = '';                       // temp data 
var jsonTags = [];                   // field header values
var passCnt = 0;                     // number of records that pass all validations and written to db
var failCnt = 0;                     // number of records that failed one or more validations and not written to db

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // read and process input file and load records to database
    //------------------------------------------------------------------------------
    loadData: function () {
        debugger;
        lr = new lblreader(cldr.in_file);

        // catch and handle error for line-by-line processing
        lr.on('error', function (err) {
            console.log('cldr0301e - ' + err);
        });

        // process record from input file
        lr.on('line', function (line) {
            cnt++;
            var wr = true;
            // check if first record in file, if so there is required special processing
            if (cnt === 1) {
                // is the first record in the file being used for field names
                if (cldr.in_headerrow) {
                    console.log('cldr0302i - Using first row of input file for field names')
                    bldTags(line, cldr.in_delimiter);
                    wr = false;
                }
                // is the fieldnames parm provided and no header row defined
                if (typeof cldr.in_fieldnames !== 'undefined' && cldr.in_headerrow === false) {
                    console.log('cldr0303i - Using defined field names in config parm: inputfile.fieldnames')
                    bldTags(cldr.in_fieldnames, ',')
                    wr = true;
                }
                // should first record in file be skipped and not processed
                if (cldr.in_skipfirstrow === true && cnt == 1) {
                    wr = false;
                }
            }

            // check it record should be written to batch 
            if (wr === true) {
                // build the output json record that will be added to file
                bldData(line);
                docCnt++;
                // check if batch size is reached, if so send the batch of records to database to be added
                if (docCnt >= cldr.batchsize) {
                    var pc = cnt - 1;
                    if (cldr.trialrun === true) {
                        global.wrtCnt = global.wrtCnt + docCnt;
                        docCnt = 0;
                        console.log('cldr0304i - ' + pc + ' records not added to database using Trial run mode');
                    } else {
                        lr.pause();
                        dbHandler.writeDB()
                            .then(function () {
                                docCnt = 0;
                                console.log('cldr0305i - ' + pc + ' records added to database');
                                lr.resume();
                            })
                            .catch(function (err) {
                                console.log('cldr0306e - FAILED to write records to database, msg: ' + err);
                                lr.resume();
                            });
                    }
                }
            }
        });

        // check if end of file because special processing is needed
        lr.on('end', function () {
            if (cldr.trialrun === true) {
                console.log('cldr0307i - ' + global.wrtCnt + ' records not added to database using Trial run mode');
                endStats();
            } else {
                dbHandler.writeDB()
                    .then(function () {
                        console.log('cldr0308i - ' + global.wrtCnt + ' records added database');
                        endStats();
                    })
                    .catch(function (err) {
                        console.log('cldr0309e - FAILED to write records to database, msg: ' + err);
                    });
            }
        });
    }
}

//------------------------------------------------------------------------------
// build header values for records that will be written to database
//------------------------------------------------------------------------------
var bldTags = function (data, sep) {
    var tags;
    tags = data.split(sep);
    for (var t = 0; t < tags.length; t++) {

        jsonTags.push(tags[t])

        // If no Field Names are defined, it is an error
        if (jsonTags[0] === '') {
            console.log('cldr0400e - No Field Names defined, cannot load data');
            process.exit(-1)
        } else {
            if (t === 0) {
                console.log('cldr0401i - Header field name(s): ');
            }
        }
        console.log('cldr0402i - Field ' + t + ' name = ' + jsonTags[t]);
    }
}


//------------------------------------------------------------------------------
// build record that will be written to database
//------------------------------------------------------------------------------
var bldData = function (data) {
    // writeRec is set to TRUE at the start of processing for each record.  As each field is validated the 
    // value may be changed to FALSE.  
    cldr.writeRec = true;
    var jd = {};
    var tp = -1;
    var tpL = jsonTags.length;
    var info = data.split(cldr.in_delimiter);
    var hl = info.length;
    var chkSt = '';
    // build only as big as the number of json tags
    for (var t = 0; t < hl; t++) {
        // check if the field of the input record is selected to be kept and loaded
        if (cldr.in_keepfields.length > 1) {
            if (cldr.in_keepfields.indexOf('#' + t + '#') === -1) {
                continue;
            }
        }
        if (t < hl) {
            // Field validations are performed by checking if each validation type is needed 
            if (cldr.checkValidators) {
                // Check if replace is to be performed
                if (cldr.validators[t][3] !== 'x') {
                    var newData = validators.checkReplace(info[t], cldr.validators[t][3], cnt, t);
                    info[t] = newData;
                }

                // Check if valid values is to be performed
                if (cldr.validators[t][0] !== 'x') {
                    validators.checkValidValues(info[t], cldr.validators[t][0], cnt, t);
                }

                // Check if valid type is to be performed
                if (cldr.validators[t][1] !== 'x') {
                    validators.checkType(info[t], cldr.validators[t][1], cnt, t);
                }

                // Check if valid range is to be performed
                if (cldr.validators[t][2] !== 'x') {
                    validators.checkRange(info[t], cldr.validators[t][2], cnt, t);
                }

            }
            // build output record with proper field names
            if (cldr.in_headerrow) {
                jd[jsonTags[t]] = info[t];
            } else {
                tp++;
                if (tp < tpL) {
                    jd[jsonTags[tp]] = info[t];
                } else {
                    console.log('cldr0500e - Error No header field defined for field number: ' + tp + ' field value: ' + info[t]);
                }
            }
        }
    }
    // check if record should be written to batch
    if (cldr.writeRec) {
        passCnt++
            global.records.docs.push(jd);
    } else {
        failCnt++;
    }
}

//------------------------------------------------------------------------------
// display end of processing stats
//------------------------------------------------------------------------------
var endStats = function () {
    console.log('cldr0900i - End of input file reached');
    console.log('cldr0901i - Records passing validation: ' + passCnt);
    console.log('cldr0902i - Validation replacements   : ' + cldr.repCnt);
    if (failCnt > 0) {
        console.log('cldr0903i - Records failing validation: ' + failCnt);
        console.log('cldr0904i - Failed Valid Value        : ' + cldr.vCnt);
        console.log('cldr0905i - Failed Data Type          : ' + cldr.tCnt);
        console.log('cldr0906i - Failed Range Check        : ' + cldr.rCnt);
        console.log('cldr0907i - Failed Replace Data       : ' + cldr.pCnt);
    }

    var endTime = new Date();
    var endMilli = endTime.getTime();
    var milli = endMilli - global.startMilli;
    var totalTime = millisecondsToTime(milli)
    var avgTimePerRec = milli / passCnt;

    console.log('cldr0908i - Start date/time           : ' + global.startTime);
    console.log('cldr0909i - End date/time             : ' + endTime);
    console.log('cldr0910i - Elapsed time              : ' + totalTime + ' (MM:SS.mmm)');
    console.log('cldr0911i - Average Time/Record       : ' + avgTimePerRec + ' milliseconds');

    // end the load program
    console.log('cldr0999i - Program completed');

    process.exit();
}


//------------------------------------------------------------------------------
// format milliseconds to MM:SS.mmm
//------------------------------------------------------------------------------
var millisecondsToTime = function (milli) {
    var milliseconds = milli % 1000;
    var seconds = Math.floor((milli / 1000) % 60);
    var minutes = Math.floor((milli / (60 * 1000)) % 60);
    return minutes + ":" + seconds + "." + milliseconds;
}