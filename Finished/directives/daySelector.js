
angular.module('weatherApp').directive('daySelector', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/daySelector.html',
        replace: true,
        scope: {
            startDate: '=',
            endDate: '=',
            minDate: '=',
            maxDate: '='
        }
    };
});
