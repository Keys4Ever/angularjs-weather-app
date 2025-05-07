angular.module('weatherApp')
.controller('registerController', function($scope, AuthService, $location) { 
    if(AuthService.getToken()) {
        AuthService.isTokenValid().then(() => {
            $location.path('/home');
        }).catch(() => {
            AuthService.removeToken();
        });
    }
  
  
    $scope.credentials = { username: '', password: '' };
    $scope.error = null;
    $scope.register = function() {
      AuthService.register($scope.credentials).then(() => {
        $location.path('/home');
      }).catch(error => {
        $scope.error = error;
      });
    };
})
