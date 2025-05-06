angular.module('weatherApp')
.directive('twoDatesInput', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/twoDatesInput.html',
    replace: true,
    scope: {
      city: '=',
      startDate: '=',
      endDate: '=',
      onSubmit: '&'
    }
  };
});
