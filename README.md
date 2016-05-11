### Upstreamer

Upstreamer is a Node.js app that keeps a folder backed up on Amazon S3.

#### How upstreamer works

I have a server running a set of Node apps using <a href="https://github.com/foreverjs/forever">forever</a> to keep them running. 

Each app is in a sub-folder of a main folder, where all its code and prefs/stats are stored. In some cases the user data is stored there too. 

I want to keep a copy of all the files in all the sub-folders in an S3 bucket. The backups are continuously updating as things change. 

My copy of upstreamer is configured to do this. 

#### How to set up

To install:

<pre>npm install</pre>

Edit <a href="https://github.com/scripting/upstreamer/blob/master/config.json">config.json</a> and set <i>s3path</i> to point to the place in your S3 bucket where you want this server's backups to be stored.

<i>folder</i> is the folder hierchy we'll scan on this machine. 

<i>ctSecsBetwScans</i> is the number of seconds between each scan. 

upstream.js is the app, to run it: 

<pre>node upstream.js</pre>

#### Questions, comments?

Please post a note on the <a href="https://groups.google.com/forum/?fromgroups#!forum/server-snacks">Server-Snacks mail list</a>.

