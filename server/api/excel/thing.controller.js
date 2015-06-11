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
var path = require('path');
var config = require('../../config/environment');
var excelpath = path.join(config.root,'server/api/excel/')//cases.xlsx')
// Get list of things

exports.getexcel = function(req, res) {
  
  var finaljson={};
  var salesjson=[];
  var locationjson=[];
  var returnval;
  excelParser.parse({
    inFile: excelpath+'newtestcase.xlsx',
    worksheet : 1,
    skipEmpty : true,
  }, function(err, records){
    if(err) {
      console.error(err)
      return res.send(500);
    }
    else{
      var keys = records[0];
      for(var i=1;i<records.length;i++)
      {
        var temp={}
        for(var j=0;j<keys.length;j++)
        {
         var key     = keys[j];
         var value   = records[i][j];
         temp[key] = value;
        }
      salesjson.push(temp);
      }
      finaljson['location']=salesjson;

      excelParser.parse({
        inFile: excelpath+'newtestcase.xlsx',
        worksheet:2,
        skipEmpty:true,
      },function(err,records){
        var keys = records[0];
        for(var i=1;i<records.length;i++)
        {
          var temp={}
          for(var j=0;j<keys.length;j++)
          {
           var key     = keys[j];
           var value   = records[i][j];
           temp[key] = value;
          }
        locationjson.push(temp) ;
        }
        finaljson['sales']=locationjson;
        console.log(finaljson);
        res.send(finaljson);
      });
      
    }
    
  });
      //console.log(returnval);
      
 
  //   excelParser.parse({
  //   inFile: excelpath+'cafelocation.xlsx',
  //   worksheet : 2,
  //   skipEmpty : true,
  // }, function(err, records){
  //     console.log(records)

  // //   if(err) {
  // //     console.error(err)
  // //     return res.send(500);
  // //   }
  // //   else{
  // //     finaljson=[];
  // //     var keys = records[0];
  // //     var finaljson=[];
  // //     for(var i=1;i<records.length;i++){
  // //       var temp={}
  // //       for(var j=0;j<keys.length;j++)
  // //       {
  // //        var key     = keys[j];
  // //        var value   = records[i][j];
  // //        temp[key] = value;
  // //       }
  // //     finaljson.push(temp) ;
  // //     }
  // //     console.log(finaljson);
  // //   }

  //     });
 
    //return res.json(finaljson);
};



function handleError(res, err) {
  return res.send(500, err);
}
