angular.module('weatherApp')
.directive('cityInput', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/cityInput.html',
    replace: true,
    scope: {
      cityModel: '=',
      label: '@',
      required: '=?'
    },
    link: function(scope, element, attrs) {
      if (scope.required === undefined) {
        scope.required = true;
      }
      
      scope.$watch('cityModel', function(newVal) {
        console.log('cityInput directive city value:', newVal);
      });
    }
  };
});