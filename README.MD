# Permille.io Voxel Engine
This repository will contain the new, rewritten version of my voxel engine that will support much greater voxel volumes. <br />
The old repository with the 0.1.x versions has been moved to [here](https://github.com/Permille/Permille.io-0.1.x).

## How to run

### start.bat

The `start.bat` file compiles a webpack dev build and opens an electron window. When the
window is closed, a new webpack build will be created, and the window will open again
with the new version of the code. This is recommended for development.

### npm run electron

Running this will compile a webpack dev build and open an electron window. This won't
create new builds, which means that it won't register changes to the code.

### npm start

Running this will compile a webpack dev build and start a local server. The build will
then be hosted on `http://localhost:27/dist/index.html`. This won't
create new builds, which means that it won't register changes to the code.

