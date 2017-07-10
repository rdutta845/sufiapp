angular.module('starter.controllers')
.controller('SessionDetails2Controller', function(CONFIG, $scope, $stateParams, $ionicPopup, $http, $location, $auth, $window , $cordovaGeolocation) {

		$scope.scheduleShow = true;
		$scope.contentShow = true;
		$scope.currentPosition = {};
		var posOptions = {enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition().then(function (position) {
			$scope.currentPosition.lat = position.coords.latitude;
			$scope.currentPosition.long = position.coords.longitude;
		});
		function distance(lat1, lon1, lat2, lon2, unit) {
			var radlat1 = Math.PI * lat1/180
			var radlat2 = Math.PI * lat2/180
			var theta = lon1-lon2
			var radtheta = Math.PI * theta/180
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			dist = Math.acos(dist)
			dist = dist * 180/Math.PI
			dist = dist * 60 * 1.1515
			if (unit=="K") { dist = dist * 1.609344 }
			if (unit=="N") { dist = dist * 0.8684 }
			console.log(dist);
			return dist
		}
		$scope.toggle = function(str){
			console.log(str);
			if(str == 'schedule'){
					$scope.scheduleShow = !$scope.scheduleShow;

			}else if(str == 'content'){
					$scope.contentShow = !$scope.contentShow;

			}
 		}
		$http({
	    method:"GET",
	    url:CONFIG.apiEndpoint+"/getsessioninfo/" + $stateParams.id,
	  }).then(function mySucces(response) {
			$scope.session = response.data.result;
			$scope.schoolLocation = response.data.location;
			$scope.session._volunteers.forEach(function(volunteer){
        // To get the number of sessions completed by the volunteer.
        $http({
          method:"GET",
          url:CONFIG.apiEndpoint+"/numberofsessioncomplete/"+volunteer.id + "/"
            + $scope.session._studentClass.id + "/" + $scope.session._studentClass.currentTerm,
        }).then(function success(response) {
          volunteer.sessionsComp = response.data.numberofsessioncompleted;
        })
        // To see if the volunteer knows the local language of the school.
        volunteer.languages.forEach(function(lang){
          volunteer.knowslocal = false;
          if(lang.toLowerCase() == $scope.session._school.languageOfInstruction.toLowerCase()){
            volunteer.knowslocal = true;
          }
        })
      })
			console.log(response);

	  })
		$scope.checkin = function (id) { //session._id
			console.log("id print",id);
			$scope.date = new Date();
			console.log((new Date($scope.session.date) - $scope.date)/ (1000 * 3600 * 24));
			if((new Date($scope.session.date) - $scope.date)/ (1000 * 3600 * 24) < 1) {
				if(distance($scope.currentPosition.lat, $scope.currentPosition.long, $scope.schoolLocation.lat, $scope.schoolLocation.lng, 'K') < 0.2) {
					$location.path("app/session_details/" + id);
				} else {
					$ionicPopup.alert({
			      title: 'Restricted',
			      template: 'You have not arrived in school!'
			    });
				}
			} else {
				$ionicPopup.alert({
		      title: 'Restricted',
		      template: 'You can Check IN only on sessions day'
		    });
			}
		}


	})
