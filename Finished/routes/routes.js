angular.module('weatherApp')
.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/login.html',
            controller: 'loginController'
        })
        .when('/register',{
            templateUrl: 'pages/register.html',
            controller: 'registerController'
        })
        .when('/home', {
            templateUrl: 'pages/home.html',
            controller: 'homeController',
            requiresAuth: true
          })
          .when('/forecast/:days', {
            templateUrl: 'pages/forecast.html',
            controller: 'forecastController',
            requiresAuth: true
          })
          .when('/compare', {
            templateUrl: 'pages/compare.html',
            controller: 'compareController',
            requiresAuth: true,
          })
          .otherwise({
            redirectTo: '/'
          });
        });
        
  