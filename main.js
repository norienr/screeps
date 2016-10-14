var defenseModule = require('defenseModule');
var unitControlModule = require('unitControlModule');
var constructionModule = require('constructionModule');

var main = function () {
    unitControlModule.run();
    constructionModule.run();
    defenseModule.run();

};

module.exports.loop = main;
