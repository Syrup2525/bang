const mysql = require('mysql2/promise')
const { mariaDBConfig } = require('../config.json')

require('dotenv').config()

const pool = mysql.createPool({
    user: mariaDBConfig.user,
    password: mariaDBConfig.password,
    database: mariaDBConfig.database,
    connectionLimit: mariaDBConfig.connectionLimit,
    host: `${process.env.DB_SERVER_HOST}`,
})

module.exports = pool