//const Files = require.context("../", true, /\.\/Main\/.*\.m?js/);
const Files = require.context("../", true, /\.\/MapGenerator\/Main.mjs/);
module.exports = Files.keys().length === 0 ? null : Files(Files.keys()[0]);
//const Exists = require.context("./", false, /Exists.mjs/)("./Exists.mjs");
//module.exports.DoesntExist = DoesntExist;
//module.exports.Exists = Exists;