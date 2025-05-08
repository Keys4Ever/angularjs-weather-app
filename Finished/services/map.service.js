angular.module('weatherApp').service('mapService', function() {
    this.geocodeCity = function(cityName, callback) {
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
    };

    this.renderMap = function(lat, lon, cityName) {
        const map = L.map('map').setView([lat, lon], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lon]).addTo(map)
            .bindPopup(cityName)
            .openPopup();
    };
    
});
