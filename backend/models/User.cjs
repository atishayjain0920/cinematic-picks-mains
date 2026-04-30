const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    watchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    autoplayTrailers: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  { _id: false }
);

const authEventSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ['signup', 'signin', 'google'], required: true },
    token: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null, index: true },
    avatarUrl: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: null },
    authEvents: { type: [authEventSchema], default: [] },
    favorites: { type: [favoriteSchema], default: [] },
    watchHistory: { type: [historySchema], default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
