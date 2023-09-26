/**
 * 로그 데이터 변경
 * @param {*} object Log Object
 * @param {boolean} isSimpleArray 배열 length 단순 표현 여부 (생략시 true)
 * @returns "JSON.stringify(object, null, 2)"
 */
const getLogData = (object, isSimpleArray) => {
    if (isSimpleArray === undefined || isSimpleArray === null || isSimpleArray == true) {
        try {
            const obj = convertArraysToLength(deepCopy(object))

            return JSON.stringify(obj, null, 2)
        } catch (err) {
            return JSON.stringify(object, null, 2)
        }
    } else {
        return JSON.stringify(object, null, 2)
    }
}

/**
 * 해당 값이 빈값인지 확인 (string인 경우 공백확인)
 * @param {*} value 
 * @returns 값이 빈 경우 true 반환
 */
const isBlank = (value) => {
    if (value === undefined || value === null) {
        return true
    }

    if (typeof value === 'boolean') {
        return false
    }

    if (typeof value === 'string') {
        if (value.trim() == "") {
            return true
        }
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return true
        }
    }

    return false
}

module.exports = {
    getLogData,
    isBlank,
}
