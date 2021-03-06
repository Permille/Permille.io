export default class GPURegionDataLoader{
  constructor(LoadManager){
    this.LoadManager = LoadManager;

    void function Load(){
      self.setTimeout(Load.bind(this), 75);
      this.UpdateGPUData();
    }.bind(this)();
  }
  AllocateSegment(Index64){
    const SegmentLocation = this.LoadManager.FreeSegments.pop();
    if(SegmentLocation === undefined) throw new Error("Ran out of segments!!");
    this.LoadManager.Data64SegmentAllocations[Index64].push(SegmentLocation);
    return SegmentLocation;
  }
  AllocateGPUData64(Index64){
    const Location64 = this.LoadManager.FreeGPUData64.pop();
    if(Location64 === undefined) throw new Error("Ran out of GPU Data64!!");
    this.LoadManager.GPUInfo64[Index64] = Location64;
    return Location64;
  }
  UpdateGPUData(){
    const Data64 = this.LoadManager.Data64;
    const Data8 = this.LoadManager.Data8;
    const Data1 = this.LoadManager.Data1;
    const VoxelTypes = this.LoadManager.VoxelTypes;
    const GPUData64 = this.LoadManager.GPUData64;
    const GPUData8 = this.LoadManager.GPUData8;
    const GPUData1 = this.LoadManager.GPUData1;
    const GPUInfo64 = this.LoadManager.GPUInfo64;
    const GPUInfo8 = this.LoadManager.GPUInfo8;
    const GPUType1 = this.LoadManager.GPUType1;
    const GPUBoundingBox1 = this.LoadManager.GPUBoundingBox1;
    const Data64SegmentAllocations = this.LoadManager.Data64SegmentAllocations;
    const Data64SegmentIndices = this.LoadManager.Data64SegmentIndices;
    for(let Depth = 0; Depth < 8; ++Depth) for(let x64 = 0; x64 < 8; x64++) for(let y64 = 0; y64 < 8; y64++) for(let z64 = 0; z64 < 8; z64++){
      const Index64 = (Depth << 9) | (x64 << 6) | (y64 << 3) | z64;
      const Info64 = Data64[Index64];

      if(((Info64 >> 19) & 7) !== 7) continue; //Not fully loaded


      if(((Info64 >> 31) & 1) === 1){ //Empty Data64
        Data64[Index64] &= ~(1 << 30); //Toggle CPU update to false
        GPUInfo64[Index64] |= 1 << 30; //Toggle GPU update to true
        continue;
      }

      if(((Info64 >> 30) & 1) === 0) continue; //Doesn't need GPU update

      //Data64[Index64] &= ~(1 << 30); //Toggle GPU update to false

      const Location64 = Info64 & 0x0007ffff;
      const RequiredIndex8 = new Set;
      for(let x8 = 0; x8 < 8; x8++) for(let y8 = 0; y8 < 8; y8++) for(let z8 = 0; z8 < 8; z8++){
        const Index8 = (Location64 << 9) | (x8 << 6) | (y8 << 3) | z8;
        const Info8 = Data8[Index8];
        if(((Info8 >> 31) & 1) === 1 || ((Info8 >> 29) & 3) === 0) continue; //Is all air or has no updates
        Data8[Index8] &= ~(3 << 29); //Toggle updates to false
        if(((Info8 >> 30) & 1) === 1){
          let Required = false;
          if(((Info8 >> 28) & 1) === 0){ //Does not have uniform type
            const StartLocation1 = (Info8 & 0x0fffffff) << 6;
            for (let i = StartLocation1; i < StartLocation1 + 64; ++i) { //TODO: Also check surroundings.
              if (Data1[i] !== 0) { //This means that at least one of the blocks isn't solid, meaning that it has to be added.
                Required = true;
                RequiredIndex8.add(Index8);
                break;
              }
            }
          }
          //TODO: What seems to be happening is that the data doesn't get updated because of ^^^ if the Data8 is completely full and the neighbour isn't completely empty

          //Description: This marks Data8 parts that are fully solid but that are also exposed.
          //FIXME: This probably doesn't work correctly for some circumstances on Data64 boundaries.
          for(const [dx8, dy8, dz8] of [
            [x8 - 1, y8, z8],
            [x8 + 1, y8, z8],
            [x8, y8 - 1, z8],
            [x8, y8 + 1, z8],
            [x8, y8, z8 - 1],
            [x8, y8, z8 + 1]
          ]){
            const dx64 = x64 + Math.floor(dx8 / 8.);
            if(dx64 < 0 || dx64 > 7) continue;
            const dy64 = y64 + Math.floor(dy8 / 8.);
            if(dy64 < 0 || dy64 > 7) continue;
            const dz64 = z64 + Math.floor(dz8 / 8.);
            if(dz64 < 0 || dz64 > 7) continue;
            const dIndex64 = (Depth << 9) | ((dx64 & 7) << 6) | ((dy64 & 7) << 3) | (dz64 & 7);
            if(((Data64[dIndex64] >> 31) & 1) === 1){
              if(!Required && ((Data64[dIndex64] >> 19) & 7) >= 2) RequiredIndex8.add(Index8); //TODO: What does this mean??????????
              continue;
            }
            //if(!Required) continue;
            const dLocation64 = Data64[dIndex64] & 0x0007ffff;
            const dIndex8 = (dLocation64 << 9) | ((dx8 & 7) << 6) | ((dy8 & 7) << 3) | (dz8 & 7);
            const dInfo8 = Data8[dIndex8];
            if(((dInfo8 >> 31) & 1) === 1){
              if(!Required) RequiredIndex8.add(Index8);
              continue;
            }
            if(!Required) continue;
            if(dIndex64 === Index64){//Is within the same Location64, so it can be added straight to the update set
              RequiredIndex8.add(dIndex8);
            } else{
              Data8[dIndex8] |= 1 << 29;
              Data64[dIndex64] |= 1 << 30;
            }
          }
        } else if(((Info8 >> 29) & 1) === 1) RequiredIndex8.add(Index8);
      }
      if(RequiredIndex8.size === 0) continue;
      let GPULocation64 = GPUInfo64[Index64];
      if(((GPULocation64 >> 31) & 1) === 1) GPULocation64 = this.AllocateGPUData64(Index64);
      GPULocation64 &= 0x0fffffff;
      const Segments = Data64SegmentAllocations[Index64];
      if(Segments.length === 0) this.AllocateSegment(Index64);
      for(let i = 0; i < 512; ++i){
        const Index8 = (Location64 << 9) | i;
        const GPUIndex8 = (GPULocation64 << 9) | i;
        if(!RequiredIndex8.has(Index8)) continue;
        //These are now going to get their data saved
        let GPULocation1 = null;
        const Index = Data64SegmentIndices[Index64]; //TODO: Don't have to do this for uniform data!!!###########
        if(Index === 16){
          const SegmentLocationStart = this.AllocateSegment(Index64);
          GPULocation1 = SegmentLocationStart << 4;
          Data64SegmentIndices[Index64] = 1;
        } else{
          const SegmentLocationStart = Segments[Segments.length - 1];
          GPULocation1 = (SegmentLocationStart << 4) | Index;
          Data64SegmentIndices[Index64]++;
        }
        //GPUDataLocation1 allocation done
        GPUInfo8[GPUIndex8] = GPULocation1 | (1 << 30); //Set update flag
        const Info8 = Data8[Index8];
        const GPUData1Start = GPULocation1 << 6;
        const GPUTypesStart = GPULocation1 << 9;
        if(((Info8 >> 28) & 1) === 1){ //Has uniform type
          const Type = Info8 & 0x0000ffff;
          for(let i = 0; i < 64; ++i){
            GPUData1[GPUData1Start | i] = 0; //TODO: Might have to revise this? It's probably fine for now
          }
          for(let i = 0; i < 512; ++i){
            GPUType1[GPUTypesStart | i] = Type;
          }
          GPUBoundingBox1[GPUIndex8] = (0 << 15) | (0 << 12) | (0 << 9) | (7 << 6) | (7 << 3) | 7;
        } else{ //Not uniform type, has saved data, copy it over
          const Location8 = Data8[Index8] & 0x0fffffff;
          const Data1Start = Location8 << 6;
          const VoxelTypesStart = Location8 << 9;
          for(let i = 0; i < 64; ++i){ //TODO: change this to .set if possible, https://stackoverflow.com/a/35563895
            GPUData1[GPUData1Start | i] = Data1[Data1Start | i];
          }
          let MinX = 7;
          let MinY = 7;
          let MinZ = 7;
          let MaxX = 0;
          let MaxY = 0;
          let MaxZ = 0;
          for(let x = 0; x < 8; ++x) for(let y = 0; y < 8; ++y) for(let z = 0; z < 8; ++z){ //TODO: change this to .set if possible
            const Type = VoxelTypes[VoxelTypesStart | (x << 6) | (y << 3) | z];
            GPUType1[GPUTypesStart | (x << 6) | (y << 3) | z] = Type;

            if(Type === 0) continue; //TODO: Make this work for all transparent blocks
            if(MinX > x) MinX = x;
            if(MinY > y) MinY = y;
            if(MinZ > z) MinZ = z;
            if(MaxX < x) MaxX = x;
            if(MaxY < y) MaxY = y;
            if(MaxZ < z) MaxZ = z;
          }
          MinX = Math.min(0, MinX);
          MinY = Math.min(0, MinY);
          MinZ = Math.min(1, MinZ);
          for(let i = 0; i < 64; ++i){
            GPUData1[GPUData1Start | i] = Data1[Data1Start | i];
          }
          GPUBoundingBox1[GPUIndex8] = (MinX << 15) | (MinY << 12) | (MinZ << 9) | (MaxX << 6) | (MaxY << 3) | MaxZ;
          //GPUData8[GPUIndex8] |= (MaxX - MinX)
        }
      }
      //Update GPUData8

      for(let i = 0; i < 64; ++i){
        const Info8Start = (GPULocation64 << 9) | (i << 3);
        GPUData8[Info8Start >> 3] = 0; //This resets the bits so that the line below works correctly
        for(let j = 0; j < 8; ++j){
          GPUData8[Info8Start >> 3] |= ((GPUInfo8[Info8Start | j] >> 31) & 1) << j;
        }
      }


      GPUInfo64[Index64] |= 1 << 30; //Set update flag for GPU (so that the new data is uploaded)
      Data64[Index64] &= ~(1 << 29); //Request mesh update
    }
  }
};