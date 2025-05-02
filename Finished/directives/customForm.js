angular.module('weatherApp').directive('customForm', function() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'directives/customForm.html',
      replace: true,
      scope: {
        title: '@',
        onSubmit: '&',
        error: '=',
        url: '@?',
        label: '@?',
      },
    };
  });