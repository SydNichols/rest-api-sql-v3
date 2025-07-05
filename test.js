const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'fsjstd-restapi.db',
    logging: console.log
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection Established');
    } catch (error) {
        console.log('unable to connect', error);
    }
}

testConnection()