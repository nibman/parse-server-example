// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var mongodb = require('mongodb');
var path = require('path');
var db;
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || "mongodb://heroku_q2hshcg6:9ftraq93ovoa6vj0v450jv93be@ds011943.mlab.com:11943/heroku_q2hshcg6";

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_q2hshcg6:9ftraq93ovoa6vj0v450jv93be@ds011943.mlab.com:11943/heroku_q2hshcg6',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'serdyio',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/assets', express.static(path.join(__dirname, '/public/assets')));
app.use('/Build', express.static(path.join(__dirname, '/public/assets/Build')));



// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

 app.get('/mapsA', function(req, res)
  {
    res.sendFile(path.join(__dirname, "/public/maps-cesium/index.html"));
  });

  app.get('/mapsB', function(req, res)
  {
    res.sendFile(path.join(__dirname, "/public/maps-google/index.html"));
  });

  app.get('/mapsC', function(req, res)
  {
    res.sendFile(path.join(__dirname, "/public/maps-leaflet/index.html"));
  });

  app.get('/riders', function(req, res)
  {
  res.sendFile(path.join(__dirname, "/public/riders/index.html"));
  });

  app.get('/leaders', function(req, res)
  {
  res.sendFile(path.join(__dirname, "/public/leaders/leaders.html"));
  });

  app.get('/tag', function(req, res)
  {
  res.sendFile(path.join(__dirname, "/public/leaders/tag.html"));
  });

  app.get('/teams', function(req, res)
  {
  res.sendFile(path.join(__dirname, "/public/teams/teams.html"));
  });

app.get('/docs', function(req, res)
{
  res.sendFile(path.join(__dirname, "/public/bioEntry/site/index.html"));
});

app.get('/velon-riders', function(req, res)
{
  db.collection("Athlete").find({ "isVelon": "true" }).toArray(function(err, data) 
      {   
          var d = JSON.stringify(data);
          res.status(200).json(d); 
      });
});

app.get('/list-riders', function(req, res)
{
  if (req.query.velonin && req.query.velonin == "true")
  {
    db.collection("Athlete").find({}).toArray(function(err, data) 
      {   
          var d = JSON.stringify(data);
          res.status(200).json(d); 
      });
  }
  else
  {
    db.collection("Athlete").find({ "isVelon": "false" }).toArray(function(err, data) 
      {   
          var d = JSON.stringify(data);
          res.status(200).json(d); 
      });
  }
});
  
app.get('/list-riders', function(req, res)
{
  db.collection("Athlete").find({}).toArray(function(err, data) 
    {   
        var d = JSON.stringify(data);
        res.status(200).json(d);
      });
});
    
  /*
  var currentUser = Parse.User.current();
  if(currentUser)
  {
    res.status(200).send('This is where the data entry and event management occurs');
  }
  else
  {
    res.sendFile(path.join(__dirname, '/public/login.html'));
  }*/



// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('serdy.io running on port ' + port + '.');
});

mongodb.MongoClient.connect(databaseUri, function(err, database)
  {
    if(err)
    {
      console.log(err);
      process.exit(1);
    }
    db = database;
  });

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
