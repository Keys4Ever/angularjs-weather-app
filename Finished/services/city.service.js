angular.module('weatherApp')
.service('cityService', function() {
    this.city = '';
    
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    
    const endDate = '' // se inicializa en un string vacío para que pueda ser nulleable xd
});