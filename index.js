const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, device_name TEXT, device_type TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, image TEXT, guid TEXT)");
});

passport.use(new LocalStrategy(function(username, password, done) {
  db.get('SELECT * FROM users WHERE username = ?', [username], function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.compare(password, user.password, function(err, res) {
      if (res) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.get('SELECT * FROM users WHERE id = ?', [id], function(err, user) {
    done(err, user);
  });
});

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
}

app.post('/login', passport.authenticate('local'), function(req, res) {
  const token = generateToken(req.user);
  res.json({ token: token });
});

app.post('/api/login_device', function(req, res) {
  const token = req.body.token;
  const deviceName = req.body.deviceName;
  const deviceType = req.body.deviceType;

  jwt.verify(token, 'your-secret-key', function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      const userId = decoded.id;

      db.run('INSERT INTO devices (user_id, device_name, device_type) VALUES (?, ?, ?)', [userId, deviceName, deviceType], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add device information' });
        }
        res.json({ message: 'Device authenticated successfully' });
      });
    }
  });
});

app.get('/api/see_token', function(req, res) {
  if (req.isAuthenticated()) {
    const token = generateToken(req.user);
    res.json({ token: token });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/notes', function(req, res) {
  const token = req.headers.authorization;
  const { title, content, image, guid } = req.body;

  jwt.verify(token, 'your-secret-key', function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      const userId = decoded.id;

      db.run('INSERT INTO notes (user_id, title, content, created_at, image, guid) VALUES (?, ?, ?, ?, ?, ?)', [userId, title, content, new Date(), image, guid], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add note' });
        }
        res.json({ message: 'Note added successfully' });
      });
    }
  });
});

app.get('/api/notes', function(req, res) {
  const token = req.headers.authorization;

  jwt.verify(token, 'your-secret-key', function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      const userId = decoded.id;

      db.all('SELECT * FROM notes WHERE user_id = ?', [userId], function(err, rows) {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch notes' });
        }
        res.json(rows);
      });
    }
  });
});

app.get('/api/notes/:id', function(req, res) {
  const token = req.headers.authorization;
  const noteId = req.params.id;

  jwt.verify(token, 'your-secret-key', function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      db.get('SELECT * FROM notes WHERE id = ?', [noteId], function(err, row) {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch note' });
        }
        res.json(row);
      });
    }
  });
});

app.post('/api/get_share_note', function(req, res) {
  const token = req.headers.authorization;
  const noteId = req.body.noteId;

  jwt.verify(token, 'your-secret-key', function(err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      db.get('SELECT * FROM notes WHERE id = ?', [noteId], function(err, row) {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch note' });
        }
        res.json(row);
      });
    }
  });
});

app.listen(3000, function() {
  console.log('Server is running on port 3000');
});
