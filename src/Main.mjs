import "./index.html?copy";
import "./Escape.ttf?copy";
import ModsRequire from "./ModList.js";
import EventPromise from "./Libraries/EventPromise.mjs";
import ModLoader from "./ModLoader/ModLoader.mjs";
/*
const Thing = new EventTarget;
window.setTimeout(() => Thing.dispatchEvent(new CustomEvent("test", {"detail": 123})), 3000);

console.log(await new EventPromise(Thing, "test"));*/

await new EventPromise(window, "load");

document.querySelector("#LoadingFilesMessage")?.remove?.();

const Mods = [];
for(const Filename of ModsRequire.keys()){
  Mods.push(ModsRequire(Filename));
}

new ModLoader(Mods);
