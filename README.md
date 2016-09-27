## dataloader 
<br>

A node.js application that loads data into IBM Cloudant or Apache CouchDB databases.  The application can load data from a file with delimited fields into a target database.  This application is run from a terminal / command prompt or can be invoked from a batch script. 

Application features include:

- Append data to an existing database or create a new database instance
 
- Data indexes can also be defined and created for the database

- Validate or modify data for each individual field with one or more of the following: 

	| Validator | Description |
	| -------: | ---- | ---- |
	| datatype | validate field is a specific type of data  
	| range    | validate field is included in a range 
	| values   | validate field is one of the defined values
	| replace  | for the defined field replace all occurrences of a 'from' value with the 'to' value    

- Data validation can be performed prior to loading actual data by using the 'trialrun' parameter

- Batch and bulk load data to improve load time and reduce the number network requests by using the 'batchsize' parameter

- The input file field delimiter can be user defined

- Field names for the document loaded into the database can be user defined.  This is accomplished by using the first record of the input file or by using the 'fieldnames' parameter.

- Select which fields from the input file are to be loaded by using the 'keepfields' parameter 

		Node.js is required to execute this application


