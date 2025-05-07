angular.module('weatherApp')
.controller('logoutController', function($scope, AuthService) { 
    $scope.logout = function() {
        console.log('Logged out successfully');
        AuthService.logout();
    }

    $scope.logout();

})
