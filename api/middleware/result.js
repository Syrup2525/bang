const logger = require('../../logger.js')
const { callProcedure, GAME_INSERT, RESULT_INSERT } = require('../../mariaDB/storedProcedure.js')

const regist = async (req, res) => {
    const content = req.body.content
    const date = req.body.date
    const raws = content.split('\n')

    let round = 0
    let isWin = false

    for (const raw of raws) {
        if (raw.trim() === "") {
            continue
        }

        if (raw.startsWith("1") || raw.startsWith("2")) {
            const { response, error } = await callProcedure(GAME_INSERT, [date], true)

            if (error !== null) {
                logger.error("game insert error")
                break
            } else {
                round = response.code
                continue
            }
        }
    
        if (raw.toLowerCase().includes("win")) {
            isWin = true
            continue
        } else if (raw.toLowerCase().includes("loss")) {
            isWin = false
            continue
        }

        const cols = raw.split(" ")

        for (let col of cols) {
            const match = col.match(/(.*?)\((.*?)\)/)

            if (match) {
                const name = match[1]
                const job = match[2]

                // IN in_name VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                // IN in_job VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                // IN in_character VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
                // IN in_is_win tinyint(1),
                // IN in_game_code INT,
                const { error } = await callProcedure(RESULT_INSERT, [name, job, null, isWin, round], true)

                if (error !== null) {
                    logger.error("result insert error")
                    break
                }
            }
        }
    }

    res.send({
        code: 0,
        message: "success",
    })
}

module.exports = {
    regist,
}