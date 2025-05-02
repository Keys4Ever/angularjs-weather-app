angular.module('weatherApp')
.service('AuthService', function($window, $q, $location, $injector) {
    const storageKey = 'accessToken';
    
    var getHttp = function() {
      return $injector.get('$http');
    };
  
    this.getToken = function() {
        return $window.localStorage.getItem(storageKey);
    };
  
    this.setToken = function(token) {
        $window.localStorage.setItem(storageKey, token);
    };
  
    this.isTokenValid = function() {
      const token = this.getToken();
      if (!token) {
        return $q.reject('No token found');
      }
      
      var $http = getHttp();
      return $http.post('http://localhost:3000/api/auth/validateToken', { token: token })
        .then(function(response) {
          if (response.data && response.data.valid) {
            return true;
          } else {
            return this.refreshToken();
          }
        }.bind(this))
        .catch(function(error) {
          console.error('Token validation error:', error);
          return this.refreshToken();
        }.bind(this));
    };
  
    this.removeToken = function() {
        $window.localStorage.removeItem(storageKey);
    };
  
    this.login = function(credentials) {
        var $http = getHttp();
        return $http.post('http://localhost:3000/api/auth/login', credentials).then(response => {
            if (response.data.success) {
                this.setToken(response.data.token);
                return response.data;
            } else {
                return $q.reject(response.data.message);
            }
        });
    };
  
    this.register = function(credentials) {
        var $http = getHttp();
        return $http.post('http://localhost:3000/api/auth/register', credentials).then(response => {
            if (response.data.success) {
              console.log('Registration successful:', response.data);
                this.setToken(response.data.token);
                return response.data;
            } else {
                return $q.reject(response.data.message);
            }
        });
    };
    
    this.refreshToken = function() {
        const token = this.getToken();
        if (!token) return $q.reject('No token available');
  
        var $http = getHttp();
        return $http.post('http://localhost:3000/api/auth/refresh', { token }).then(response => {
            if (response.data.success) {
                this.setToken(response.data.token);
                return response.data.token;
            } else {
                this.removeToken();
                return $q.reject('Failed to refresh token');
              }
            }).catch(err => {
            this.removeToken();
            return $q.reject(err);
        });
      };
  
      this.logout = function() {
        this.removeToken();
        $location.path('/');
      };
    });