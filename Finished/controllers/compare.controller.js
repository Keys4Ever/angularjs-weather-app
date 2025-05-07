angular.module('weatherApp')
.controller('compareController', function($scope, $http, $timeout) {
    $scope.isCompare = true;
    $scope.city1 = '';
    $scope.city2 = '';
    $scope.startDate = new Date();
    $scope.endDate = '';
    $scope.comparisonCity1 = '';
    $scope.comparisonCity2 = '';
    $scope.comparisonResult = null;

    const API_KEY = 'ed62753dd94d4e0fba7205631252804';

    function calculateDaysDiff(dateStr) {
        const today = new Date();
        const targetDate = new Date(dateStr);
        const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(Math.max(diff, 1), 14);
    }

    $scope.submit = function() {
        $scope.comparisonResult = null;
        $scope.comparisonCity1 = $scope.city1;
        $scope.comparisonCity2 = $scope.city2;

        const startDateObj = new Date($scope.startDate);
        const endDateObj = new Date($scope.endDate);

        const dayToFilter1 = startDateObj.toISOString().split("T")[0];
        const dayToFilter2 = startDateObj.toISOString().split("T")[0];

        let days1 = calculateDaysDiff($scope.startDate);
        let days2 = calculateDaysDiff($scope.endDate);

        days2 = days1;

        function getWeather(city, days) {
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=${days}`;
            return $http.get(url).then(res => res.data);
        }

        Promise.all([
            getWeather($scope.comparisonCity1, days1),
            getWeather($scope.comparisonCity2, days2)
        ])
        .then(([data1, data2]) => {
            const forecast1 = data1.forecast.forecastday.find(day => day.date === dayToFilter1);
            const forecast2 = data2.forecast.forecastday.find(day => day.date === dayToFilter1);

            if (!forecast1 || !forecast2) {
                alert('No se encontró el pronóstico para una de las fechas seleccionadas.');
                return;
            }

            const result = {
                hotter: {
                    city: forecast1.day.avgtemp_c > forecast2.day.avgtemp_c ? $scope.comparisonCity1 : $scope.comparisonCity2,
                    temperature: Math.max(forecast1.day.avgtemp_c, forecast2.day.avgtemp_c) + '°C'
                },
                colder: {
                    city: forecast1.day.avgtemp_c < forecast2.day.avgtemp_c ? $scope.comparisonCity1 : $scope.comparisonCity2,
                    temperature: Math.min(forecast1.day.avgtemp_c, forecast2.day.avgtemp_c) + '°C'
                },
                timeZoneDifference: Math.abs(data1.current.last_updated.split(' ')[1].split(':')[0] - data2.current.last_updated.split(' ')[1].split(':')[0]),
                humidity: {
                    [$scope.comparisonCity1]: forecast1.day.avghumidity + '%',
                    [$scope.comparisonCity2]: forecast2.day.avghumidity + '%'
                },
                lastUpdated: {
                    [$scope.comparisonCity1]: data1.current.last_updated,
                    [$scope.comparisonCity2]: data2.current.last_updated
                },
                cards: {
                    [$scope.comparisonCity1]: {
                        name: $scope.comparisonCity1,
                        temp: forecast1.day.avgtemp_c,
                        condition: forecast1.day.condition.text,
                        icon: forecast1.day.condition.icon,
                        humidity: forecast1.day.avghumidity,
                        forecastDate: forecast1.date,
                        tz: data1.location.tz_id
                    },
                    [$scope.comparisonCity2]: {
                        name: $scope.comparisonCity2,
                        temp: forecast2.day.avgtemp_c,
                        condition: forecast2.day.condition.text,
                        icon: forecast2.day.condition.icon,
                        humidity: forecast2.day.avghumidity,
                        forecastDate: forecast2.date,
                        tz: data2.location.tz_id
                    }
                }
            };

            $timeout(() => {
                $scope.comparisonResult = result;
            });
        })
        .catch(err => {
            console.error('Error en la API:', err);
            alert('No se pudo obtener el pronóstico para una o ambas ciudades.');
        });
    };
});
