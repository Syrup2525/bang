const pool = require('./connection.js')
const _ = require('lodash')
const util = require('../util.js')
const logger = require('../logger.js')

/**
 * 프로시저 호출 함수
 * @param {string} procedureName 프로시저 이름 정의된 상수 사용
 * @param {Array} parameters 프로시저 파라미터
 * @param {boolean} isResponseSingle 결과값 단일/다중 단일일때 true
 * @returns response, error 리턴
 */
const callProcedure = async (procedureName, parameters, isResponseSingle) => {
    const conn = await pool.getConnection()

    try {
        logger.db(`CALL ${procedureName}`)

        let query = `CALL ${procedureName}(`

        if (Array.isArray(parameters)) {
            for (let parameter of parameters) {
                if (parameter === null) {
                    query += `NULL, `;
                } else {
                    switch (typeof parameter) {
                        case 'undefined':
                            query += `NULL, `;
                            break
    
                        case 'string':
                            parameter = parameter.replace(/'/g, "\\'");
                            query += `'${parameter}', `;
                            break
        
                        case 'number':
                            query += `${parameter}, `;
                            break
    
                        case 'boolean':
                            if (parameter) {
                                query += `1, `;
                            } else {
                                query += `0, `;
                            }
                            break
    
                        default:
                            logger.error('객체 형태 저장 개발 필요')
                            break
                    }
                }
            }
        }
    
        query += '@code, @message)';

        logger.db(`[Query] ${query}`)
    
        await conn.beginTransaction()
        // 1. 패키지 호출 (프로시저에 SELECT Query 존재할 경우 결과가 [rows] 에 담긴다. )
        let [rows] = await conn.query(query);
    
        // 2. 패키지에 대한 결과 호출 (프로시저 OUT 변수 추출)
        let [result] = await conn.query('SELECT @code AS code, @message AS message');
        await conn.commit()
        conn.release()

        result = result[0]
    
        const code = result['code']
        const message = result['message']
        let data = null
    
        // rows: 객체 > 결과 헤더
        // rows: 배열 > rows[lastIndex - 1]: 마지막 결과 데이터, rows[lastIndex]: 결과 해더
        if (Array.isArray(rows)) {
            const lastIndex = rows.length - 1

            rows = rows[lastIndex - 1]
            rows = rows.map(standardizationKeyValue)  // key 값을 camel case 로 변환
    
            data = rows
    
            if (isResponseSingle) {
                data = rows[0]
            }
        } 

        logger.db(`[Response] code: ${code}, message: ${message}`)

        if (!util.isBlank(data)) {
            logger.db(`[Response] [Data]\n%s`, util.getLogData(data))
        }
    
        // SELECT 문이 존재하지 않는 프로시저 호출시 결과 데이터가 없으므로 data는 null 이 된다.
        if (code === 0) {
            return { response: data, error: null }
        } else if (code >= 0) {
            return { response: data, error: { code: code, message: message } }
        } else {
            logger.error('[MariaDB] [Error]\n%o', { code: code, message: message })

            return { response: null, error: { code: code, message: message } }
        }
    } catch (err) {
        await conn.rollback()
        conn.release()

        logger.error('[MariaDB] [Error]\n%o', err)

        return { response: null, error: { code: -25, message: JSON.stringify(err) } }
    }
}

const standardizationKeyValue = (obj) => {
    let result = {}

    _.mapKeys(obj, (v, k) => {
        if (k.startsWith("is")) {
            v = (v == 1)
        }

        k = _.camelCase(k)

        result[k] = v
    })

    return result
}

module.exports = {
    GAME_INSERT: "Game_Insert",
    RESULT_INSERT: "Result_Insert",
    callProcedure,
}