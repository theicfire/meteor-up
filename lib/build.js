var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var pathResolve = path.resolve;
var _ = require('underscore');

function buildApp(appPath, meteorBinary, buildLocaltion, callback) {
  buildMeteorApp(appPath, meteorBinary, buildLocaltion, function(code) {
    if(code == 0) {
      renameIt(appPath, buildLocaltion, callback);
    } else {
      console.log("\n=> Build Error. Check the logs printed above.");
      callback(new Error("build-error"));
    }
  });
}

function renameIt(appPath, buildLocaltion, callback) {
  var parts = appPath.split(path.sep);
  var bundlePath = pathResolve(buildLocaltion, parts[parts.length - 1] + '.tar.gz');
  var newBundlePath = pathResolve(buildLocaltion, 'bundle.tar.gz');
  fs.rename(bundlePath, newBundlePath, callback);
}

function buildMeteorApp(appPath, meteorBinary, buildLocaltion, callback) {
  var executable = meteorBinary;
  var args = [
    "build", buildLocaltion
  ];
  
  var isWin = /^win/.test(process.platform);
  if(isWin) {
    // Sometimes cmd.exe not available in the path
    // See: http://goo.gl/ADmzoD
    executable = process.env.comspec || "cmd.exe";
    args = ["/c", "meteor"].concat(args);
  }

  var options = {cwd: appPath};
  var meteor = spawn(executable, args, options);
  var stdout = "";
  var stderr = "";

  meteor.stdout.pipe(process.stdout, {end: false});
  meteor.stderr.pipe(process.stderr, {end: false});

  meteor.on('close', callback);
}

module.exports = buildApp;
