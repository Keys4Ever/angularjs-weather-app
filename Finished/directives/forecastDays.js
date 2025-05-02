angular.module('weatherApp').directive('forecastDays', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/forecastDays.html',
        replace: true,
        scope: { forecastData: '=' }
    };
});