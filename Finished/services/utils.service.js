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

    this.validatePassword = function(password) {
        let regexMinusculas = /(?:.*[a-z]){2,}/; // al menos 2 minusculas
        let regexMayusculas = /(?:.*[A-Z]){2,}/; // al menos 2 mayusculas
        let regexMayusculasConsecutivas = /[A-Z]{2}/
        let regexNumeros = /[0-9]/; // algun numero
        let regexCaracteres = /\W/; // caracteres no alfanumericos
        let regexLongitud = /.{8,}/; // long de 8
        let isValid = true;
        if (!regexLongitud.test(password)) {
            console.log('longitud no válida');
            isValid
        }
        if (!regexMinusculas.test(password)) {
            console.log('minusculas no válidas');
            return false;
        }
        if (!regexMayusculas.test(password)) {
            console.log('mayusculas no válidas');
            return false;
        }

        if (regexMayusculasConsecutivas.test(password)){
            return false;
        }

        if (!regexNumeros.test(password)) {
            console.log('numeros no válidos');
            return false;
        }
        if (!regexCaracteres.test(password)) {
            console.log('caracteres no válidos');
            return false;
        }


      
        if(!isValid){

        }

        return false;
    };
    
});