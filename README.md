### Upstreamer

Upstreamer is a Node.js app that keeps a folder backed up on Amazon S3.

#### How upstreamer works

Have a servers running a set of Node apps using forever keeping them running. 

Each app is in a sub-folder of the main server apps folder, where all its code and prefs/stats are stored. In some cases the user data is stored there too. 

I want to keep a copy of all the files in all the sub-folders in an S3 bucket. The backups are incremental, continuously updating. 

My copy of upstreamer is configured to do this. 

#### How to set up

Edit config.json and set S3path to point to the place in your S3 bucket where you want this server's backups to be stored.

folder is the folder hierchy we'll scan on this machine. 

ctSecsBetwScans is obviously the number of seconds between each scan. 

upstream.js is the app, to run it: 

<code>node upstream.js</code>

#### Updates

##### v0.41 -- 2/3/16 by DW

Say what happened.

#### Questions, comments?

Please post a note on the Server-Snacks mail list.

