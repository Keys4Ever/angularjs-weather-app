angular.module('weatherApp')
.controller('loginController', function($scope, AuthService, $location) {
    
    if(AuthService.getToken()) {
        AuthService.isTokenValid().then(() => {
            $location.path('/home');
        }).catch(() => {
            AuthService.removeToken();
        });
    }
    
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