angular.module('weatherApp')
.controller('compareController', function($scope, $http) {
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