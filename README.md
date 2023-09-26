# Bang

config.json
---
```json
{
    "mariaDBConfig": {
        "host": "<DB 도메인>",
        "user": "<DB 계정 아이디>",
        "password": "<DB 계정 비밀번호>",
        "database": "<DB 이름>",
        "connectionLimit": "<DB 연결 최대 개수>"
    }
}
```

.env
---
```env
BUILD_MODE=<LOCAL | DEBUG | RELEASE>
SERVER_PORT=
LOG_LEVEL=<error, info, debug, db, http>
BASE_URL=
DB_SERVER_HOST=<mysql host ip>
```