angular.module('weatherApp').service('submitService', ['$location', 'cityService', function($location, cityService) {
    this.handleSubmit = function(scope, today) {
        if(!scope.endDate) {
            scope.endDate = scope.startDate;
            scope.startDate = today; // <-- estoy seguro que hay que settearla a hoy? o debería settearla a == end date para que devuelva un solo día?
        }

        const start = new Date(scope.startDate);
        const end = new Date(scope.endDate);
        
        console.log("Start date: " + start);
        console.log("End date: " + end);

        if ((end - start) / 86400000 > 14) {
            alert("Máximo 14 días de pronóstico");
            return;
        }
  
        cityService.city = scope.city;
        cityService.startDate = scope.startDate;
        cityService.endDate = scope.endDate;
  
        const diff = Math.floor((end - today) / 86400000) + 1;
        $location.path('/forecast/' + diff);
    };
  }]);