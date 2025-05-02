angular.module('weatherApp').directive('forecastInput', function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/forecastInput.html',
      replace: true,
      scope: {
        city1     : '=city1',
        city2     : '=city2',
        startDate : '=startDate',
        endDate   : '=endDate',
        minDate   : '@minDate',
        maxDate   : '@maxDate',
        isCompare : '=isCompare',
        submit    : '&'
      },
    };
  });
  