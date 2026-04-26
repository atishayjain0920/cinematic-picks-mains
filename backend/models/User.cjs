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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    favorites: { type: [favoriteSchema], default: [] },
    watchHistory: { type: [historySchema], default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
