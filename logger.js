const path = require('path')

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize, splat } = format

const winstonDaily = require('winston-daily-rotate-file')

require('dotenv').config()

const logDir = path.join(__dirname, 'logs')

const myCustomLevels = {
    levels: {
        error: 0,
        info: 1,
        debug: 2,
        db: 4,
        http: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        db: 'white',
        http: 'gray',
    }
};

const myFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level} ${process.pid}: ${message}`
});

const logger = createLogger({
    levels: myCustomLevels.levels,
    format: combine(
        colorize({colors: myCustomLevels.colors}),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        splat(),
        myFormat
    ),
    transports: [
        new winstonDaily({
            level: process.env.LOG_LEVEL, // 최하위 레벨에선
            datePattern: 'YYYY-MM-DD', // 파일 날짜 형식
            dirname: logDir, // 파일 경로
            filename: `%DATE%.log`, // 파일 이름
            maxFiles: 30, // 최근 30일치 로그 파일을 남김
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'info', // info 레벨에선
            datePattern: 'YYYY-MM-DD', // 파일 날짜 형식
            dirname: logDir + '/info', // 파일 경로
            filename: `%DATE%.log`, // 파일 이름
            maxFiles: 30, // 최근 30일치 로그 파일을 남김
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'error', // error 레벨에선
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error', // /logs/error 하위에 저장
            filename: `%DATE%.error.log`, // 에러 로그는 2020-05-28.error.log 형식으로 저장
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
})

if (process.env.BUILD_MODE !== 'RELEASE') {
    logger.add(new transports.Console({
        level: process.env.LOG_LEVEL
    }))
}

module.exports = logger