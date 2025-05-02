angular.module('weatherApp').directive('weatherPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/weatherPanel.html',
        replace: true,
        scope: { weatherData: '=' }
    };
});