const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User.cjs');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret-change-me', { expiresIn: '7d' });
}

async function verifyGoogleCredential(credential) {
  if (!credential) {
    throw new Error('Google credential is required');
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!response.ok) {
    throw new Error('Invalid Google credential');
  }

  const profile = await response.json();
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

  if (googleClientId && profile.aud !== googleClientId) {
    throw new Error('Google credential audience does not match this app');
  }

  if (profile.email_verified !== 'true' && profile.email_verified !== true) {
    throw new Error('Google email is not verified');
  }

  return profile;
}

function tokenExpiresAt() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

async function saveAuthEvent(user, action, token, req) {
  user.authEvents.unshift({
    action,
    token,
    tokenExpiresAt: tokenExpiresAt(),
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip || null,
  });

  user.authEvents = user.authEvents.slice(0, 50);

  if (action === 'signin' || action === 'google') {
    user.lastLoginAt = new Date();
  }

  await user.save();
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    settings: user.settings,
  };
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'user already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user._id.toString());
    await saveAuthEvent(user, 'signup', token, req);

    return res.status(201).json({
      token,
      user: userPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'failed to signup', error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'please sign in with Google' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = signToken(user._id.toString());
    await saveAuthEvent(user, 'signin', token, req);

    return res.json({
      token,
      user: userPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'failed to signin', error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const profile = await verifyGoogleCredential(req.body.credential);
    const email = profile.email.toLowerCase();

    let user = await User.findOne({
      $or: [{ googleId: profile.sub }, { email }],
    });

    if (!user) {
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        authProvider: 'google',
        googleId: profile.sub,
        avatarUrl: profile.picture || null,
        emailVerified: true,
      });
    } else {
      user.name = user.name || profile.name || email.split('@')[0];
      user.googleId = user.googleId || profile.sub;
      user.avatarUrl = profile.picture || user.avatarUrl;
      user.emailVerified = true;
      if (!user.passwordHash) {
        user.authProvider = 'google';
      }
    }

    const token = signToken(user._id.toString());
    await saveAuthEvent(user, 'google', token, req);

    return res.json({
      token,
      user: userPayload(user),
    });
  } catch (error) {
    return res.status(401).json({ message: error.message || 'failed to sign in with Google' });
  }
});

app.get('/api/user/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(userPayload(user));
});

app.get('/api/user/favorites', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('favorites');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user.favorites || []);
});

app.post('/api/user/favorites', auth, async (req, res) => {
  const { tmdbId, mediaType = 'movie', title, posterPath = null } = req.body;
  if (!tmdbId || !title) {
    return res.status(400).json({ message: 'tmdbId and title are required' });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const exists = user.favorites.some((f) => f.tmdbId === tmdbId && f.mediaType === mediaType);
  if (!exists) {
    user.favorites.unshift({ tmdbId, mediaType, title, posterPath });
  }

  await user.save();
  return res.status(201).json(user.favorites);
});

app.delete('/api/user/favorites/:mediaType/:tmdbId', auth, async (req, res) => {
  const { tmdbId, mediaType } = req.params;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.favorites = user.favorites.filter(
    (f) => !(f.tmdbId === Number(tmdbId) && f.mediaType === mediaType)
  );

  await user.save();
  return res.json(user.favorites);
});

app.get('/api/user/history', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('watchHistory');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user.watchHistory || []);
});

app.post('/api/user/history', auth, async (req, res) => {
  const { tmdbId, mediaType = 'movie', title, posterPath = null } = req.body;
  if (!tmdbId || !title) {
    return res.status(400).json({ message: 'tmdbId and title are required' });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.watchHistory = user.watchHistory.filter(
    (item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)
  );

  user.watchHistory.unshift({ tmdbId, mediaType, title, posterPath, watchedAt: new Date() });
  user.watchHistory = user.watchHistory.slice(0, 100);

  await user.save();
  return res.status(201).json(user.watchHistory);
});

app.put('/api/user/settings', auth, async (req, res) => {
  const { theme, autoplayTrailers, language, name } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }

  user.settings = {
    ...user.settings,
    ...(theme ? { theme } : {}),
    ...(typeof autoplayTrailers === 'boolean' ? { autoplayTrailers } : {}),
    ...(language ? { language } : {}),
  };

  await user.save();
  return res.json(userPayload(user));
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinematic-picks');
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

start();
