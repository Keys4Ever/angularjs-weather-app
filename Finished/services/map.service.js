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

    this.renderMapWithTwoPoints = function(coord1, coord2, label1 = 'Punto A', label2 = 'Punto B') {
        const map = L.map('map').setView([
            (coord1[0] + coord2[0]) / 2,
            (coord1[1] + coord2[1]) / 2
        ], 2);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    
        L.marker(coord1).addTo(map).bindPopup(label1).openPopup();
        L.marker(coord2).addTo(map).bindPopup(label2);
    
        L.polyline([coord1, coord2], { color: 'blue' }).addTo(map);
    };
    
});
