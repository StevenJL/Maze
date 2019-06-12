// 2 copies of board in linear memory
//  - First is the board (States of 0=empty, 1=wall, 2=cheese, 3=mouse)
//  - Second is "distance"

export function getMaze(x: i32, y: i32) : i32 {
  return load<i32>(50*4*y + 4*x)
}
export function setMaze(x: i32, y: i32, v: i32) : void {
  store<i32>(50*4*y + 4*x, v);
}
export function getDistance(x: i32, y: i32) : i32 {
  return load<i32>(50*50*4 + 50*4*y + 4*x)
}
export function setDistance(x: i32, y: i32, v: i32) : void {
  store<i32>(50*50*4 + 50*4*y + 4*x, v);
}

export function clearMaze() : void {
  let x: i32, y: i32;
  for(x = 0; x < 50; x++) {
    for(y = 0; y < 50; y++) {
      setMaze(x, y, 0);
    }
  }
}

function initDistances() : void {
  let x: i32, y: i32;
  for(x = 0; x < 50; x++) {
    for(y = 0; y < 50; y++) {
      setDistance(x, y, 50*50); // Max possible distance
    }
  }
}

function inBounds(x: i32, y: i32) : bool {
  return (0 <= x && x < 50 && 0 <= y && y < 50);
}

export function computeDistances(x: i32, y: i32) : void {
  initDistances();
  recursiveComputeDistance(x, y, 0);
}

function recursiveComputeDistance(x: i32, y: i32, d: i32) : void {
  if(!inBounds(x, y)) return; // No short-circuit so need this as separate line
  if(getMaze(x, y) == 1 || getDistance(x, y) <= d) return; // Our path isn't better than the old one

  setDistance(x, y, d);
  recursiveComputeDistance(x-1, y, d+1);
  recursiveComputeDistance(x+1, y, d+1);
  recursiveComputeDistance(x, y-1, d+1);
  recursiveComputeDistance(x, y+1, d+1);
}
