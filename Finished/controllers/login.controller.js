angular.module('weatherApp')
.controller('loginController', function($scope, AuthService, $location) {
    $scope.credentials = { username: '', password: '' };
    $scope.error = null;

    $scope.login = function() {
        AuthService.login($scope.credentials).then(() => {
            $location.path('/home');
        }).catch(error => {
            $scope.error = error;
        });
    };
});