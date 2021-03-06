var fs = require('fs'),
  path = require('path'),
  when = require('when'),
  util = require('util'),
  _ = require('lodash'),
  AbstractCommand = require('./abstract');



util.inherits(Clone, AbstractCommand);

function Clone(cwd, params, commander) {
  AbstractCommand.call(this, cwd, params, commander);
}

Clone.prototype.command = function(projectRoot, repo) {
  var branch = this.commander.branch || 'master';
  this.info("Cloning " + repo + " into " + projectRoot);
  this.info("params:" + JSON.stringify(this.params));
  if (branch != 'master'){
    var args = ['clone', repo, projectRoot, '-b', branch]
    this.info("Clone command: " + JSON.stringify(args));
     return this.git(args, projectRoot);
  }else{
    return this.git(['clone', repo, projectRoot], projectRoot);
  }
};

Clone.prototype.runOnWorkspace = function(cwd) {
  var self = this;
  var promise = when.resolve();
  var group = self.getGroup();
  _.each(group, function(repo, projectName) {
    promise = promise.then(function() {
      var projectPath = path.resolve(cwd, projectName);
      if(fs.existsSync(projectPath)) {
        if(!fs.statSync(projectPath).isDirectory() || fs.readdirSync(projectPath).length > 0) {
          self.info("Cannot create directory for project " + projectName +
            " because the directory/file already exists and is not empty");
          return;
        }
      } else {
        fs.mkdirSync(projectPath);
      }

      return self.runOnProject(projectPath);
    });
  });
  return promise;
};

module.exports = Clone;