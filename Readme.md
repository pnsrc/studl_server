Хорошо, давайте перепишем документацию, более подробно описывая каждый эндпоинт и его назначение.

### Документация API Studl

#### 1. Регистрация нового пользователя

- **Метод:** `POST`
- **Путь:** `/register`
- **Описание:** Регистрирует нового пользователя в системе.
- **Параметры запроса:**
  - `username` (обязательный): Уникальное имя пользователя.
  - `password` (обязательный): Пароль пользователя.
  - `fullName`: ФИО пользователя (опционально).
  - `idGroup`: ID группы пользователя (опционально).
- **Пример запроса (curl):**
  ```bash
  curl -X POST http://yourdomain.com/register \
  -H "Content-Type: application/json" \
  -d '{"username": "new_user", "password": "new_password", "fullName": "Full Name", "idGroup": "Group ID"}'
  ```
- **Пример запроса (JavaScript - axios):**
  ```javascript
  axios.post('http://yourdomain.com/register', {
    username: 'new_user',
    password: 'new_password',
    fullName: 'Full Name',
    idGroup: 'Group ID'
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
  ```

#### 2. Аутентификация пользователя по имени пользователя и паролю

- **Метод:** `POST`
- **Путь:** `/login`
- **Описание:** Аутентифицирует пользователя по его имени и паролю.
- **Параметры запроса:**
  - `username` (обязательный): Имя пользователя.
  - `password` (обязательный): Пароль пользователя.
- **Пример запроса (curl):**
  ```bash
  curl -X POST http://yourdomain.com/login \
  -H "Content-Type: application/json" \
  -d '{"username": "example_user", "password": "example_password"}'
  ```
- **Пример запроса (JavaScript - axios):**
  ```javascript
  axios.post('http://yourdomain.com/login', {
    username: 'example_user',
    password: 'example_password'
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
  ```

#### 3. Получение всех заметок

- **Метод:** `GET`
- **Путь:** `/api/get.all/note`
- **Описание:** Получает все заметки, созданные пользователем.
- **Авторизация:** Необходима.
- **Пример запроса (curl):**
  ```bash
  curl -X GET http://yourdomain.com/api/get.all/note \
  -H "Authorization: Bearer your_access_token"
  ```
- **Пример запроса (JavaScript - axios):**
  ```javascript
  axios.get('http://yourdomain.com/api/get.all/note', {
    headers: {
      Authorization: 'Bearer your_access_token'
    }
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
  ```

#### 4. Добавление новой заметки

- **Метод:** `POST`
- **Путь:** `/api/add/note`
- **Описание:** Добавляет новую заметку.
- **Авторизация:** Необходима.
- **Параметры запроса:**
  - `guid` (обязательный): Уникальный идентификатор заметки.
  - `note` (обязательный): Текст заметки.
  - `attachment`: Вложение (изображение).
- **Пример запроса (curl):**
  ```bash
  curl -X POST http://yourdomain.com/api/add/note \
  -H "Authorization: Bearer your_access_token" \
  -F "guid=guid_value" \
  -F "note=Note text" \
  -F "attachment=@/path/to/attachment_file"
  ```
- **Пример запроса (JavaScript - axios):**
  ```javascript
  const formData = new FormData();
  formData.append('guid', 'guid_value');
  formData.append('note', 'Note text');
  formData.append('attachment', attachmentFile);

  axios.post('http://yourdomain.com/api/add/note', formData, {
    headers: {
      Authorization: 'Bearer your_access_token',
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
  ```

#### 5. Обновление заметки

- **Метод:** `PUT`
- **Путь:** `/api/update/notes/:id`
- **Описание:** Обновляет существующую заметку.
- **Авторизация:** Необходима.
- **Параметры запроса:**
  - `guid`: Новый уникальный идентификатор заметки.
  - `note`: Новый текст заметки.
- **Пример запроса (curl):**
  ```bash
  curl -X PUT http://yourdomain.com/api/update/notes/:id \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"guid": "new_guid_value", "note": "new_note_text"}'
  ```
- **Пример запроса (JavaScript - axios):**
  ```javascript
  axios.put('http://yourdomain.com/api/update/notes/:id', {
    guid: 'new_guid_value',
    note: 'new_note_text'
  }, {
    headers: {
      Authorization: 'Bearer your_access_token',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
  ```
