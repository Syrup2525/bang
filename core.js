const logger = require('./logger.js')

require('dotenv').config()

const LOAD_COMPLETE = "load_complete"

const serverStart = async () => {
    const cluster = require('cluster')
    const numCPUs = require('os').cpus().length

    if (cluster.isMaster) {
        // cluster fork
        if (process.env.CLUSTER_MODE === "SINGLE") {
            cluster.fork()
        } else {
            for (let i = 0; i < numCPUs; i += 1) {
                cluster.fork()
            }
        }

        global.workerCount = Object.keys(cluster.workers).length
        global.loadCompleteCount = 0

        cluster.on('message', (worker, message) => {
            if (message.cmd !== LOAD_COMPLETE) {
                return
            }

            global.loadCompleteCount += 1

            if (global.loadCompleteCount === global.workerCount) {
                logger.info(`┌─────────────────────────────────────────────┐`)
                logger.info(`│                Load Complete                │`)
                logger.info(`└─────────────────────────────────────────────┘`)
            }
        })

        // 워카가 실행되었을 때
        cluster.on('online', (worker) => {
            logger.info(`${worker.process.pid}번 워커 실행`)
        })

        // 워커가 종료되었을 떄
        cluster.on('exit', (worker, code, signal) => {
            logger.info(`${worker.process.pid}번 워커가 종료되었습니다.`)

            cluster.fork()
        })
    } else {
        await subThread()
    }
}

const subThread = async () => {
    const app = require('./app.js')()

    const PORT = process.env.SERVER_PORT
    const BASE_URL = process.env.BASE_URL

    app.listen(PORT, () => {
        logger.info(`[Express] server is running. port: ${PORT}${BASE_URL}`)

        process.send({ cmd: LOAD_COMPLETE })
    })
}

exports.serverStart = serverStart