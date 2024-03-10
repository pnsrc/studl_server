const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Инициализация базы данных SQLite
const db = new sqlite3.Database('./data.db');

// Создание таблицы пользователей, если ее нет
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, full_name TEXT, id_group TEXT)');
});

// Создание таблицы токенов, если ее нет
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS tokens (userId INTEGER, token TEXT UNIQUE)');
});

// Создание таблицы заметок, если ее нет
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, guid TEXT, note TEXT, attachment TEXT, userId INTEGER)');
});

// Инициализация express-session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Использование multer для обработки вложенных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware для проверки аутентификации
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Пользователь не аутентифицирован' });
};

// Генерация случайного токена
const generateRandomToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Генерация и сохранение токена для пользователя
const generateToken = (userId) => {
  const token = generateRandomToken();
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO tokens (userId, token) VALUES (?, ?)', [userId, token], (err) => {
      if (err) {
        console.error('Ошибка сохранения токена:', err);
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

// Получение токена для пользователя
const getTokenForUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT token FROM tokens WHERE userId = ?', [userId], (err, row) => {
      if (err) {
        console.error('Ошибка получения токена:', err);
        reject(err);
      } else {
        resolve(row ? row.token : null);
      }
    });
  });
};

// Сериализация и десериализация пользователя для Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    done(err, row);
  });
});

// Настройка локальной стратегии аутентификации Passport
passport.use(new LocalStrategy(
  (username, password, done) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return done(err);
      if (!row) return done(null, false);
      if (row.password !== password) return done(null, false);
      return done(null, row);
    });
  }
));

// Регистрация нового пользователя
app.post('/register', async (req, res) => {
  const { username, password, fullName, idGroup } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
  }

  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    const userId = await createUser(username, password, fullName, idGroup);
    const token = await generateToken(userId);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Ошибка регистрации пользователя:', err);
    res.status(500).json({ error: 'Ошибка регистрации пользователя' });
  }
});

// Аутентификация пользователя по имени и паролю
app.post('/login', passport.authenticate('local'), async (req, res) => {
  const token = await generateToken(req.user.id);
  res.status(200).json({ token });
});

// Аутентификация пользователя по токену
app.post('/api/login', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Необходимо указать токен' });
  }

  try {
    const user = await getUserByToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Ошибка аутентификации по токену:', err);
    res.status(500).json({ error: 'Ошибка аутентификации' });
  }
});

// Добавление новой заметки
app.post('/api/add/note', upload.single('attachment'), (req, res) => {
  const { guid, note } = req.body;
  const attachment = req.file ? req.file.path : null; // Получаем путь к загруженному изображению

  if (!guid || !note) {
    return res.status(400).json({ error: 'Необходимо указать guid и note' });
  }

  db.run('INSERT INTO notes (guid, note, attachment, userId) VALUES (?, ?, ?, ?)', [guid, note, attachment, req.user.id], function(err) {
    if (err) {
      console.error('Ошибка добавления заметки:', err);
      return res.status(500).json({ error: 'Ошибка добавления заметки' });
    }
    res.status(201).json({ message: 'Заметка успешно добавлена' });
  });
});

// Функция для получения пользователя по токену
const getUserByToken = (token) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT users.* FROM users INNER JOIN tokens ON users.id = tokens.userId WHERE tokens.token = ?', [token], (err, row) => {
      if (err) {
        console.error('Ошибка получения пользователя по токену:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Функция для создания нового пользователя с ФИО и id_group
const createUser = (username, password, fullName, idGroup) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (username, password, full_name, id_group) VALUES (?, ?, ?, ?)', [username, password, fullName, idGroup], function(err) {
      if (err) {
        console.error('Ошибка создания пользователя:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

// Функция для получения пользователя по имени пользователя
const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('Ошибка получения пользователя по имени:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Получение информации о текущем пользователе
app.get('/api/test_in', isAuthenticated, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Получение всех заметок текущего пользователя
app.get('/api/get.all/note', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM notes WHERE userId = ?', [userId], (err, rows) => {
    if (err) {
      console.error('Ошибка получения заметок пользователя:', err);
      return res.status(500).json({ error: 'Ошибка получения заметок пользователя' });
    }
    res.status(200).json({ notes: rows });
  });
});

// Обновление заметки по идентификатору
app.put('/api/update/notes/:id', isAuthenticated, (req, res) => {
  const noteId = req.params.id;
  const { guid, note } = req.body;

  if (!guid || !note) {
    return res.status(400).json({ error: 'Необходимо указать guid и note для обновления заметки' });
  }

  // Проверяем, принадлежит ли заметка текущему пользователю
  db.get('SELECT * FROM notes WHERE id = ? AND userId = ?', [noteId, req.user.id], (err, row) => {
    if (err) {
      console.error('Ошибка при проверке принадлежности заметки:', err);
      return res.status(500).json({ error: 'Ошибка обновления заметки' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Заметка не найдена или не принадлежит текущему пользователю' });
    }

    // Обновляем заметку
    db.run('UPDATE notes SET guid = ?, note = ? WHERE id = ?', [guid, note, noteId], function(err) {
      if (err) {
        console.error('Ошибка обновления заметки:', err);
        return res.status(500).json({ error: 'Ошибка обновления заметки' });
      }
      res.status(200).json({ message: 'Заметка успешно обновлена' });
    });
  });
});

// Заглушка для корневого маршрута
app.get('/', (req, res) => {
  res.send('Добро пожаловать на сервер. Для доступа к API перейдите по соответствующим маршрутам.');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
