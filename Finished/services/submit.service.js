angular.module('weatherApp').service('submitService', ['$location', 'cityService', function($location, cityService) {
    this.handleSubmit = function(scope, today) {
        const s = new Date(scope.startDate);
        const e = new Date(scope.endDate);
  
        if ((e - s) / 86400000 > 14) {
            alert("Máximo 14 días de pronóstico");
            return;
        }
  
        cityService.city = scope.city;
        cityService.startDate = scope.startDate;
        cityService.endDate = scope.endDate;
  
        const diff = Math.floor((e - today) / 86400000) + 1;
        $location.path('/forecast/' + diff);
    };
  }]);