angular.module('weatherApp').run(['$rootScope', '$location', 'AuthService', '$injector', 
  function($rootScope, $location, AuthService, $injector) {
  
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    console.log('Route change start:', next);
    
    if (next.requiresAuth) {
      const token = AuthService.getToken();
      
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        event.preventDefault();
        $location.path('/');
        return;
      }
      
      const targetUrl = $location.url();
      event.preventDefault();
      
      AuthService.isTokenValid().then(
        function(isValid) {
          console.log('Token validation successful');
          $location.url(targetUrl);
        },
        function(error) {
          console.error('Token validation failed:', error);
          AuthService.removeToken();
          $location.path('/');
        }
      );
    }
  });
}]);

angular.module('weatherApp')
.config(function($httpProvider) {
  $httpProvider.interceptors.push(['$q', 'AuthService', '$injector', function($q, AuthService, $injector) {
    return {
      request: function(config) {
        const token = AuthService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      
      responseError: function(rejection) {
        if (rejection.status === 401 && 
            !rejection.config.url.includes('/validateToken') && 
            !rejection.config.url.includes('/refresh')) {
          
          return AuthService.refreshToken()
            .then(function(newToken) {
              rejection.config.headers.Authorization = `Bearer ${newToken}`;
              return $injector.get('$http')(rejection.config);
            })
            .catch(function(error) {
              console.error('No se pudo refrescar el token:', error);
              AuthService.logout();
              return $q.reject(rejection);
            });
        }
        
        return $q.reject(rejection);
      }
    };
  }]);
});
