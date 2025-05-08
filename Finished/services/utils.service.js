angular.module('weatherApp').service('utilsService', function() {
    this.calculateDaysDiff = function(dateStr) {
        const today = new Date();
        const targetDate = new Date(dateStr);
        const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(Math.max(diff, 1), 14);
    };

    this.formatDateToString = function(dateValue) {
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        
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
});