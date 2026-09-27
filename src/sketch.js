// START HERE.
//
// This is where your sketch lives, controls included (addControls() at the
// bottom). Nothing in this project is off limits.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// A grid of modules. Click a cell to change its module: empty, square,
// circle, then empty again. Add your own module to MODULES and to drawModule().
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { gridSize, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in addControls() at the bottom of this file to give it a slider or a checkbox.
//
// The colors start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const uiParams = {
  columns: 8,
  rows: 8,
  showGrid: true,
  foregroundColor,
  backgroundColor,
};

const gridLineColor = { r: 128, g: 128, b: 128 };

// A click moves a cell one step along this list.
const MODULES = ['empty', 'square', 'circle'];

// grid[row][column] holds the name of the module in that cell
let grid = [];

window.setup = function setup() {
  createCanvas(windowWidth, windowHeight);
  resizeGrid();
};

window.draw = function draw() {
  background(uiParams.backgroundColor.r, uiParams.backgroundColor.g, uiParams.backgroundColor.b);

  const cellWidth = gridSize / uiParams.columns;
  const cellHeight = gridSize / uiParams.rows;

  translate(gridLeft(), gridTop());

  for (let row = 0; row < uiParams.rows; row++) {
    for (let column = 0; column < uiParams.columns; column++) {
      //the top left corner of this cell
      const x = column * cellWidth;
      const y = row * cellHeight;

      drawModule(grid[row][column], x, y, cellWidth, cellHeight);

      //draw grid lines
      if (uiParams.showGrid) {
        noFill();
        stroke(gridLineColor.r, gridLineColor.g, gridLineColor.b);
        strokeWeight(1);
        rect(x, y, cellWidth, cellHeight);
      }
    }
  }
};

function drawModule(module, x, y, cellWidth, cellHeight) {
  const time = millis() / 1000.0; //in seconds
  noStroke();
  fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);

  if (module === 'square') {
    //the square fills the whole cell
    const rectWidth = cellWidth;
    const rectHeight = cellHeight;
    rect(x, y, rectWidth, rectHeight);
  }

  if (module === 'circle') {
    const centerX = x + cellWidth / 2;
    const centerY = y + cellHeight / 2;

    let diameter = min(cellWidth, cellHeight); //the largest circle that still fits inside the cell
    circle(centerX, centerY, diameter);
  }
}

// Where the grid starts, so that it sits in the middle of the canvas.
function gridLeft() {
  return (width - gridSize) / 2;
}

function gridTop() {
  return (height - gridSize) / 2;
}

window.mousePressed = function mousePressed(event) {
  //the control panel sits on top of the canvas, so clicks on it are ignored
  if (event.target.tagName !== 'CANVAS') return;

  const cellWidth = gridSize / uiParams.columns;
  const cellHeight = gridSize / uiParams.rows;

  //which cell the mouse is over, counted from the grid's top left corner
  const column = floor((mouseX - gridLeft()) / cellWidth);
  const row = floor((mouseY - gridTop()) / cellHeight);

  //clicks around the grid do nothing
  if (column < 0 || column >= uiParams.columns || row < 0 || row >= uiParams.rows) return;

  const nextIndex = (MODULES.indexOf(grid[row][column]) + 1) % MODULES.length;
  grid[row][column] = MODULES[nextIndex];
};

// Makes the grid match columns and rows, keeping the cells that are still there.
function resizeGrid() {
  const resized = [];
  for (let row = 0; row < uiParams.rows; row++) {
    resized[row] = [];
    for (let column = 0; column < uiParams.columns; column++) {
      const cellExisted = row < grid.length && column < grid[row].length;
      resized[row][column] = cellExisted ? grid[row][column] : 'empty';
    }
  }
  grid = resized;
}

function clearGrid() {
  grid = [];
  resizeGrid();
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'columns', 1, 32, 1).onChange(resizeGrid);
  gui.add(uiParams, 'rows', 1, 32, 1).onChange(resizeGrid);
  gui.add(uiParams, 'showGrid').name('show grid');
  //a function on an object is how lil-gui makes a button
  gui.add({ clearGrid }, 'clearGrid').name('clear');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, addControls });
new p5();
