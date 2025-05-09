angular.module('weatherApp')
.directive('dateInput', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/dateInput.html',
    replace: true,
    scope: {
      dateModel: '=',
      label: '@',
      required: '=?',
      isCompare: '=?',
    },
    link: function(scope, element, attrs) {
      scope.$watch('dateModel', function(newVal) {
        if (newVal) {
          console.log('dateInput directive date value:', newVal, typeof newVal);
        }
      });
    }
  };
});