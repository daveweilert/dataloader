# dataloader <br>A node.js application that loads data into IBM Cloudant or Apache CouchDB databases.  The application can load data from a file with delimited fields into a target database.  This application is run from a terminal / command prompt or can be invoked from a batch script. Application features include:- Append data to an existing database or create a new database instance - Validate or modify data for each individual field using one or more of the following validators. Refer to Validators section for more information   - Data validation can be performed prior to loading actual data by using the 'trialrun' parameter- Bulk load data to improve load time and reduce the number network requests by using the 'batchsize' parameter- Define input file field delimiter - Field names for the document loaded into the database can be user defined.  This is accomplished by using the first record of the input file or by using the 'fieldnames' parameter.- Ability to select which fields from the input file are retained and loaded by using the 'keepfields' parameter - Data indexes can be defined and created##Installation

<b>
		Node.js and NPM are required to install and execute this application</b>
Download the source files and place in a directory.  Change to the directory where the files were placed. Run the following NPM command to install the require Node modules:
	npm installOnce the above has successfully completed the application can be run.  Located in the /example/ directory edit line 15 of the file Config_4.json changing the location of the example files provided with this application.  
Optionally edit line 2: "trailrun": false, change false to true.  This will allow the program to run without any database connection.  Once you have verified the application has been installed and will execute the parameters for the "database" will need to also be changed to point to a target database. If you changed the "trialrun" to ture be sure to change it back to false to allow the input to be loaded to the database.
Run the program;

