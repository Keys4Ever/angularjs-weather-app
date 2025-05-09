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
        let regexNumeros = /[0-9]/; // algun numero
        let regexCaracteres = /\W/; // caracteres no alfanumericos
        let regexLongitud = /.{8,}/; // long de 8

        if (!regexLongitud.test(password)) {
            console.log('longitud no válida');
            return false;
        }
        if (!regexMinusculas.test(password)) {
            console.log('minusculas no válidas');
            return false;
        }
        if (!regexMayusculas.test(password)) {
            console.log('mayusculas no válidas');
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


        // acá verifico que haya al menos 2 mayúsculas separadas por al menos un carácter
        let indices = [];
        for (let i = 0; i < password.length; i++) {
            if (/[A-Z]/.test(password[i])) {
                indices.push(i);
            }
        }

        for (let i = 0; i < indices.length - 1; i++) {
            if (indices[i + 1] - indices[i] > 1) {
                console.log('mayusculas separadas');
                return true;
            }
        }


        return false;
    };
    
});