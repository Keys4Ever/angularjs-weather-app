angular.module('weatherApp')
  .service('weatherApiService', function($http, $q, utilsService) {
    const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';
    const API_KEY = 'ed62753dd94d4e0fba7205631252804';
    const MAX_DAYS = 14;

    this.getWeather = function(options) {
      const target = options.endDate || options.startDate;
      let daysToRequest = utilsService.calculateDaysDiff(target);
      daysToRequest = Math.min(daysToRequest, MAX_DAYS);

      return $http.get(BASE_URL, {
        params: {
          key: API_KEY,
          q: options.city, // q = ciudad a buscar
          days: daysToRequest
        }
      }).then(res => {
        const data = res.data;
        const startStr = utilsService.formatDateToString(options.startDate);
        const endStr   = utilsService.formatDateToString(options.endDate || options.startDate);
        console.log('Filtered dates:', startStr, endStr);
        const filtered = data.forecast.forecastday.filter(forecast => (
          forecast.date >= startStr && forecast.date <= endStr
        ));
        console.log('Filtered forecast:', filtered);
        return {
          location: data.location,
          current: data.current,
          forecast: filtered,
          requestedDays: daysToRequest
        };
      });
    };

    this.getMultiple = function(cities, options) {
      const tasks = cities.map(city =>
        this.getWeather(Object.assign({}, options, { city }))
      );
      console.log('cities:', cities, 'options:', options);
      return $q.all(tasks);
    };

    this.getBatch = function(batch) {
      const tasks = batch.map(opts => this.getWeather(opts));
      return $q.all(tasks);
    };
  });