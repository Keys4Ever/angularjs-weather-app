angular.module('weatherApp')
.service('cityService', function() {
    this.city = "New York, NY";
    
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    this.endDate = endDate.toISOString().split('T')[0];
    
    console.log('cityService initialized with dates:', this.startDate, this.endDate);
});