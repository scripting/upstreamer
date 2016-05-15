var myVersion = "0.40g", myProductName = "upstream"; 

var fs = require ("fs");
var mime = require ("mime"); 
var s3 = require ("./lib/s3.js");
var utils = require ("./lib/utils.js");
var filesystem = require ("./lib/filesystem.js");

var config = {
	s3path: "/scripting/upstream/test/", //where we upload to
	folder: "myFiles/", //where we upload from
	ctSecsBetwScans: 5
	};
var fnameConfig = "config.json";

var stats = {
	ctSaves: 0, 
	ctScans: 0,
	ctSecsLastScan: 0,
	whenLastSave: new Date (0),
	theFiles: {
		}
	};
var fnameStats = "stats.json", flStatsDirty = false;

function skipFile (f) {
	if (config.namesToSkip !== undefined) {
		var name = utils.stringLastField (f, "/");
		for (var i = 0; i < config.namesToSkip.length; i++) {
			if (name == config.namesToSkip [i]) {
				return (true);
				}
			}
		}
	return (false);
	}
function getFileItemName (f) {
	var name = utils.stringDelete (f, 1, config.folder.length);
	return (name);
	}
function uploadOneFile (f, callback) {
	var item = stats.theFiles [getFileItemName (f)], whenStart = new Date ();
	function getMimeType (f) { 
		var ext = utils.stringLastField (f, ".");
		mime.default_type = "text/plain";
		return (mime.lookup (ext));
		}
	fs.readFile (f, function (err, data) {
		if (!err) {
			var path = config.s3path + utils.stringDelete (f, 1, config.folder.length);
			console.log ("uploadOneFile: path == " + path);
			s3.newObject (path, data, getMimeType (path), "private", function () {
				item.ctWrites++;
				item.whenLastWrite = whenStart;
				item.ctSecsLastWrite = utils.secondsSince (whenStart);
				flStatsDirty = true;
				if (callback !== undefined) {
					callback ();
					}
				});
			}
		});
	}
function getFileModDate (f) {
	var stats = fs.statSync (f);
	return (new Date (stats.mtime));
	}
function watchFolder () {
	var whenScanStart = new Date ();
	function checkFile (f) {
		if (!skipFile (f)) {
			var flupload = true, whenStart = new Date (), whenModified = getFileModDate (f);
			if (stats.theFiles [getFileItemName (f)] === undefined) {
				stats.theFiles [getFileItemName (f)] = {
					ctWrites: 0,
					whenModified: whenModified
					};
				flStatsDirty = true;
				}
			else {
				var savedMod = new Date (stats.theFiles [getFileItemName (f)].whenModified);
				if (whenModified <= savedMod) {
					flupload = false;
					}
				}
			if (flupload) {
				var item = stats.theFiles [getFileItemName (f)];
				item.whenModified = whenModified; 
				flStatsDirty = true;
				uploadOneFile (f);
				}
			}
		}
	filesystem.sureFilePath (config.folder + "xxx", function () {
		filesystem.recursivelyVisitFiles (config.folder, function (f) {
			if (f !== undefined) {
				checkFile (f);
				}
			else {
				stats.ctScans++;
				stats.ctSecsLastScan = utils.secondsSince (whenScanStart);
				flStatsDirty = true;
				}
			});
		});
	}
function loadStats (callback) { 
	fs.readFile (fnameStats, function (err, data) {
		if (err) {
			}
		else {
			stats = JSON.parse (data.toString ());
			if (stats.ctScans === undefined) {
				stats.ctScans = 0;
				}
			}
		if (callback !== undefined) {
			callback ();
			}
		});
	}
function loadConfig (callback) { 
	fs.readFile (fnameConfig, function (err, data) {
		if (err) {
			console.log ("loadConfig: err.message == " + err.message);
			}
		else {
			var myConfig = JSON.parse (data.toString ());
			for (var x in myConfig) {
				config [x] = myConfig [x];
				}
			}
		if (callback !== undefined) {
			callback ();
			}
		});
	}
function everyMinute () {
	var now = new Date ();
	console.log ("\neveryMinute: " + now.toLocaleTimeString () + ", v" + myVersion + "\n");
	}
function everySecond () {
	if (flStatsDirty) {
		stats.ctSaves++;
		stats.whenLastSave = new Date ();
		fs.writeFile (fnameStats, utils.jsonStringify (stats));
		flStatsDirty = false;
		}
	}
function startup () {
	console.log ("\n" + myProductName + " v" + myVersion + "\n");
	loadConfig (function () {
		loadStats (function () {
			console.log ("startup: config == " + utils.jsonStringify (config));
			watchFolder (); //do a scan at startup
			setInterval (everySecond, 1000); 
			setInterval (everyMinute, 60000); 
			setInterval (watchFolder, config.ctSecsBetwScans * 1000); 
			});
		});
	}

startup ();
