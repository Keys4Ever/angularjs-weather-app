angular.module('weatherApp').controller('forecastController', ['$scope', 'cityService', '$location', 'AuthService', 'mapService', 'weatherApiService', 
    function($scope, cityService, $location, AuthService, mapService, weatherApiService) {
      if (!AuthService.getToken()) {
        $location.path('/');
        return;
      }

      $scope.logout = function() {
        AuthService.logout();
      };

      if(cityService.city) {
        $scope.city = cityService.city;
        $scope.startDate = cityService.startDate;
        $scope.endDate = cityService.endDate;
      }
      const today = new Date();
      const in14Days = new Date();
      in14Days.setDate(today.getDate() + 14);
      $scope.minDate = today.toISOString().split('T')[0];
      $scope.maxDate = in14Days.toISOString().split('T')[0];
      //#TODO Use min and max

      $scope.weatherResult = null;
      $scope.filteredForecast = [];
      $scope.loading = false;

      $scope.submit = function() {
        $scope.loading = true;
        const opts = { city: $scope.city, startDate: $scope.startDate, endDate: $scope.endDate };

        weatherApiService.getWeather(opts)
          .then(result => {
            $scope.weatherResult = { location: result.location, current: result.current };
            $scope.filteredForecast = result.forecast;
            $scope.requestedDays = result.requestedDays;

            mapService.geocodeCity($scope.city, function([lat, lon]) {
                mapService.renderMap(lat, lon, $scope.city, 'map');
            });
          })
          .catch(err => {
            alert('Error: ' + (err.data?.error?.message || err));
          })
          .finally(() => {
            $scope.loading = false;
          });
      };
    }
  ]);