import ModInfo from "./ModInfo.mjs";
import Version from "./Version.mjs";

export default class ModLoader{
  static Version = new Version("0.0.1.1a");
  constructor(ModsArray){
    this.Mods = new Map;
    this.ActualModIDMods = new Map;

    this.HandleOverrides(ModsArray);
    this.HandleDependencies();
    this.ConstructModClasses();
    this.PreInit();
    this.Init();
  }
  HandleOverrides(ModsArray){
    const OverrideConflicts = new Map;
    for(const Mod of ModsArray){
      let ModID;
      let Overrides;
      if(Mod.OverrideModID == null){ //Checks for both null and undefined
        ModID = Mod.ModID;
        Overrides = false;
      } else{
        ModID = Mod.OverrideModID;
        Overrides = true;
      }
      if(this.Mods.has(ModID)){
        const Info = this.Mods.get(ModID);
        if(Overrides && Info.Overrides){ //This means that two or more mods tried to override the same mod, this will cause a crash
          if(!OverrideConflicts.has(Mod.OverrideModID)) OverrideConflicts.set(Mod.OverrideModID, new Set);
          OverrideConflicts.get(Mod.OverrideModID).add(Info.ActualModID).add(Mod.ModID);
        }
        if(Info.Overrides) continue; //Don't replace overridden mod version
      }
      if(this.ActualModIDMods.has(Mod.ModID)){
        throw new Error("[ModLoader] Fatal error: Multiple mods had the same ActualModID!");
      }
      const Info = new ModInfo(
        ModID,//ModID
        Mod.ModID, //ActualModID
        Overrides ? Mod.OverrideVersion : Mod.Version, //Version
        Mod.Version, //ActualVersion
        Mod.PreInitBefore, //PreInit dependency list
        Mod.Dependencies, //Dependency list
        Mod.Main //Mod class
      );
      this.Mods.set(ModID, Info);
      this.ActualModIDMods.set(Mod.ModID, Info);
      console.log(Mod);
    }
    if(OverrideConflicts.size > 0){
      let ErrorMessage = "[ModLoader] Fatal error: multiple mods tried overriding the same mod.\n";
      ErrorMessage += "For each of the overridden mods below, remove all but one of the override mods to resolve this error.\n";

      for(const [OriginalModID, Overriders] of OverrideConflicts){
        ErrorMessage += `\nMod with ModID ${OriginalModID} tried to be overridden by: ${[...Overriders].join(", ")}.`;
      }
      throw new Error(ErrorMessage);
    }
  }
  HandleDependencies(){
    const MissingMods = new Map;
    for(const [ModID, ModInfo] of this.Mods){
      ModInfo.Dependencies = new Map;
      for(const Dependency of ModInfo.DependencyList){
        let DependencyModInfo;

        if(this.ActualModIDMods.has(Dependency.ModID)){
          DependencyModInfo = this.ActualModIDMods.get(Dependency.ModID);
        } else if(this.Mods.has(Dependency.ModID)){
          DependencyModInfo = this.Mods.get(Dependency.ModID);
        } else{ //Couldn't resolve mod dependency
          if(Dependency.Optional){
            console.log(`[ModLoader] Info: An optional mod dependency for mod ${ModInfo.ActualModID} was missing: ${Dependency.ModID}.`);
            continue;
          }
          if(!MissingMods.has(ModInfo.ActualModID)) MissingMods.set(ModInfo.ActualModID, []);
          MissingMods.get(ModInfo.ActualModID).push(Dependency.ModID);
          continue;
        }

        let IsInVersionRange = Dependency.VersionRange.Contains(DependencyModInfo.Version);
        if(!IsInVersionRange){
          console.error(`[ModLoader] Error: A mod dependency for mod ${ModInfo.ActualModID} had the wrong version: ${Dependency.ModID}. Expected version range: ${Dependency.VersionRange}; supplied version: ${DependencyModInfo.Version}.`);
        }

        ModInfo.Dependencies.set(Dependency.ModID, DependencyModInfo);
      }
    }
    if(MissingMods.size > 0){
      let ErrorMessage = "[ModLoader] Fatal error: Some required mod dependencies were missing.\n";

      for(const [ActualModID, MissingModIDs] of MissingMods){
        ErrorMessage += `\nMod with ModID ${ActualModID} is missing the following mods: ${MissingModIDs.join(", ")}.`;
      }
      throw new Error(ErrorMessage);
    }
  }
  ConstructModClasses(){
    for(const [ModID, ModInfo] of this.Mods){
      ModInfo.Instance = new ModInfo.Main(ModInfo.Dependencies);
    }
  }
  PreInit(){
    for(const [ModID, ModInfo] of this.Mods){
      ModInfo.Instance.PreInit();
    }
  }
  Init(){
    for(const [ModID, ModInfo] of this.Mods){
      ModInfo.Instance.Init();
    }
  }
};