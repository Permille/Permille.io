import Version_ from "../../ModLoader/Version.mjs";
import * as MapGenerator from "./ConditionalImport.js";
import VersionRange from "../../ModLoader/VersionRange.mjs";

export const Version = new Version_("0.0.1");
export const ModID = "Test";
export const OverrideModID = null;
export const OverrideVersion = null;
export const PreInitBefore = ["MapGenerator"]; //This can be used to patch these mods at runtime

export const Dependencies = [{
  "ModID": "MapGenerator",
  "VersionRange": new VersionRange(Version_.Zero, Version_.Any),
  "Optional": false
}];

export class Main{
  constructor(Dependencies){
    this.Events = new EventTarget;
    this.Dependencies = Dependencies;
    console.log(this.Dependencies);
  }
  PreInit(){
    console.warn(MapGenerator);
    const Original = MapGenerator.Main.prototype.Init;
    MapGenerator.Main.prototype.Init = function(...Params){
      console.log("Modified by Test", this.a);
      Original.bind(this)(...Params);
    };
    console.log("Patched MapGenerator");
    return true;
  }
  Init(){
    return true;
  }
};