import Version_ from "../../ModLoader/Version.mjs";

export const Version = new Version_("0.0.1.1a");
export const ModID = "MapGenerator";
export const OverrideModID = null;
export const OverrideVersion = null;
export const PreInitBefore = [];

export const Dependencies = [];

export class Main{
  constructor(Dependencies){
    this.a = 5;
    this.Dependencies = Dependencies;
    console.log(this.Dependencies);
  }
  PreInit(){

  }
  Init(){
    console.log("MapGenerator", this.a);
  }
};