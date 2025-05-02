import sql from 'mssql';

const config = {
    user: 'angular_user',
    password: '2112Asd',
    server: 'localhost',
    database: 'AngularJs',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a la base de datos AngularJs');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos', err);
        throw err;
    });

export default poolPromise;