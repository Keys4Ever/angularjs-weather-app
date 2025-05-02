angular.module('weatherApp').directive('currentWeather', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/currentWeather.html',
        replace: true,
        scope: { weatherData: '=' }
    };
});
