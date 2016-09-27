//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
var cfenv      = require('cfenv')
  , Cloudant   = require('cloudant')  
  ,	fs         = require('fs')  
  , lblreader  = require('line-by-line')
  , Q          = require('q')
  , cldr       = require('./lib/cldr')
  , dbHandler  = require('./lib/dbHandler')  
  , readConfig = require('./lib/readConfig')  
  , validators = require('./lib/validators')
;

//------------------------------------------------------------------------------
// read parms from program start command
//------------------------------------------------------------------------------
console.log('\n');
var startTime  = new Date();;
var startMilli = startTime.getTime();
var cfParm     = false;

// Display the program start parameters and name of the configuration file that is to be used
process.argv.forEach(function (val, index, array) {
  	console.log('cldr0000i - Start Parameter: ' + index + ': ' + val);
 	if (index === 2) {
 		cfParm = true;
 		if (val.startsWith('/') ) {
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
// initialize local and global vars
//------------------------------------------------------------------------------
global.records = {"docs": []}; 
global.wrtCnt = 0;

var lr;                              // line-by-line reader
var passCnt = 0;                     // number of records that pass all validations and written to db
var failCnt = 0;                     // number of records that failed one or more validations and not written to db
var cnt = 0;
var docCnt = 0;                      
var data = '';                       // temp data 
var jsonTags = [];                   // field header values

//------------------------------------------------------------------------------
// start program init and main processing
//------------------------------------------------------------------------------
console.log('cldr0003i - Data load program started ...');
    
readConfig.getConfig()
    .then(function(result) {
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
					loadData();
				} else {

	            	//define database connection 
			        console.log('cldr0006i - Creating database connection');
				    dbHandler.defineDBConn()
				    .then(function(result) {
				    	// build indexes if defined in the configuration file
				    	indexCreate();
						// read input file and load data
				    	loadData();
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
    .catch(function(err) {
        console.log('cldr0009e - Terminated data load, msg: ' + err);
	     process.exit(-1);
    });
    

//------------------------------------------------------------------------------
// read and process input file and load records to database
//------------------------------------------------------------------------------
function loadData() {    
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


//------------------------------------------------------------------------------
// build header values for records that will be written to database
//------------------------------------------------------------------------------
function bldTags(data, sep) {
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
function bldData(data) {
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
			if (cldr.in_keepfields.indexOf('#' + t + '#')  === -1) {
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
function endStats() {
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
	var milli = endMilli - startMilli;
	var totalTime = millisecondsToTime(milli)
	var avgTimePerRec = milli / passCnt;
		
	console.log('cldr0908i - Start date/time           : ' + startTime );
	console.log('cldr0909i - End date/time             : ' + endTime );
	console.log('cldr0910i - Elapsed time              : ' + totalTime + ' (MM:SS.mmm)');
	console.log('cldr0911i - Average Time/Record       : ' + avgTimePerRec + ' milliseconds');

	// end the load program
	console.log('cldr0999i - Program completed');

	process.exit();
}

//------------------------------------------------------------------------------
// list the indexes that are defined for the database
//------------------------------------------------------------------------------
function indexList() {    
	dbHandler.listIndexes()
	.then(function(listResult) {
		console.log('cldr0010i - Index list status: ' + listResult);
	})
	.catch(function (listErr) {
    	console.log('cldr0011e - Index list error message: ' + listErr);
    });
}

//------------------------------------------------------------------------------
// build indexes if any are defined in the configuration file
//------------------------------------------------------------------------------
function indexCreate() {

	// list any existing indexes
	//indexList();

	dbHandler.listIndexes()
	.then(function(listResult) {
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
				console.log('cldr0603e - PARM - buildindexes.type is not defined at position: ' + p + ' using default: json');
				iType - 'json'
				iBld = false;
			} else {
				iType = cldr.buildindexes[p].type;
				//TODO might need to validate for json, text, ??
			}

			if (iBld === true) {
				// create indexes
				dbHandler.bldIndex(iName, iType, iFields)
				.then(function(bldResult) {
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

//------------------------------------------------------------------------------
// format milliseconds to MM:SS.mmm
//------------------------------------------------------------------------------
function millisecondsToTime(milli)
{
      var milliseconds = milli % 1000;
      var seconds = Math.floor((milli / 1000) % 60);
      var minutes = Math.floor((milli / (60 * 1000)) % 60);
      return minutes + ":" + seconds + "." + milliseconds;
}

console.log('cldr0999i - Data load program loaded into memory');