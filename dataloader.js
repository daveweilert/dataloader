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
    cldr = require('./lib/cldr'),
    dataHandler = require('./lib/dataHandler'),
    dbHandler = require('./lib/dbHandler'),
    indexHandler = require('./lib/indexHandler'),
    readConfig = require('./lib/readConfig');

// Global vars
global.startTime = new Date();;
global.startMilli = startTime.getTime();
global.records = {
    "docs": []
};
global.wrtCnt = 0;

var cfParm = false;
console.log('\n');
var osys = process.platform;
var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
console.log('cldr0000i - Runtime OpSys: ' + osys + '  Home: ' + home);

//------------------------------------------------------------------------------
// read parms from program start command
//------------------------------------------------------------------------------
// Display the program start parameters and name of the configuration file that is to be used
process.argv.forEach(function (val, index, array) {
    var osys = process.platform;
    console.log('cldr0000i - Start Parameter: ' + index + ': ' + val);
    if (index === 2) {
        cfParm = true;
        if (val.startsWith('/')) {
            cldr.configFileName = val;
        } else if (val.startsWith('~')) {
            cldr.configFileName = home + val.substring(1);
        } else if (osys === 'win32' || osys === 'win64') {
            if (val.indexOf(":") === -1) {
                cldr.configFileName = './' + val;
            } else  {
                cldr.configFileName = val;
            }
        } else if (val.startsWith('./')) {
            cldr.configFileName = val;
        } else {
            cldr.configFileName = './' + val;
        }
        console.log('cldr0001i - Loading parameters from configuration file: ' + cldr.configFileName);
    }
});

// if no configuration file parameter, display message about using default file name
if (!cfParm) {
    console.log('cldr0002i - Loading parameters from DEFAULT configuration file: config.json');
}


//------------------------------------------------------------------------------
// start program init and main processing
//------------------------------------------------------------------------------
console.log('cldr0003i - Data load program started ...');

readConfig.getConfig()
    .then(function (result) {
        // if not successful reading and parsing config file quit.
        if (result !== 'OK') {
            process.exit(-1);
        }

        if (typeof cldr.runConfig === 'object') {
            // read the config.json file and config runtime, then wait for web request
            readConfig.loadParms();

            // if failed to load defined, begin 
            if (cldr.failedValidation) {
                console.log('cldr0004e - Failed config file validation, unable to proceed')
                process.exit(-1);
            } else {

                // check if running in TRIAL RUN mode if so, skip connecting to database and start 
                if (cldr.trialrun === true) {
                    console.log('cldr0005i - Skipping database connection, running in trial run mode');
                    dataHandler.loadData();
                } else {

                    //define database connection 
                    console.log('cldr0006i - Creating database connection');
                    dbHandler.defineDBConn()
                        .then(function (result) {
                            // build indexes if defined in the configuration file
                            console.log('cldr0010i - Index processing invoked');
                            indexHandler.indexCreate();
                            // read input file and load data
                            dataHandler.loadData();
                        })
                        .catch(function (err) {
                            console.log('cldr0007e - Terminated data load, failed to create database connection, message: ' + err);
                            process.exit(-1);
                        });
                }
            }
        } else {
            console.log('cldr0008e - Terminated data load, msg: Invalid format of config object');
            process.exit(-1);
        }
    })
    .catch(function (err) {
        console.log('cldr0009e - Terminated data load, msg: ' + err);
        process.exit(-1);
    });


console.log('cldr0999i - Data load program loaded into memory');