amgular.module('weatherApp').controller('forecastController', ['$scope', 'cityService', '$resource', '$routeParams', '$location', 'submitService', 'AuthService', 
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