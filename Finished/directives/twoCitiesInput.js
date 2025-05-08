angular.module('weatherApp')
.directive('twoCitiesInput', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/twoCitiesInput.html',
    replace: true,
    scope: {
      city1: '=',
      city2: '=',
      startDate: '=',
      endDate: '=',
      onSubmit: '&'
    }
  };
});
