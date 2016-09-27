/* jshint node: true */
/* jshint -W014 */
"use strict";

/*
 * Terms of use
 * Non-restricted
 */

//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
var Cloudant = require('cloudant'),
    Q = require('q'),
    cldr = require('../lib/cldr');

var failedDBInit;
var db;
var cloudant;

//------------------------------------------------------------------------------
// common routines
//------------------------------------------------------------------------------
module.exports = {

    //------------------------------------------------------------------------------
    // define connection to the database
    //------------------------------------------------------------------------------
    defineDBConn: function() {
        debugger;
    	var deferred = Q.defer();

        console.log('cldr4000e - Creating db Connection');
        try {
        	//define database connection 
        	cldr.db_url = cldr.runConfig.database.url;
        	cldr.db_database = cldr.runConfig.database.dbname;
        	cloudant = Cloudant(cldr.db_url);

        	// determine if a new instance of database should be created
        	if (cldr.db_create === true) {
            	newDB()
                	.then(function(status) {
    					initDB()
					        .then(function() {
            					if (failedDBInit) {
                					console.log('cldr4001e - Failed to initialize database, unable to proceed')
                					process.exit(-1);
            					} else {
                					// Everything is good, now start data loading
                					console.log('cldr4002i - Initialized and connected to database, able to proceed')
                					deferred.resolve('DB_CONNECTED');
            					}
        					})
        					.catch(function() {
            					console.log('cldr4003e - Terminated data load');
            					deferred.reject('DB_CONN_FAILURE');
        					});
                	})
                	.catch(function(err) {
                    	console.log('cldr4005e - Terminated data load, message: ' + err);
            			deferred.reject('DB_CONN_FAILURE');
                	});
        	} else {
            	console.log('cldr4006i - Adding data to existing database: ' + cldr.db_database);
    			initDB()
					.then(function() {
            			if (failedDBInit) {
                			console.log('cldr4007e - Failed to initialize database, unable to proceed')
                			process.exit(-1);
            			} else {
                			// Everything is good, now start data loading
                			console.log('cldr4008i - Initialized and connected to database, able to proceed')
                			deferred.resolve('DB_CONNECTED');
            			}
        			})
        			.catch(function() {
            			console.log('cldr4009e - Terminated data load');
            			deferred.reject('DB_CONN_FAILURE');
        			});
        	}
        	return deferred.promise;

        } catch (e) {
            console.log('cldr4010e - ERROR writing records to database, message: ' + e);
            deferred.reject(e);
        }        
    },

    //------------------------------------------------------------------------------
    // write to database in bulk batches
    //------------------------------------------------------------------------------
    writeDB: function() {
        var deferred = Q.defer();
        global.wrtCnt = global.wrtCnt + global.records.docs.length;
        try {
            db.bulk(global.records, function(err, data) {
                if (err) {
                    deferred.reject('FAIL');
                } else {
                    global.records = {
                        "docs": []
                    };
                    deferred.resolve('PASS');
                }
            });
            return deferred.promise;
        } catch (e) {
            console.log('cldr4011e - ERROR writing records to database, message: ' + e);
            deferred.reject(e);
        }
    },


    //------------------------------------------------------------------------------
    // list database indexes
    //------------------------------------------------------------------------------
    listIndexes: function(indexName, indexType, fieldNames) {
		var deferred = Q.defer();
		try {
			db.index(function(er, result) {
  				if (er) {
  					console.log('cldr4030e - Failed to list database index(es), error message: ' + er);
    				deferred.reject('FAIL');;
  				} else {
					console.log('cldr4028i - Number of existing database indexes: %d ', result.indexes.length);
  					for (var i = 0; i < result.indexes.length; i++) {
    					console.log('cldr4029i - Name: %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
  					} 
  					//result.should.have.a.property('indexes').which.is.an.Array;
  					deferred.resolve('PASS');
  				}
			});    	
			return deferred.promise;
		} catch (e) {
			console.log('cldr4010e - ERROR , message: ' + e);
		}        
    },

    //------------------------------------------------------------------------------
    // write to database in bulk batches
    //------------------------------------------------------------------------------
    bldIndex: function(indexName, indexType, fieldNames) {
		// Print field names to be indexed
    	for (var p = 0; p < fieldNames.length; p++) {
    		console.log('cldr4027i - Index name: ' + indexName + ' - Field name[' + p + ']: ' + fieldNames[p]); 
    	}
    	
        var deferred = Q.defer();
        try {
			var indexDef = {name  : indexName, 
							type  : indexType, 
							index : {fields:  fieldNames }}
			
			db.index(indexDef, function(err, response) {
  				if (err) {
    				console.log('cldr4025e - ERROR creating index for database, message: ' + err);
    				deferred.reject('FAIL');
  				} else {
	  				console.log('cldr4026e - Index name: ' + indexName + ' created successfully');
					deferred.resolve('PASS');
				}
			});
            return deferred.promise;
        } catch (e) {
            console.log('cldr4011e - ERROR writing records to database, message: ' + e);
            deferred.reject(e);
        }
    }
    
}


//------------------------------------------------------------------------------
// initialize database
//------------------------------------------------------------------------------
var initDB = function() {
    var deferred = Q.defer();
    failedDBInit = false;
    try {
        db = cloudant.db.use(cldr.db_database);
        cloudant.db.list(function(err, allDbs) {
            if (err) {
                console.log('cldr4012e - Failed to initialize connection for DataBase: ' + cldr.db_database + ', message: ' + err);
                failedDBInit = true;
                deferred.reject('INIT_DB_FAILED');
            } else {
                var dbString = allDbs.join(', ');
                if (typeof dbString !== 'undefined' && dbString.length > 0) {
                    // check if the request database is found, if not fail init request
                    if (dbString.indexOf(cldr.db_database) === -1) {
                        console.log('cldr4013e - DataBase: ' + cldr.db_database + ' does not exist, and database.create parm set to false');
                        failedDBInit = true;
                        deferred.reject('NO_DB_EXISTS');
                    } else {
                        console.log('cldr4015i - DataBase: ' + cldr.db_database + ' connection initialized');
                        deferred.resolve('OK');
                    }
                } else {
                    // no databases found 
                    console.log('cldr4016e - DataBase: ' + cldr.db_database + ' does not exist, and database.create parm set to false');
                    failedDBInit = true;
                    deferred.reject('NO_DB_EXISTS');
                }
            }
        });
    } catch (e) {
        console.log('cldr4017e - Failed to initialize connection for DataBase: ' + cldr.db_database + ', message: ' + e);
        failedDBInit = true;
        deferred.reject('INIT_DB_FAILED');
    }
    return deferred.promise;
}

//------------------------------------------------------------------------------
// create new instance of database when create parameter is true
//------------------------------------------------------------------------------
var newDB = function() {
    var deferred = Q.defer();

    try {
        cloudant.db.destroy(cldr.db_database, function(e1, r1) {
            if (e1) {
                // delete database if it exists
                if (e1.message.indexOf('not exist') > -1) {
                    // if not already defined continue to preocess
                    console.log('cldr4018w - Unable to delete database: ' + cldr.db_database + ' does not exist.');
                } else {
                    // if any other type of error when deleting stop the process
                    console.log('cldr4019w - ERROR Unknown error deleting database, message: ' + e1.message);
                    deferred.reject('DELETE_UNKNOWN_ERROR');
                }
            } else {
                console.log('cldr4020i - Deleted database: ' + cldr.db_database);
            }

            // Create a new database.
            cloudant.db.create(cldr.db_database, function(e2, r2) {
                if (e2) {
                    console.log('cldr4022e - Failed to create database: ' + cldr.db_database + ' message: ' + e2.message);
                    deferred.reject('CREATE_FAILED');

                } else {
                    console.log('cldr4023i - Created database: ' + cldr.db_database);
                    deferred.resolve('OK');
                }
            });
        });

        return deferred.promise;

    } catch (e) {
        console.log('cldr4024e - Failed to initialize connection for DataBase: ' + cldr.db_database + ', message: ' + e);
        failedDBInit = true;
        deferred.reject('GENERAL_FAILURE');
    }
}