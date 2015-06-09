'use strict';

angular.module('nanobiApp')
  .controller('MainCtrl', function ($scope, $http,$moment,lodash,$filter,$timeout) {
    
    $scope.currentitem       = {};
    $scope.currentitem.region = "ALL";

    var getCurrentRegion=function(scope){
      return $scope.currentitem.region;
    }
    
    

    $scope.items={};
    $http.get('/api/excel').success(function(response){


      //console.log(response);
      $scope.items.data=response;
      $scope.items.filtered=angular.copy(response);
      $scope.totalsales = lodash.sum($scope.items.data,function(n){
        return Number(n.Sales);
      });
      
      $(function() {
        $(".dial").knob({
          'angleOffset':-125,
          'angleArc':250,
          'min':0,
          'max':$scope.totalsales
        });
      });

      $scope.$watch(getCurrentRegion,function(newval,oldval){
        
        $scope.totalsales=0;
        if(newval == "ALL")  
        {

          $scope.totalsales = lodash.sum($scope.items.data,function(n){
            return Number(n.Sales);
          });
        }
        else
        {
          
          $scope.totalsales = lodash.sum(lodash.pluck(lodash.where($scope.items.data,{'Region':newval}),'Sales'),function(n){
            return Number(n);
          });         
        }
        $('.dial').val($scope.totalsales).trigger('change');     

      });  

      $scope.dates = lodash.uniq(lodash.pluck($scope.items.data,'Date'));
      var isodates = [];
      for (var i=0;i<$scope.dates.length;i++){
        isodates[i] = $moment($scope.dates[i],"DD-MMM-YY").format();
      }
      isodates.sort();
      for (var i=0;i<isodates.length;i++){
        $scope.dates[i] = $moment(isodates[i]).format("DD-MMM-YY");
      }
      //console.log(isodates);
      $scope.uniqregions       = ["ALL"];
      $scope.uniqregions.push.apply($scope.uniqregions, lodash.uniq(lodash.pluck($scope.items.data,'Region'))); 
      $scope.currentitem.start = $scope.dates[0];
      $scope.currentitem.end   = $scope.dates[$scope.dates.length-1];
      
      $scope.rowclick = function(element){
        $scope.currentitem.region = element.item.Region;  
      };

      $("#rangeslider").ionRangeSlider({
        min: 0,
        max: 10000,
        from: 1000,
        to: 9000,
        type: 'double',
        values: $scope.dates,
        grid: true,
        grid_num: 10,
        onChange : function(data){
          $scope.currentitem.start = data.from_value;
          $scope.currentitem.end   = data.to_value;
          $filter('datefilter')($scope.items.data,$scope.currentitem.start,$scope.currentitem.end,$scope.currentitem.region);
          $scope.$apply();
          //$scope.items.filtered    ={};
          //delete $scope.items.filtered;// = {'Region':'MAS','Sales':'900'};//filter(start,end);
          //console.log($scope.items.filtered)
        }});
    }).error(function(err){
      console.log('err '+err);
      });


    

}).filter('datefilter',function(lodash,$moment){
  return function(input,start,end,region){
    
      
      var startdate     = $moment(start,"DD-MMM-YY").format();
      var enddate       = $moment(end,"DD-MMM-YY").format();  
      
      var filteredInput = lodash.filter(input,function(n){

          var curdate       = $moment(n.Date,"DD-MMM-YY").format();
          if(curdate>=startdate && curdate<=enddate && region=='ALL')
          {
              return true;
          }
          else if(curdate>=startdate && curdate<=enddate && region==n.Region)
          {
            return true;
          }
    });//console.log($moment(input.date,"DD MMM YY"))//.isBetween(start,end))
     //console.log(filteredInput) ;
               
          return filteredInput;     
    
    
    //return {};
  }
});


    
  
