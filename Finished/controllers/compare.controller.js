angular.module('weatherApp')
  .controller('compareController', function($scope, AuthService, weatherApiService, mapService) {
    if (!AuthService.getToken()) return;

    $scope.isCompare = true;
    $scope.city1 = '';
    $scope.city2 = '';
    $scope.startDate = new Date();
    $scope.endDate = '';
    $scope.comparisonResults = [];
    $scope.loading = false;

    $scope.submit = function() {
      $scope.comparisonResults = [];
      $scope.loading = true; // TODO: show loading spinner
      const cities = [$scope.city1, $scope.city2];
      const options = { startDate: $scope.startDate, endDate: $scope.endDate };

      weatherApiService.getMultiple(cities, options)
        .then(results => {
          console.log('Resultados de la API:', results);
          const [res1, res2] = results;
          const days1 = res1.forecast;
          const days2 = res2.forecast;
          const dates = days1.map(f => f.date);
          $scope.comparisonResults = dates.map(date => {
            const f1 = days1.find(f => f.date === date);
            const f2 = days2.find(f => f.date === date);
            return {
              date,
              hotter: {
                city: f1.day.avgtemp_c > f2.day.avgtemp_c ? $scope.city1 : $scope.city2,
                temperature: Math.max(f1.day.avgtemp_c, f2.day.avgtemp_c) + '°C'
              },
              colder: {
                city: f1.day.avgtemp_c < f2.day.avgtemp_c ? $scope.city1 : $scope.city2,
                temperature: Math.min(f1.day.avgtemp_c, f2.day.avgtemp_c) + '°C'
              },
              humidity: {
                [$scope.city1]: f1.day.avghumidity + '%',
                [$scope.city2]: f2.day.avghumidity + '%'
              },
              lastUpdated: {
                [$scope.city1]: res1.current.last_updated,
                [$scope.city2]: res2.current.last_updated
              },
              cards: {
                [$scope.city1]: {
                  name: $scope.city1,
                  temp: f1.day.avgtemp_c,
                  condition: f1.day.condition.text,
                  icon: f1.day.condition.icon,
                  humidity: f1.day.avghumidity,
                  forecastDate: f1.date,
                  tz: res1.location.tz_id
                },
                [$scope.city2]: {
                  name: $scope.city2,
                  temp: f2.day.avgtemp_c,
                  condition: f2.day.condition.text,
                  icon: f2.day.condition.icon,
                  humidity: f2.day.avghumidity,
                  forecastDate: f2.date,
                  tz: res2.location.tz_id
                }
              }
            };
          });
        })
        .catch(err => {
          console.error('Error en la API:', err);
          alert('No se pudo obtener el pronóstico para una o ambas ciudades.');
        })
        .finally(() => { $scope.loading = false; });

        Promise.all([
          new Promise(resolve => mapService.geocodeCity($scope.city1, resolve)),
          new Promise(resolve => mapService.geocodeCity($scope.city2, resolve))
        ]).then(([coord1, coord2]) => {
          if (coord1 && coord2) {
            mapService.renderMapWithTwoPoints(coord1, coord2, $scope.city1, $scope.city2);
          } else {
            console.warn('Una o ambas coordenadas son inválidas para el mapa.');
          }
        });
    };
  });