<b>
	npm start ./example/config_4.json    (OR)    node dataloader.js   ./example/config_4.json </b> <b>Note:</b> If the program is started without defining the configuration file parameter it will default to looking in the application directory for a configuration file named 'config.json'.##Configuration fileThe configuration file defines the required and optional processing parameters needed to load the data.  The file is formatted using JSON (JavaScript Object Notation).  Below is an example of a configuration file defined with the <b>minimum</b> set of parameters:	{		  	  "database"  : { "dbname":"doctors", "url":"http://localhost:5984" },      "inputfile" : { "filename":"/Users/daveweilert/GitHub/dataloader/example/000003_Data_File_TAB.txt"}     }<b>Note</b> the use of double quotes, curly brackets, colons, commas, etc. in the definition of the parameter values. These are required to create a properly formatted JSON file.  Additional information regarding valid JSON can be obtained at: <http://www.json.org>The above configuration file is using the "inputfile" parameter defaults a.) tab delimited fields b.) first record contains the field names, and c.) all input fields will be loaded. <br>##ParametersThe key parameter and sub-parameters are case sensitive and only use lower case characters to define the values.  The users values that are provided for each parameter are not required to be lower case.  The following tables lists the parameter, required or optional, valid values, default value, description, sub-parameters, and example(s).  <br>###"batchsize"| Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Opt | whole number greater than zero | 5000 | Defines the number of records that will be batched and passed to the database to be inserted.Sub-parameters: NONEExample: <br>1 - Create batch of 5000 records<b><br>      "batchsize": 5000</b><br>###"buildindexes"| Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Opt | sub-parms | N/A | Defines one or more indexes that will be created for the database.  The format of this parameter is using a JSON array that requires the [ { index 1 parms }, { index 2 parms } ] syntax. Sub-parameters:| Sub-Parameter | Req/Opt | Valid Value(s) | Default | Description || :-------: | :----:  | -----        | :----:  | -----       || "name" | Req | string | none | The value that is used to create the name that will be used to define the index.  This sub-parm can have embedded spaces.| "fields" | Req | string | none | The list of field names that are indexed.  The format of this parameter is using a JSON array that requires the [  "field1", "field2"  ] syntax. Example: <br>1 - Define three separate indexes for last name, first name, and a combined first and last name <b><br>           "buildindexes":       [	     {"name": "last_idx", "fields": ["LastName"] },	     {"name": "first name idx", "fields": ["FirstName"] },	     {"name": "combined name", "fields": ["FirstName", "LastName"] }       ]</b><br>###"database"| Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Req | sub-parms | N/A | Defines the output database. Sub-parameters:| Sub-Parameter | Req/Opt | Valid Value(s) | Default | Description || :-------: | :----:  | -----        | :----:  | -----       || "create" | Opt | <b>true</b> or <b>false</b> | false | true = Create a new instance of the database.  If the database already exits delete the current instance and create a new instance. <br> false = Insert records into an existing database. Do not create a new instance of the database if one does not exist.  | "dbname" | Req | string | N/A | Name of the database. | "url" | Req | string | none | Url where the database is located. Example: <br>1 - Create new instance of a database named 'doctors' using Apache CouchDB installed locally. <br><b>    "database":       {         "dbname"  : "doctors",        "create"  : true,        "url"     : "http://localhost:5984"     }</b>2 - Insert into an existing database named 'costs' using IBM Cloudant running in IBM Bluemix.<b><br>    "database":       {         "dbname"  : "costs",        "create"  : false,        "url"     : "https://20c66bd5-459f-dc77-dc77-a286897f74ec-bluemix:6a0864d88250269e2988b43391fa6b054c5ab3688ef8b58c7668a6cf32cc6611@20c66bd5-dc77-459f-a24d-a286897f74ec-bluemix.cloudant.com"     }</b><br>###"inputfile"| Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Req | sub-parms | N/A | Defines the input file of data to be loaded into the database. Sub-parameters:| Sub-Parameter | Req/Opt | Valid Value(s) | Default | Description || :-------: | :----:  | -----        | :----:  | -----       || "delimiter" | Opt | tab, comma, or user defined | tab | Value used to indicate the beginning all data fields after the first data field.    | "fieldnames" | Opt | string | N/A | User defined names of the data fields.  These values will be used as the field names in the database.  The format of this parameter is using a JSON array that requires the [ "field1", "field2" ] syntax. | "filename" | Req | string | N/A | Fully qualified path and name of the input file. | "headerrow" | Opt | <b>true</b> or <b>false</b> | true | true = first record of the input file contains the field names <br> false = first record of input file does not contain field names | "keepfields" | Opt | numbers enclosed in quotes| all fields | Beginning at zero a list of numbers (enclosed in quotes) that identify the fields of the record that are to be loaded.  <b>IMPORTANT</b> to begin with zero and not one. | "skipfirstrow" | Opt | <b>true</b> or <b>false</b> | false | true = Skip the first record of the input file <br> false = Do not skip the first record of the input file  Example: <br>1 - Load records from tab delimited data file: data_file_001.  Loading only fields 3, 4, and 5.  Field names are contained in the first record of the file.<br><b>    "inputfile":       {        "filename"    : "/Users/daveweilert/data_file_001",        "keepfields"  : ["3","4","5"]      }</b>2 - Load records from comma delimited data file: data_file_002.  Loading all fields and label them with the user defined field names.  Ensure the first record is not dropped by adding the 'headerrow' parameter.<br><b>    "inputfile":       {        "filename"    : "/Users/daveweilert/data_file_002",        "headerrow"   : false,        "fieldnames"   : ["LastName", "FirstName", "Initial", "Gender", "Title", "School"],        "delimiter"    : "comma"      }      </b>3 - Load records from user defined delimiter '@@' from data file: 20789data.accounts.  Loading only fields 1, 4, 5, 8 and label them with the user defined field names.  Ensure the first record skipped and do not use the field names contained in the first record.<br><b>    "inputfile":       {        "filename"    : "/Users/daveweilert/20789data.accounts",        "keepfields"  : ["1","4","5","8"],        "skipfirstrow" : true,        "fieldnames"   : ["Account Number","Balance","Date","Name"],        "delimiter"    : "@@"      }</b><br>###"printreplacements"| Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Opt | <b>true</b> or <b>false</b> | false | true = print details of replacement providing the record number, field number, and position <br> false = do not print replacement information Sub-parameters: NONEExample: <br>1 - Print replacement information.  <b>Note:</b> This output is only generated when a 'replace' validator is defined.  Refer to the validators section for more information. <b><br>      "printreplacements": true            Example output:            cldr1491i - Replacement source data: " located in record: 3001 field: 15 at position: 0      cldr1491i - Replacement source data: " located in record: 3001 field: 15 at position: 28</b><br>###"trialrun"A common use for this parameter is to validate data prior to inserting the data into the database. | Req/Opt | Valid Value(s) | Default | Description || :----:  | -----          | :----:  | -----       || Opt | <b>true</b> or <b>false</b> | false | true = do not pass records to be inserted into the database <br> false = pass records and insert into the database Sub-parameters: NONEExample: <br>1 - Run in trail run mode and do not load data into database.  <b>      "trialrun": true            Example output:            cldr0304i - 1000 records not added to database using Trial run mode      cldr0304i - 2000 records not added to database using Trial run mode</b>2 - Pass data and load into database.  <b>      "trialrun": false            Example output:            cldr0305i - 1000 records added to database	  cldr0305i - 2000 records added to database</b><br>###"validators"Four task types of validators can be defined.  Three of the validator tasks help ensure the integrity of data that is to be added to the database.  The fourth validator task is used to replace all occurrences of data in a single field.  As each record is read, a field-by-field processing is performed for the defined validators.  The 'replace' validator is performed first followed in sequence by values, range, and datatype. For each field there may be four validators defined, one of each type.  
