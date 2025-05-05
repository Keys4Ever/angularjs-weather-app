angular.module('weatherApp')
.controller('homeController', [
    '$scope', 'cityService', '$location', '$http', 'submitService', 'AuthService',
    function($scope, cityService, $location, $http, submitService, AuthService) {

      if (!AuthService.getToken()) {
        $location.path('/');
        return;
      }

      $scope.logout = function() {
          AuthService.logout();
      };

      // Inicializar desde el servicio
      $scope.city      = cityService.city;
      $scope.startDate = cityService.startDate;
      $scope.endDate   = cityService.endDate;
  
      // Configurar rango de fechas (hoy → hoy+14), el limite de la api son 14 dias
      const today = new Date();
      const in14D = new Date(); in14D.setDate(today.getDate() + 14);
      $scope.minDate = today.toISOString().slice(0,10);
      $scope.maxDate = in14D.toISOString().slice(0,10);
  
      // geolocalización uwu
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const url = 
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
            
              console.log('URL:', url);

            $http.get(url).then(function(res) {
              const addr = res.data.address;
              const localidad = addr.city || addr.town || addr.village || addr.county;
              if (localidad) {
                cityService.city = $scope.city = localidad + 
                  (addr.state ? `, ${addr.state}` : '');
              }
            }, function(err) {
              console.warn('No pudo:', err);
            });
          },
          function(err) {
            console.warn('Usuario denegó geolocalización o hubo error:', err);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000
          }
        );
      }
  
      $scope.$watchGroup(['startDate', 'endDate'], function([s,e]) {
        if (new Date(s) > new Date(e) && e != '') {
          $scope.endDate = s;
        }
      });
  
      $scope.submit = function() {
          const today = new Date();
          submitService.handleSubmit($scope, today);
      };
    }
  ]);