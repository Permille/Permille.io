export default class ModInfo{
  constructor(ModID, ActualModID, Version, ActualVersion, PreInitBefore, DependencyList, Main){
    /*
      ActualModID and ActualVersion contain the ModID and Version of the mod itself.

      ModID and Version are the same as ActualModID and ActualVersion only if the mod doesn't override another mod.
      If this mod does override another mod, then ModID and Version will be the mod id and version of the mod that is being overridden.
      Particularly, the version should be set to which version of the mod it wants to mimic.
    */
    this.ModID = ModID;
    this.ActualModID = ActualModID;
    this.Overrides = ModID !== ActualModID;
    this.Version = Version;
    this.ActualVersion = ActualVersion;
    this.PreInitBefore = PreInitBefore;
    this.DependencyList = DependencyList; //This will contain the ActualModID and Version for each dependency.
    this.Main = Main;

    this.Dependencies = null; //This will contain a map from the ModID to the Main class.
    this.Instance = null;
  }
};