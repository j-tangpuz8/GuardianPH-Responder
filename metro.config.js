const {getDefaultConfig} = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("mp3", "wav", "aac", "m4a", "ogg", "wma");

module.exports = config;
