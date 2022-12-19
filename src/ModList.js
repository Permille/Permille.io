module.exports = require.context("./Mods", true, /^\.\/(?!.*\.disabled)[^\/]*\/Main\.(m?js|ts)x?/);
//The regex will match:
// "./Mod/Main.mjs"
// "./Test/Main.js"
// "./Typescript/Main.tsx"
//
//It won't match:
// "./Mod.disabled/Main.mjs"
// "./Mod/Thing.mjs"
// "./Test/Utils/Main.js"