var weatherApp = angular.module('weatherApp', ['ngRoute', 'ngResource']);
// Ya sé debería separar esto, mañana lo refactorizo completo jaja
// ================= SERVICES =================

weatherApp.service('AuthService', function($window, $q, $location, $injector) {
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
  
  weatherApp.service('cityService', function() {
      this.city = "New York, NY";
      
      const today = new Date();
      this.startDate = today.toISOString().split('T')[0];
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);
      this.endDate = endDate.toISOString().split('T')[0];
      
      console.log('cityService initialized with dates:', this.startDate, this.endDate);
  });
  
  weatherApp.service('submitService', ['$location', 'cityService', function($location, cityService) {
    this.handleSubmit = function(scope, today) {
        const s = new Date(scope.startDate);
        const e = new Date(scope.endDate);
  
        if ((e - s) / 86400000 > 14) {
            alert("Máximo 14 días de pronóstico");
            return;
        }
  
        cityService.city = scope.city;
        cityService.startDate = scope.startDate;
        cityService.endDate = scope.endDate;
  
        const diff = Math.floor((e - today) / 86400000) + 1;
        $location.path('/forecast/' + diff);
    };
  }]);
// ================= ROUTES =================
weatherApp.config(function($routeProvider) {
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
      
      
      
      // ================= CONFIG =================
      
    weatherApp.run(['$rootScope', '$location', 'AuthService', '$injector', 
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

weatherApp.config(function($httpProvider) {
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


// ================= CONTROLLERS =================
weatherApp.controller('homeController', [
    '$scope', 'cityService', '$location', '$http', 'submitService', 'AuthService',
    function($scope, cityService, $location, $http, submitService, AuthService) {

      if (!AuthService.getToken()) {
        $location.path('/');
        return;
      }

      $scope.logout = function() {
          AuthService.logout();
      };

      // Inicializar desde el servicio
      $scope.city      = cityService.city;
      $scope.startDate = cityService.startDate;
      $scope.endDate   = cityService.endDate;
  
      // Configurar rango de fechas (hoy → hoy+14), el limite de la api son 14 dias
      const today = new Date();
      const in14D = new Date(); in14D.setDate(today.getDate() + 14);
      $scope.minDate = today.toISOString().slice(0,10);
      $scope.maxDate = in14D.toISOString().slice(0,10);
  
      // geolocalización uwu
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const url = 
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  
            $http.get(url).then(function(res) {
              const addr = res.data.address;
              const localidad = addr.city || addr.town || addr.village || addr.county;
              if (localidad) {
                cityService.city = $scope.city = localidad + 
                  (addr.state ? `, ${addr.state}` : '');
              }
            }, function(err) {
              console.warn('No pudo:', err);
            });
          },
          function(err) {
            console.warn('Usuario denegó geolocalización o hubo error:', err);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000
          }
        );
      }
  
      // Validar rango startDate ≤ endDate
      $scope.$watchGroup(['startDate', 'endDate'], function([s,e]) {
        if (new Date(s) > new Date(e)) {
          $scope.endDate = s;
        }
      });
  
      // Enviar formulario
      $scope.submit = function() {
          const today = new Date();
          submitService.handleSubmit($scope, today);
      };
    }
  ]);
  

weatherApp.controller('forecastController', ['$scope', 'cityService', '$resource', '$routeParams', '$location', 'submitService', 'AuthService', 
    function($scope, cityService, $resource, $routeParams, $location, submitService, AuthService) {
        if (!AuthService.getToken()) {
          $location.path('/');
          return;
        }

        $scope.logout = function() {
            AuthService.logout();
        };
      
        $scope.city = cityService.city;
        $scope.startDate = cityService.startDate;
        $scope.endDate = cityService.endDate;
        
        console.log('Initial startDate:', $scope.startDate);
        console.log('Initial endDate:', $scope.endDate);
        
        $scope.days = $routeParams.days;

        if (!$scope.city || !$scope.startDate || !$scope.endDate) {
            $location.path('/');
            return;
        }

        // Configurar fechas mínima/máxima (hoy + 14 días)
        const today = new Date();
        const in14Days = new Date();
        in14Days.setDate(today.getDate() + 14);
        
        $scope.minDate = today.toISOString().split('T')[0];
        $scope.maxDate = in14Days.toISOString().split('T')[0];

        // sanity check
        $scope.$watchGroup(['startDate', 'endDate'], function(newDates) {
            if (new Date(newDates[0]) > new Date(newDates[1])) {
                $scope.endDate = newDates[0];
            }
        });

        // Función para enviar formulario
        $scope.submit = function() {
          const today = new Date();
          submitService.handleSubmit($scope, today);
      };

        $scope.weatherResult = null;
        $scope.filteredForecast = [];
        $scope.loading = true;

        var weatherAPI = $resource("https://api.weatherapi.com/v1/forecast.json", {
            key: 'ed62753dd94d4e0fba7205631252804',
            q: '@city',
            days: '@days'
        });

        // Función para formatear fecha
        function formatDateToString(dateValue) {
            // Si ya es string en formato YYYY-MM-DD, devolverlo directamente
            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
            }
            
            // Convertir a objeto Date y luego a string
            try {
                const dateObj = new Date(dateValue);
                if (isNaN(dateObj.getTime())) {
                    throw new Error('Invalid date');
                }
                return dateObj.toISOString().split('T')[0];
            } catch (e) {
                console.error('Error formatting date:', e, dateValue);
                return null;
            }
        }

        // Función para cargar los datos del clima
        $scope.loadWeatherData = function() {
            $scope.loading = true;
            
            const startDateStr = formatDateToString($scope.startDate);
            const endDateStr = formatDateToString($scope.endDate);
            
 
            
            weatherAPI.get(
                { q: $scope.city, days: Number($scope.days) + 2 },
                function(data) {
                    $scope.weatherResult = data;
                    
                    $scope.filteredForecast = data.forecast.forecastday.filter(day => {
                        const result = day.date >= startDateStr && day.date <= endDateStr;
                        return result;
                    });
                    
                    $scope.loading = false;
                },
                function(error) {
                    console.error('API error:', error);
                    alert("Error: " + (error.data?.error?.message || "No se pudo obtener el pronóstico"));
                    $scope.loading = false;
                }
            );
        };

        $scope.loadWeatherData();

        function geocodeCity(cityName, callback) {
            const url = 
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;
            fetch(url)
              .then(res => res.json())
              .then(results => {
                if (results.length) {
                  const { lat, lon } = results[0];
                  callback([ parseFloat(lat), parseFloat(lon) ]);
                } else {
                  console.warn('No se encontró la ciudad');
                }
              })
              .catch(err => console.error('Error en geocoding:', err));
          }
          
          geocodeCity($scope.city, function([lat, lon]) {
            const map = L.map('map').setView([lat, lon], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: 
                '© OpenStreetMap contributors'
            }).addTo(map);
          
            L.marker([lat, lon]).addTo(map)
              .bindPopup($scope.city)
              .openPopup();
          });
    }
]);

weatherApp.controller('loginController', function($scope, AuthService, $location) {
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
  
  weatherApp.controller('registerController', function($scope, AuthService, $location) { 
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

weatherApp.controller('compareController', function($scope, $http) {
  $scope.isCompare = true;
  $scope.city1 = '';
  $scope.city2 = '';
  $scope.startDate = new Date(); // Ciudad 1
  $scope.endDate = '';   // Ciudad 2
  $scope.comparisonResult = null;

  const API_KEY = 'ed62753dd94d4e0fba7205631252804';

  function calculateDaysDiff(dateStr) {
    console.log('Calculando días para:', dateStr);
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diff, 1), 14); // entre 1 y 14
  }

  $scope.submit = function() {
    console.log('Iniciando submit...');
    console.log('Valores iniciales:');
    console.log('city1: ', $scope.city1);
    console.log('city2: ', $scope.city2);
    console.log('startDate:', $scope.startDate);
    console.log('endDate:', $scope.endDate);

    // if (!$scope.startDate || !$scope.endDate) {
    //   console.log('Faltan fechas:', {
    //     startDate: $scope.startDate,
    //     endDate: $scope.endDate,
    //   });
    //   alert('Por favor, selecciona ambas fechas.');
    //   return;
    // }

    const startDateObj = new Date($scope.startDate);
    const endDateObj = new Date($scope.endDate);

    console.log('startDate convertido:', startDateObj);
    console.log('endDate convertido:', endDateObj);

    // if (isNaN(startDateObj) || isNaN(endDateObj)) {
    //   console.log('Error: Fechas no válidas', {
    //     startDate: startDateObj,
    //     endDate: endDateObj,
    //   });
    //   alert('Las fechas ingresadas no son válidas.');
    //   return;
    // }

    const dayToFilter1 = startDateObj.toISOString().split("T")[0];
    const dayToFilter2 = startDateObj.toISOString().split("T")[0];

    console.log('dayToFilter1:', dayToFilter1);
    console.log('dayToFilter2:', dayToFilter2);

    let days1 = calculateDaysDiff($scope.startDate);
    let days2 = calculateDaysDiff($scope.endDate);

    console.log('Días calculados:');
    console.log('Days1:', days1);
    console.log('Days2:', days2);

    days2 = days1;

    function getWeather(city, days) {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=${days}`;
      console.log('Fetching weather for:', city, 'with URL:', url);
      return $http.get(url).then(res => res.data);
    }

    Promise.all([
      getWeather($scope.city1, days1),
      getWeather($scope.city2, days2)
    ])
    .then(([data1, data2]) => {
      console.log('Respuesta obtenida:');
      console.log('Ciudad 1:', data1);
      console.log('Ciudad 2:', data2);

      const forecast1 = data1.forecast.forecastday.find(day => day.date === dayToFilter1);
      const forecast2 = data2.forecast.forecastday.find(day => day.date === dayToFilter1);

      console.log('Pronóstico encontrado para ciudad 1:', forecast1);
      console.log('Pronóstico encontrado para ciudad 2:', forecast2);

      if (!forecast1 || !forecast2) {
        alert('No se encontró el pronóstico para una de las fechas seleccionadas.');
        return;
      }


      const result = {
          hotter: {
            city: forecast1.day.avgtemp_c > forecast2.day.avgtemp_c ? $scope.city1 : $scope.city2,
            temperature: Math.max(forecast1.day.avgtemp_c, forecast2.day.avgtemp_c) + '°C'
          },
          colder: {
            city: forecast1.day.avgtemp_c < forecast2.day.avgtemp_c ? $scope.city1 : $scope.city2,
            temperature: Math.min(forecast1.day.avgtemp_c, forecast2.day.avgtemp_c) + '°C'
          },
          timeZoneDifference: Math.abs(data1.current.last_updated.split(' ')[1].split(':')[0] - data2.current.last_updated.split(' ')[1].split(':')[0] )
          ,
          humidity: {
            [$scope.city1]: forecast1.day.avghumidity + '%',
            [$scope.city2]: forecast2.day.avghumidity + '%'
          },
        lastUpdated: {
          [$scope.city1]: data1.current.last_updated,
          [$scope.city2]: data2.current.last_updated
        },
        cards: {
          [$scope.city1]: {
            name: $scope.city1,
            temp: forecast1.day.avgtemp_c,
            condition: forecast1.day.condition.text,
            icon: forecast1.day.condition.icon,
            humidity: forecast1.day.avghumidity,
            forecastDate: forecast1.date,
            tz: data1.location.tz_id
          },
          [$scope.city2]: {
            name: $scope.city2,
            temp: forecast2.day.avgtemp_c,
            condition: forecast2.day.condition.text,
            icon: forecast2.day.condition.icon,
            humidity: forecast2.day.avghumidity,
            forecastDate: forecast2.date,
            tz: data2.location.tz_id
          }
        }
        
      };

      console.log('Resultado de comparación:', result);
      $scope.comparisonResult = result;
    })
    .catch(err => {
      console.error('Error en la API:', err);
      alert('No se pudo obtener el pronóstico para una o ambas ciudades.');
    });
  };

  $scope.$watch('startDate', function(newVal) {
    console.log('startDate actualizado:', newVal);
  });

  $scope.$watch('endDate', function(newVal) {
    console.log('endDate actualizado:', newVal);
  });
});




// ================= DIRECTIVAS =================
weatherApp.directive('customForm', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'directives/customForm.html',
    replace: true,
    scope: {
      title: '@',
      onSubmit: '&',
      error: '=',
      url: '@?',
      label: '@?',
    },
  };
});
weatherApp.directive('weatherPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/weatherPanel.html',
        replace: true,
        scope: { weatherData: '=' }
    };
});

weatherApp.directive('currentWeather', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/currentWeather.html',
        replace: true,
        scope: { weatherData: '=' }
    };
});

weatherApp.directive('forecastDays', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/forecastDays.html',
        replace: true,
        scope: { forecastData: '=' }
    };
});

weatherApp.directive('daySelector', function() {
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

weatherApp.directive('forecastInput', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/forecastInput.html',
    replace: true,
    scope: {
      city1     : '=city1',
      city2     : '=city2',
      startDate : '=startDate',
      endDate   : '=endDate',
      minDate   : '@minDate',
      maxDate   : '@maxDate',
      isCompare : '=isCompare',
      submit    : '&'
    },
  };
});

