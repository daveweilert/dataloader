// Global Vars
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