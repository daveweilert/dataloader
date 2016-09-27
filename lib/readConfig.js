/* jshint node: true */
/* jshint -W014 */

"use strict";

/*
 * Terms of use
 * Non-restricted
 */

// Requires
var cldr       = require('../lib/cldr')    
  , validators = require('../lib/validators')
  , Q          = require('q')
  , fs         = require('fs')
;


//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

	//------------------------------------------------------------------------------
	// read config file and build / set local vars
	//------------------------------------------------------------------------------
	loadParms: function() {
	    try {
	    
// BUILD INDEX PARM
            if (typeof cldr.runConfig.buildindexes !== 'undefined') {
                cldr.buildindexes = cldr.runConfig.buildindexes;
                var hl = cldr.buildindexes.length;
				try {
                	for (var p = 0; p < hl; p++) {
                		console.log('cldr2056i - PARM - buildindexes[' + p + ']: ' + cldr.buildindexes[p].name);
	                }
	        	} catch (e) {
	        		// just catch the error printing the indexes and go on
	        	}        
            } else {
                console.log('cldr2057i - PARM - buildindexes: Not defined, no indexes will be defined');
                cldr.buildindexes = [];
            }

// DATA BASE PARMS
            if (typeof cldr.runConfig.database.dbname !== 'undefined') {
                cldr.db_database = cldr.runConfig.database.dbname;
                console.log('cldr2018i - PARM - database.dbname: ' + cldr.db_database);
            } else {
                console.log('cldr2019e - ERROR Missing PARM: database.dbname');
                cldr.failedValidation = true;
            }

            if (typeof cldr.runConfig.database.url !== 'undefined') {
                cldr.db_url = cldr.runConfig.database.url;
                console.log('cldr2020i - PARM - database.url: ' + cldr.db_url);
            } else {
                console.log('cldr2021e - ERROR Missing PARM: database.url');
                cldr.failedValidation = true;
            }

            if (typeof cldr.runConfig.database.create !== 'undefined') {
                if (typeof cldr.runConfig.database.create === 'boolean') {
                    cldr.db_create = cldr.runConfig.database.create;
                    console.log('cldr2022i - PARM - database.create: ' + cldr.db_create);
                } else {
                    cldr.db_create  = false;
                    console.log('cldr2027w - PARM: - database.create: set to false because value is not: true or false');
                }
            } else {
                console.log('cldr2023w - PARM - database.create: Not defined so default value: false will be used');
                cldr.db_create = false;
            }

// INPUT FILE PARMS
            if (typeof cldr.runConfig.inputfile.filename !== 'undefined') {
                cldr.in_file = cldr.runConfig.inputfile.filename;
                console.log('cldr2024i - PARM - inputfile.filename: ' + cldr.in_file);
                var isFound = isFileFound(cldr.in_file);
            } else {
                console.log('cldr2025e - ERROR Missing PARM: inputfile.filename');
                cldr.failedValidation = true;
            }

            if (typeof cldr.runConfig.inputfile.delimiter !== 'undefined') {
                var dim = cldr.runConfig.inputfile.delimiter;
                if (dim.toUpperCase() === 'TAB') {
                    cldr.in_delimiter = '\t';
                    console.log('cldr2035i - PARM - inputfile.delimiter: TAB');
                } else if (dim.toUpperCase() === 'COMMA') {
                    cldr.in_delimiter = ',';
                    console.log('cldr2035i - PARM - inputfile.delimiter: COMMA');
                }  else {
                    cldr.in_delimiter = dim;
                    console.log('cldr2035i - PARM - inputfile.delimiter: ' + dim);
                }
            } else {
                console.log('cldr2027w - PARM - inputfile.delimiter: Not defined so default value: TAB, will be used for ');
                cldr.in_delimiter = '\t';
            }

           if (typeof cldr.runConfig.inputfile.headerrow !== 'undefined') {
                if (typeof cldr.runConfig.inputfile.headerrow === 'boolean') {
                    cldr.in_headerrow = cldr.runConfig.inputfile.headerrow;	
                    console.log('cldr2026i - PARM - inputfile.headerrow: ' + cldr.in_headerrow );
                } else {
                    cldr.in_headerrow  = false;
                    console.log('cldr2027w - PARM - inputfile.headerrow set to false because value is not: true or false');
                }
            } else {
                console.log('cldr2049w - PARM - inputfile.headerrow: Not defined so default value: true, will be used');
                cldr.in_headerrow  = true;
            }

           if (typeof cldr.runConfig.inputfile.skipfirstrow !== 'undefined') {
                if (typeof cldr.runConfig.inputfile.skipfirstrow === 'boolean') {
                    cldr.in_skipfirstrow = cldr.runConfig.inputfile.skipfirstrow;	
                    console.log('cldr2041i - PARM - inputfile.skipfirstrow: ' + cldr.in_skipfirstrow );
                } else {
                    cldr.in_skipfirstrow  = false;
                    console.log('cldr2042w - PARM: inputfile.skipfirstrow set to false because value is not: true or false');
                }
            } else {
                console.log('cldr2043w - PARM - inputfile.skipfirstrow: Not defined so default value: false will be used');
                cldr.in_skipfirstrow  = false;
            }

            // check if these are both true if so it's an error
            if (cldr.in_skipfirstrow === true && cldr.in_headerrow === true) {
                console.log('cldr2080e - ERROR parameters inputfile.skipfirstrow and inputfile.headerrow cannot both be set to:  true');
                cldr.failedValidation = true;
            }

            if (typeof cldr.runConfig.inputfile.keepfields !== 'undefined') {
                var kA = cldr.runConfig.inputfile.keepfields;
                var arr =[];
                for( var i in kA ) {
                    if (kA.hasOwnProperty(i)){
                        arr.push(kA[i]);
                    }
                }
                var khl = arr.length;
                var kmsg = '';
                for (var k = 0; k < khl; k++ ) {
                    if (isValidInt(arr[k]) ) {
                        cldr.in_keepfields = cldr.in_keepfields + arr[k] + '#'; 
                        if (k === 0) {
                            kmsg = arr[k];
                        } else {
                            kmsg = kmsg + ', ' + arr[k];
                        }
                    } else {
                        console.log('cldr2045e - ERROR parameter inputfile.keepfields has value that is not a number: ' + arr[k] );
                        cldr.failedValidation = true;
                    }
                }
                console.log('cldr2055i - PARM - inputfile.keepfields: ' + kmsg);
                
            } else {
                console.log('cldr2044i - PARM - inputfile.keepfields: Not defined so all input fields will be kept');
                cldr.in_skipfirstrow  = false;
            }

            if (typeof cldr.runConfig.inputfile.fieldnames !== 'undefined') {
                var kH = cldr.runConfig.inputfile.fieldnames;
                var tmpH = '';
                var ft = true;
                for( var i in kH ) {
                    if (kH.hasOwnProperty(i)){
                        var hV = kH[i];
                        if (hV.length > 0) {
                            if (ft) {
                                tmpH = kH[i];
                                ft = false;
                            } else {
                                tmpH = tmpH + ',' + kH[i];
                            }
                        }
                    }
                }
                cldr.in_fieldnames = tmpH;     
                console.log('cldr2046i - PARM - inputfile.fieldnames : ' + tmpH);
            } else {
                cldr.in_skipfirstrow  = false;
            }

// PROCESSING PARMS
            if (typeof cldr.runConfig.trialrun !== 'undefined') {
                if (typeof cldr.runConfig.trialrun === 'boolean') {
                    cldr.trialrun = cldr.runConfig.trialrun;	
                    console.log('cldr2036i - PARM - trialrun: ' + cldr.trialrun);
                } else {
                    cldr.trialrun = false;
                    console.log('cldr2038w - PARM: trailrun set to false because value is not: true or false');
                }
            } else {
                console.log('cldr2037w - PARM - trialrun: Not defined so default value: true, will be used');
                cldr.trialrun = true;
            }

            if (typeof cldr.runConfig.batchsize !== 'undefined') {
                if (typeof cldr.runConfig.batchsize === 'number') {
                	if (cldr.runConfig.batchsize === 0) {
                		cldr.batchsize = 5000;
                		console.log('cldr2047w - PARM - batchsize: defined as zero, will be reset to 5000 because zero is invalid value');
                	} else {
                    	cldr.batchsize = cldr.runConfig.batchsize;	
                    	console.log('cldr2039i - PARM - batchsize: ' + cldr.batchsize);
                    }
                } else {
                    cldr.batchsize = 5000;
                    console.log('cldr2040w - PARM - batchsize set to 5000 because value is not a number');
                }
            } else {
                console.log('cldr2041w - PARM - batchsize: Not defined so default value: 5000, will be used');
                cldr.batchsize = 5000;
            }

           if (typeof cldr.runConfig.printreplacements !== 'undefined') {
                if (typeof cldr.runConfig.printreplacements === 'boolean') {
                    cldr.printRep = cldr.runConfig.printreplacements;	
                    console.log('cldr2044i - PARM - printreplacements: ' + cldr.printRep );
                } else {
                    cldr.printRep  = false;
                    console.log('cldr2045w - PARM: printreplacements set to false because value is not: true or false');
                }
            } else {
                console.log('cldr2046w - PARM - printreplacements: Not defined so default value: false, will be used');
                cldr.printRep  = false;
            }

// VALIDATOR PARMS
            if (typeof cldr.runConfig.validators !== 'undefined') {
                validators.loadValidators(cldr.runConfig.validators);
            } else {
                console.log('cldr2034i - PARM - validators: Not defined so no validations will be performed');
                cldr.checkValidators = false;
            }


        } catch (e) {
            console.log('cldr2028e - ERROR processing configuration file, message: ' + e);
        }
    },  



    //------------------------------------------------------------------------------
    // read configuration file
    //------------------------------------------------------------------------------
    getConfig: function() {
        var deferred = Q.defer();
        try {
            fs.readFile(cldr.configFileName, "utf8", function(err, data) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log('cldr2029e - Configuration file: ' + cldr.configFileName + ' does not exist');
                        deferred.reject('MISSING_FILE');
                    } else if (err.code === 'EACCES') {
                        console.log('cldr2030e - Configuration file: ' + cldr.configFileName + ' has Permission error(s)');
                        deferred.reject('PERMISSION_ERROR');
                    } else {
                    	console.log('cldr2031e - Configuration file: ' + cldr.configFileName + ' has Unknown Error(s)');
                    	deferred.reject('UNKNOWN_ERROR');
                    }
                } else {
                
                	// populate cldr object with config parms
                	try {
                    	cldr.runConfig = JSON.parse(data);
	                	deferred.resolve('OK');
                	} catch (e) {
                    	console.log('cldr2032e - Invalid format in configuration file, message: ' + e);
                    	deferred.reject('FORMAT_ERROR');
                	}
                }
            });

            return deferred.promise;

        } catch (e) {
            console.log('cldr2033e - Error reading configuration file: ' + cldr.configFileName + ' , message: ' + e);
            deferred.reject(e);
        }
    }
};

//------------------------------------------------------------------------------
// validate file exists
//------------------------------------------------------------------------------
var isFileFound = function(filepath, options) {
  	options = options || {}

  	if (!filepath) { 
  		return false
  	}

  	var root = options.root
  	var fullpath = (root) ? path.join(root, filepath) : filepath

  	try {
    	return fs.statSync(fullpath).isFile()
  	} catch (e) {
    	return false
  	}
}

//------------------------------------------------------------------------------
// validate for an integer
//------------------------------------------------------------------------------
var isValidInt = function(data) {
    var nv = parseInt(data, 10);
    if (isNaN(nv)) {
        return false;
    } else {
        return true;
    }
}