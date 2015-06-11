'use strict';

angular.module('nanobiApp')
  .controller('MainCtrl', function ($scope, $http,$moment,lodash,$filter,$timeout) {
    
    $scope.currentitem       = {};
    $scope.currentitem.region = "ALL";

    var getCurrentRegion=function(scope){
      return $scope.currentitem.region;
    }
  
    //$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
   // uiGmapGoogleMapApi.then(function(maps) {
    //   console.log('gmap loaded')
    // });
    
    

    $scope.items={};
    $http.get('/api/excel').success(function(response){


      //console.log(response);
      $scope.items.data=response.sales;
      $scope.items.location = response.location;
      //console.log($scope.items);
      $scope.cafesalesmap={};
      for(var i=0;i<$scope.items.data.length;i++)
      {
        if($scope.cafesalesmap[$scope.items.data[i]['Café ID']]==undefined)
        {
          $scope.cafesalesmap[$scope.items.data[i]['Café ID']]=Number($scope.items.data[i].Sales);
        }
        else
        {
          var currentshop = $scope.items.data[i]['Café ID'];
          $scope.cafesalesmap[currentshop]=$scope.cafesalesmap[currentshop]+Number($scope.items.data[i].Sales);
        }  
      }
      console.log($scope.cafesalesmap);
      $scope.$on('mapInitialized', function(event, map) {
        console.log('map initialised');
        $scope.markers=[];
        $scope.map=map;

        for(var i=0;i<$scope.items.location.length;i++)
        {
          var pos = $scope.items.location[i].Location.split(',');
          pos[0] = Number(pos[0].match(/[0-9]*\.[0-9]*/)[0]);
          pos[1] = Number(pos[1].match(/[0-9]*\.[0-9]*/)[0]);
          var pos = new google.maps.LatLng(pos[0],pos[1]);
        map.setZoom(3);      // This will trigger a zoom_changed on the map
        map.setCenter(pos);

          var tempmarker = new google.maps.Marker({
              position: pos,
              map: map,
              title: 'Sales at '+$scope.items.location[i]['Café ID'],
              cafeid: $scope.items.location[i]['Café ID']
          }); 

          $scope.markers.push(tempmarker);
          //markers.push(tempmarker);
        }

        for(var i=0;i<$scope.markers.length;i++)
        {
          (function(i){
            setTimeout(function(){
             var infowindow = new google.maps.InfoWindow({
              content : 'Sales at '+$scope.markers[i].cafeid+' : '+$scope.cafesalesmap[$scope.markers[i].cafeid]
              });
              google.maps.event.addListener($scope.markers[i], 'click', function() {
                infowindow.open(map,$scope.markers[i]);
              });
            });
          })(i)
        }


        //console.log(map)
        //map.panTo(pos);

      });
    

      var aggregatedmap={};
      for(var i=0;i<$scope.items.data.length;i++)
      {
        var current = $scope.items.data[i];
        if(aggregatedmap[current.Region]==undefined)
          aggregatedmap[current.Region]=Number(current.Sales);
        else
          aggregatedmap[current.Region] =  aggregatedmap[current.Region]+Number(current.Sales);
      }
      console.log(aggregatedmap)
      $scope.items.filtered=aggregatedmap;
      
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

          console.log($scope.totalsales);
        }
        $('.dial').val($scope.totalsales).trigger('change');     

      });  

      $scope.dates = lodash.uniq(lodash.pluck($scope.items.data,'Date'));
      var isodates = [];
      for (var i=0;i<$scope.dates.length;i++){
        isodates[i] = $moment($scope.dates[i],"DD MMM YY").format();
      }
      isodates.sort();
      for (var i=0;i<isodates.length;i++){
        $scope.dates[i] = $moment(isodates[i]).format("DD MMM YY");
      }
      //console.log(isodates);
      $scope.uniqregions       = ["ALL"];
      $scope.uniqregions.push.apply($scope.uniqregions, lodash.uniq(lodash.pluck($scope.items.data,'Region'))); 
      $scope.currentitem.start = $scope.dates[0];
      $scope.currentitem.end   = $scope.dates[$scope.dates.length-1];
      
      $scope.rowclick = function(element){
        //console.log(element.key,element.value);
        $scope.currentitem.region = element.key;  
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

          aggregateSalesByCafe();

          for(var i=0;i<$scope.markers.length;i++)
          {
            (function(i){
              setTimeout(function(){
               var infowindow = new google.maps.InfoWindow({
                content : 'Sales at '+$scope.markers[i].cafeid+' : '+$scope.cafesalesmap[$scope.markers[i].cafeid]
                });
                google.maps.event.clearListeners($scope.markers[i], 'click');

                google.maps.event.addListener($scope.markers[i], 'click', function() {
                  infowindow.open($scope.map,$scope.markers[i]);
                });
              });
            })(i)
          }

          //$scope.items.filtered    ={};
          //delete $scope.items.filtered;// = {'Region':'MAS','Sales':'900'};//filter(start,end);
          //console.log($scope.items.filtered)
        }});
    }).error(function(err){
      console.log('err '+err);
      });


    var aggregateSalesByCafe = function(){
      var startdate     = $moment($scope.currentitem.start,"DD MMM YY").format();
      var enddate       = $moment($scope.currentitem.end,"DD MMM YY").format();  
      
      var filteredInput = lodash.filter($scope.items.data,function(n){

          var curdate       = $moment(n.Date,"DD MMM YY").format();
          if(curdate>=startdate && curdate<=enddate)
          {
            return true;
          }
      });

      $scope.cafesalesmap={};
      for(var i=0;i<filteredInput.length;i++)
      {
        if($scope.cafesalesmap[filteredInput[i]['Café ID']]==undefined)
          $scope.cafesalesmap[filteredInput[i]['Café ID']]=Number(filteredInput[i].Sales);
        else
          $scope.cafesalesmap[filteredInput[i]['Café ID']]+=Number(filteredInput[i].Sales);
      }
      console.log($scope.cafesalesmap);

    };

}).filter('datefilter',function(lodash,$moment){
  return function(input,start,end,region,json){
    
      //console.log(input,start,end,region,json);
      
      var startdate     = $moment(start,"DD MMM YY").format();
      var enddate       = $moment(end,"DD MMM YY").format();  
      
      var filteredInput = lodash.filter(json,function(n){

          var curdate       = $moment(n.Date,"DD MMM YY").format();
          if(curdate>=startdate && curdate<=enddate && region=='ALL')
          {
            return true;
          }
          else if(curdate>=startdate && curdate<=enddate && region==n.Region)
          {
            return true;
          }
      });//console.log($moment(input.date,"DD MMM YY"))//.isBetween(start,end))
          var outputmap={};
          for(var i=0;i<filteredInput.length;i++)
          {
            if(outputmap[filteredInput[i].Region]==undefined)
              outputmap[filteredInput[i].Region]=Number(filteredInput[i].Sales);
            else
              outputmap[filteredInput[i].Region]=outputmap[filteredInput[i].Region]+Number(filteredInput[i].Sales);
          }
          //console.log(outputmap);
               
          return outputmap;     
    
    
    //return {};
  }
});


    
  
