import REGION_SD from "../RegionSD.mjs";
import RRS_SD from "./RequiredRegionsSelectionSD.mjs";
export default class RegionUnloader{
  //WARNING: Outdated code
  /*constructor(LoadManager){
    this.LoadManager = LoadManager;
    this.Data64 = LoadManager.Data64;
    this.Data8 = LoadManager.Data8;
    this.AllocationIndex64 = LoadManager.AllocationIndex64;
    this.AllocationIndex = LoadManager.AllocationIndex;
    this.AllocationArray64 = LoadManager.AllocationArray64;
    this.AllocationArray = LoadManager.AllocationArray;

    void function Load(){
      return;
      self.setTimeout(Load.bind(this), 10);
      this.UnloadRegions();
    }.bind(this)();
  }
  UnloadData64(x64, y64, z64){
    const Index64 = (x64 << 6) | (y64 << 3) | z64;
    if(((this.Data64[Index64] >> 1) & 1) === 1 || ((this.Data64[Index64] >> 17) & 1) === 1) return; //Is all air or is unloadable
    const DeallocIndex = Atomics.add(this.AllocationIndex64, 1, 1) & 4095; //Indexing 1 for deallocation.
    const Location64 = this.Data64[Index64] & 0x0fff;
    for(let i = 0; i < 512; ++i) this.DeallocateData8((Location64 << 9) | i)
    Atomics.store(this.AllocationArray64, DeallocIndex, Location64); //Add location back to the allocation array to be reused.
    this.Data64[(x64 << 6) | (y64 << 3) | z64] &=~0b1000111111111111; //Reset previous location and existence marker.
    this.Data64[(x64 << 6) | (y64 << 3) | z64] |=0b11000000000000000; //Set unloaded and inexistence markers.
  }
  DeallocateData8(Index8){
    const Location = this.Data8[Index8];
    if((Location & 0x80000000) !== 0) return;
    if((Location & 0x10000000) === 0){ //Doesn't have uniform type, so has to deallocate Data1 and VoxelTypes memory
      const DeallocIndex = Atomics.add(this.AllocationIndex, 1, 1) & (this.AllocationArray.length - 1);
      Atomics.store(this.AllocationArray, DeallocIndex, Location);
    }
    this.Data8[Index8] = 0x80000000;
  }
  UnloadRegions(){
    const Data64 = this.LoadManager.Data64;
    const Data8 = this.LoadManager.Data8;
    const Data1 = this.LoadManager.Data1;
    for(let Depth = 0; Depth < 8; ++Depth) for(let x64 = 0; x64 < 8; ++x64) for(let y64 = 0; y64 < 8; ++y64) Iterator: for(let z64 = 0; z64 < 8; ++z64){
      if(Depth === 0 && (x64 === 0 || y64 === 0 || z64 === 0 || x64 === 7 || y64 === 7 || z64 === 7)) continue;
      const Index64 = (Depth << 9 ) | (x64 << 6) | (y64 << 3) | z64;
      const Info64 = Data64[Index64];
      //Has not fully been loaded, or is completely empty, or is already unloaded, or is unloadable
      if(((Info64 >> 19) & 7) < 7 || ((Info64 >> 15) & 1) === 1 || ((Info64 >> 16) & 1) === 1 || ((Info64 >> 17) & 1) === 1) continue;
      for(const [dx64, dy64, dz64] of [
        [x64, y64, z64],
        [x64 - 1, y64, z64],
        [x64 + 1, y64, z64],
        [x64, y64 - 1, z64],
        [x64, y64 + 1, z64],
        [x64, y64, z64 - 1],
        [x64, y64, z64 + 1]
      ]){
        const dIndex64 = (Depth << 9) | (dx64 << 6) | (dy64 << 3) | dz64;
        const dInfo64 = Data64[dIndex64];
        if(((dInfo64 >> 19) & 7) < 2) continue Iterator;
        if(((dInfo64 >> 16) & 1) === 1) continue;
        if(((dInfo64 >> 15) & 1) === 1){
          Data64[Index64] |= 1 << 17; //I already know that Index64 isn't fully air, so this is fine.
          continue Iterator;
        }
        const dLocation64 = dInfo64 & 0x0fff;
        for(let i = 0; i < 512; ++i){
          const dInfo8 = Data8[(dLocation64 << 9) | i];
          if((dInfo8 >> 31) === 1) continue Iterator;
          if(((dInfo8 >> 28) & 1) === 1) continue Iterator; //TODO: Check if the type is actually solid (might be water or something)
          const dLocation8 = dInfo8 & 0x00ffffff;
          for(let j = 0; j < 64; ++j){
            if(Data1[(dLocation8 << 6) | j] !== 0){
              Data64[dIndex64] |= 1 << 17; //Make unloadable
              continue Iterator;
            }
          }
        }
      }
      this.UnloadData64(x64, y64, z64);
    }
  }*/
};
