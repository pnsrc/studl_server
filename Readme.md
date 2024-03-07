### Регистрация пользователя

#### Метод: POST

#### URL: /register

##### Описание

Регистрирует нового пользователя в системе.

##### Параметры запроса

*   `username` (обязательный): Логин пользователя.
*   `password` (обязательный): Пароль пользователя.

##### Пример запроса

bashCopy code

`curl -X POST -d "username=user123&password=password123" http://localhost:3000/register`

##### Ответ

*   `200 OK`: Пользователь успешно зарегистрирован.
*   `400 Bad Request`: Пользователь с таким логином уже существует.

* * *

### Вход пользователя

#### Метод: POST

#### URL: /login

##### Описание

Аутентифицирует пользователя.

##### Параметры запроса

*   `username` (обязательный): Логин пользователя.
*   `password` (обязательный): Пароль пользователя.

##### Пример запроса

bashCopy code

`curl -X POST -d "username=user123&password=password123" http://localhost:3000/login`

##### Ответ

*   `200 OK`: Пользователь успешно аутентифицирован. В ответе возвращается токен.
*   `401 Unauthorized`: Неправильный логин или пароль.

* * *

### Создание заметки

#### Метод: POST

#### URL: /api/notes

##### Описание

Создает новую заметку для авторизованного пользователя.

##### Заголовок авторизации

`Bearer your_token_here`

##### Параметры запроса

*   `title` (обязательный): Заголовок заметки.
*   `content` (обязательный): Содержание заметки.

##### Пример запроса

bashCopy code

`curl -X POST -H "Authorization: Bearer your_token_here" -d "title=New Note&content=Content of the note" http://localhost:3000/api/notes`

##### Ответ

*   `200 OK`: Заметка успешно создана.
*   `401 Unauthorized`: Ошибка аутентификации.

* * *

### Получение списка заметок

#### Метод: GET

#### URL: /api/notes

##### Описание

Получает список всех заметок пользователя.

##### Заголовок авторизации

`Bearer your_token_here`

##### Пример запроса

bashCopy code

`curl -X GET -H "Authorization: Bearer your_token_here" http://localhost:3000/api/notes`

##### Ответ

*   `200 OK`: Список заметок успешно получен.
*   `401 Unauthorized`: Ошибка аутентификации.

* * *

### Обновление заметки

#### Метод: PUT

#### URL: /api/notes/:id

##### Описание

Обновляет существующую заметку пользователя.

##### Заголовок авторизации

`Bearer your_token_here`

##### Параметры запроса

*   `title` (опциональный): Новый заголовок заметки.
*   `content` (опциональный): Новое содержание заметки.

##### Пример запроса

bashCopy code

`curl -X PUT -H "Authorization: Bearer your_token_here" -d "title=Updated Note&content=Updated content" http://localhost:3000/api/notes/1`

##### Ответ

*   `200 OK`: Заметка успешно обновлена.
*   `401 Unauthorized`: Ошибка аутентификации.

* * *

### Удаление заметки

#### Метод: DELETE

#### URL: /api/notes/:id

##### Описание

Удаляет существующую заметку пользователя.

##### Заголовок авторизации

`Bearer your_token_here`

##### Пример запроса

bashCopy code

`curl -X DELETE -H "Authorization: Bearer your_token_here" http://localhost:3000/api/notes/1`

##### Ответ

*   `200 OK`: Заметка успешно удалена.
*   `401 Unauthorized`: Ошибка аутентификации.

* * *
