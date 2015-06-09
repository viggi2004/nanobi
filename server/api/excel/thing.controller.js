/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var excelParser = require('excel-parser');
// Get list of things

exports.getexcel = function(req, res) {
  

  excelParser.parse({
    inFile: 'server/api/excel/cases.xlsx',
    worksheet : 1,
    skipEmpty : true,
  }, function(err, records){
    if(err) {
      console.error(err)
      return res.send(500);
    }
    else{
      var keys = records[0];
      var finaljson=[];
      for(var i=1;i<records.length;i++){
        var temp={}
        for(var j=0;j<keys.length;j++)
        {
         var key     = keys[j];
         var value   = records[i][j];
         temp[key] = value;
        }
      finaljson.push(temp) ;
      }
      return res.json(finaljson);
    }
  });
   
};



function handleError(res, err) {
  return res.send(500, err);
}