<b>Note:</b> If more than one validator of the same type is defined for an individual field the last validator definition will be the one loaded and used. Each validator is defined using three parameters:<br>1. <b>"fld"</b> - the field number to be processed using zero based value (first field of record is value 0).  The maximum value that can be defined for a field position is 199 (field 200).2. <b>"task"</b> - the type of validator task to be defined (see table below)3. <b>"data"</b> - the validation parameters needed to define the individual validator task
<br>
###Validator TasksThe following are the valid values that can be used for the 'task' parameter.  The order of execution for validators defined for a single field is the same as listed in the following table.
| Task  | Description || :-------: | ---- | | replace  | for the identified field replace all occurrences of the 'from' value with the 'to' value| values   | validate the identified field is one of the defined values| range    | validate the identified field is included in the defined range | datatype | validate the identified field is a specific data type  Example validators with multiple definitions.  Notice fields 3, 4, 7, and 8 have multiple validators defined.       "validators":	  [		  {"fld":[21],      "task":"range",    "data": [0,99999]},		  {"fld":[0,1,2,5], "task":"datatype", "data": "string"},		  {"fld":[3,4],     "task":"replace",  "data": ["\"",""]},		  {"fld":[3,4],     "task":"datatype", "data": "name"},		  {"fld":[7],       "task":"values",   "data": ["Dr"]},		  {"fld":[7],       "task":"replace",  "data": ["MD","Dr"]},		  {"fld":[6],       "task":"values",   "data": ["M","F"]},		  {"fld":[8],       "task":"datatype", "data": "string"},		  {"fld":[8],       "task":"replace",  "data": ["\"",""]}	  ]##Parameter values for each type of validator:###"replace"| "fld" | "task" | "data" || :-------: | :----: | ----- || 0 - n  | "replace" | ["parm 1", "parm 2] <br> parm 1 - double quoted <b>FROM</b> value <br> parm 2 - double quoted <b>TO</b> value Example:<br> 1 - In field 17 replace uppercase 'MD' with mixed case 'Dr'<b>     {"fld":[7], "task":"replace", "data": ["MD","Dr"]}</b>2 - In fields 0, 4, and 9 remove all double quotes (") and replace with nothing.  The double quote is defined with a leading slash \ and enclosed in double quotes.  The replace value is double quotes with no space between the quotes.<b>     {"fld":[0,4,9], "task":"replace", "data": ["\"",""]}</b>	###"values"| "fld" | "task" | "data" || :-------: | :----: | ----- || 0 - n  | "values" | ["parm 1", "parm 2, ...] <br> parm 1-n are double quoted valid valuesExample:<br> 1 - In field 6 only allow uppercase 'M' and 'F'<b>     {"fld":[6], "task":"values", "data": ["M","F"]}</b>2 - In field 20 validate for these 50 state abbreviations<b>     {"fld":[20],  "task":"values",  "data": ["AK","AL","AR","AS","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MP","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY"]}, </b>###"range"| "fld" | "task" | "data" || :-------: | :----: | ----- || 0 - n  | "range" | ["parm 1", "parm 2] <br> parm 1 - beginning range value <br> parm 2 - ending range value<br>These values are considered the low and high range and included as valid values. Example:<br> 1 - In field 21 validate value is between 0 and 99999 (can be used for 5-digit zips)<b>     {"fld":[21],  "task":"range", "data": [0,99999]},</b>2 - In field 141 validate the four character value is between Adam and Dave.  <b>    {"fld":[141], "task":"range", "data": ["Adam","Dave"]} </b>
###"dataype"| "fld" | "task" | "data" || :-------: | :----: | ----- || 0 - n  | "datatype" | One of the listed data types in the following table enclosed in double quotesData types that can be defined:| Data Types | Description || :-------: | ---- | | alpha  | contain only alpha characters, no numbers or special characters| alphab  | contain only alpha characters and blank(s), no numbers or special characters| alphabh  | contain only alpha characters, blank(s), and hyphen(s), no numbers or special characters| decimal | decimal point is required, numbers without decimal point are not allowed| float | any valid whole or decimal number.  If number is less than one it must begin with zero (0) i.e. 0.345 | hex  | contain only hex values (a-f, 0-9), blank(s), and hyphen(s).  Not case sensitive.| integer | any whole number equal to or less than 9007199254740991| name  | the field must contain only alpha characters, blank(s), hyphen(s), period(s), and apostrophe(s), no numbers or special characters| number | any whole or decimal number | string | any valid string of letters, numbers, and special charactersExample:<br> 1 - In field 19 validate for data type name e.g. Smith-Olson, O'brien, Mark Jr.<b>     {"fld":[19],  "task":"datatype", "data": "name"},</b>2 - In field 3 validate for hex data type e.g ac45-dfdf-0000, 3456-9999, 23ef 23cd 23ad<b>    {"fld":[3], "task":"datatype", "data": "hex"} </b>	<br>##Processing output logAs the application is executing processing messages are written to the console.  
Using sample files input data file 'data_file_4_TAB.txt' and configuration file 'config_4.json' (located in the example directory) the following console output is generated.
###Configuration file:
	    {
      "trialrun": false,
      "batchsize": 10,
      "printreplacements" : true,

      "database": 
        {
          "dbname"  : "doctors",
          "create"  : true,
          "url"     : "http://localhost:5984"
        },

      "inputfile": 
        {
          "filename"    : "/Users/daveweilert/GitHub/dataloader/example/data_file_4_TAB.txt",
          "headerrow"    : true,
          "keepfields"   : ["3","4","5","6","7","8","9","10","15","16","17","18","19","20","21","22"]
        },

	  "buildindexes":
		[
		  {"name": "last_idx",    "fields": ["LST_NAME"] },
		  {"name": "first_idx",   "fields": ["FST_NAME"] }
		],

      "validators":
	    [
		  {"fld":[21],      "task":"range",    "data": [0,99999]},
		  {"fld":[6],       "task":"values",   "data": ["M","F"]},
          {"fld":[3,4],     "task":"datatype", "data": "name"},
		  {"fld":[8,15,22], "task":"replace",  "data": ["\"",""]}	    
		]
    } ###Start command:
	npm start ./example/config_4.json<br>###Console output: 	cldr1000i - Start Parameter: 0: /usr/local/bin/node
	cldr1000i - Start Parameter: 1: /Users/daveweilert/dataloader.js
	cldr1000i - Start Parameter: 2: ./example/config_4.json
	cldr1001i - Loading parameters from configuration file: ././example/config_4.json
	cldr1003i - Data load program started ...
	cldr1010i - Data load program loaded into memory
	cldr2056i - PARM - buildindexes[0]: last_idx
	cldr2056i - PARM - buildindexes[1]: first_idx
	cldr2018i - PARM - database.dbname: doctors
	cldr2020i - PARM - database.url: http://localhost:5984
	cldr2022i - PARM - database.create: true
	cldr2024i - PARM - inputfile.filename: /Users/daveweilert/GitHub/dataloader/example/data_file_4_TAB.txt
	cldr2027w - PARM - inputfile.delimiter: Not defined using default value: TAB
	cldr2026i - PARM - inputfile.headerrow: true
	cldr2043w - PARM - inputfile.skipfirstrow: Not defined using default value: false
	cldr2055i - PARM - inputfile.keepfields: 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22
	cldr2036i - PARM - trialrun: false
	cldr2039i - PARM - batchsize: 10
	cldr2044i - PARM - printreplacements: true
	cldr1402i - 4 validator definition(s) defined in configuration file
	cldr1403i - Configuring validator: 1
	cldr1414i - Type Validator: Range, defined at: R0
	cldr1403i - Configuring validator: 2
	cldr1413i - Type Validator: ValidValues, defined at: V0
	cldr1403i - Configuring validator: 3
	cldr1414i - Type Validator: DataTypes, defined at: T0
	cldr1403i - Configuring validator: 4
	cldr1423i - Type Validator: Replace, defined at: P0
	cldr1408i - Field 3 will be validated for Data Type using entry: T0
	cldr1408i - Field 4 will be validated for Data Type using entry: T0
	cldr1407i - Field 6 will be validated for Valid Values using entry: V0
	cldr1410i - Field 8 will replace data using entry: P0
	cldr1410i - Field 15 will replace data using entry: P0
	cldr1410i - Field 22 will replace data using entry: P0
	cldr1411i - V0 - ValueValues : M, F
	cldr1412i - T0 - DataType : NAME
	cldr1429i - R0 - Ranges for - Begin: 0 End: 99999
	cldr1455i - P0 - Replace - From value: " To value: <blank>
	cldr1006i - Creating database connection
	cldr4000e - Creating db Connection
	cldr4020i - Deleted database: doctors
	cldr4023i - Created database: doctors
	cldr4015i - DataBase: doctors connection initialized
	cldr4002i - Initialized and connected to database, able to proceed
	cldr1010i - Index processing invoked
	cldr0600i - 2 index definitions to be processed
	cldr4027i - Index name: last_idx - Field name[0]: LST_NAME
	cldr4027i - Index name: first_idx - Field name[0]: FST_NAME
	cldr4028i - Number of existing database indexes: 1 
	cldr4029i - Name: _all_docs (special): {"fields":[{"_id":"asc"}]}
	cldr0010i - Index list status: PASS
	cldr0302i - Using first row of input file for field names
	cldr0401i - Header field name(s): 
	cldr0402i - Field 0 name = NPI_ID
	cldr0402i - Field 1 name = PAC_ID
	cldr0402i - Field 2 name = PROF_ID
	cldr0402i - Field 3 name = LST_NAME
	cldr0402i - Field 4 name = FST_NAME
	cldr0402i - Field 5 name = MID_NAME
	cldr0402i - Field 6 name = GENDER
	cldr0402i - Field 7 name = CREDS
	cldr0402i - Field 8 name = MED_SCHOOL
	cldr0402i - Field 9 name = GRAD_YR
	cldr0402i - Field 10 name = SPEC_1ST
	cldr0402i - Field 11 name = SPEC_2ND
	cldr0402i - Field 12 name = SPEC_3RD
	cldr0402i - Field 13 name = SPEC_4TH
	cldr0402i - Field 14 name = SPEC_5TH
	cldr0402i - Field 15 name = ORG_LEGAL_NAME
	cldr0402i - Field 16 name = GRP_PRAC_ID
	cldr0402i - Field 17 name = ADDR_LINE1
	cldr0402i - Field 18 name = ADDR_LINE2
	cldr0402i - Field 19 name = ADDR_CITY
	cldr0402i - Field 20 name = ADDR_ST
	cldr0402i - Field 21 name = ADDR_ZIP
	cldr0402i - Field 22 name = AFIL_HOSP
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 0
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 1
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 2
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 18
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 19
	cldr1491i - Replacement source data: " located in record: 2 field: 22 at position: 20
	cldr1491i - Replacement source data: " located in record: 3 field: 15 at position: 0
	cldr1491i - Replacement source data: " located in record: 3 field: 15 at position: 22
	cldr4026e - Index name: last_idx created successfully
	cldr0308i - 4 records added to database
	cldr0900i - End of input file reached
	cldr0901i - Records passing validation: 4
	cldr0902i - Validation replacements   : 6
	cldr0908i - Start date/time           : Tue Sep 27 2016 22:52:19 GMT-0500 (CDT)
	cldr0909i - End date/time             : Tue Sep 27 2016 22:52:19 GMT-0500 (CDT)
	cldr0910i - Elapsed time              : 0:0.207 (MM:SS.mmm)
	cldr0911i - Average Time/Record       : 51.75 milliseconds
	cldr0999i - Program completed## Maintainer

#### Dave Weilert

http://github.com/daveweilert/dataloader.git/

<b>dataloader</b> was created as the result of needing a tool to validate and load data quickly and easily into IBM Cloudant and Apache CouchDB.


Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.