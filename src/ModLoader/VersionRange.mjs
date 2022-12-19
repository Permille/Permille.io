export default class VersionRange{
  constructor(VersionMin, VersionMax){
    if(VersionMin > VersionMax) throw new Error("Minimum version is greater than maximum version.");
    this.VersionMin = VersionMin;
    this.VersionMax = VersionMax;
  }
  Contains(Version){
    return this.VersionMin <= Version && Version < this.VersionMax;
  }
  toString(){
    return this.VersionMin + " - " + this.VersionMax;
  }
};