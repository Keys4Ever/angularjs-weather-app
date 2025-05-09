angular.module('weatherApp')
.controller('registerController', function($scope, AuthService, $location, utilsService) { 
    if(AuthService.getToken()) {
        AuthService.isTokenValid().then(() => {
            $location.path('/home');
        }).catch(() => {
            AuthService.removeToken();
        });
    }
  

  
    $scope.credentials = { username: '', password: '', confirm_password: '' };
    $scope.error = null;
    
    

    $scope.register = function() {
      console.log('register', $scope.credentials);
      if(!utilsService.validatePassword($scope.credentials.password)) {
          console.log('invalid password') ;  
          $scope.error = 'La contraseña no es válida';
          return;
      }
      if($scope.credentials.password !== $scope.credentials.confirm_password) {
          console.log('passwords do not match');
          $scope.error = 'Las contraseñas no coinciden';
          return;
      }
    
        AuthService.register($scope.credentials).then(() => {
          $location.path('/home');
        }).catch(error => {
          $scope.error = error;
        });
    };
})
