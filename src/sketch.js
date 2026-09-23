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
const params = {
  columns: 8,
  rows: 8,
  showGrid: true,
  foregroundColor,
  backgroundColor,
};

// A click moves a cell one step along this list.
const MODULES = ['empty', 'square', 'circle'];

// grid[row][column] holds the name of the module in that cell
let grid = [];

window.setup = function setup() {
  createCanvas(windowWidth, windowHeight);
  resizeGrid();
};

window.draw = function draw() {
  background(params.backgroundColor.r, params.backgroundColor.g, params.backgroundColor.b);

  const cellWidth = gridSize / params.columns;
  const cellHeight = gridSize / params.rows;

  translate(gridLeft(), gridTop());

  for (let row = 0; row < params.rows; row++) {
    for (let column = 0; column < params.columns; column++) {
      const x = column * cellWidth;
      const y = row * cellHeight;

      drawModule(grid[row][column], x, y, cellWidth, cellHeight);

      if (params.showGrid) {
        noFill();
        stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b, 60);
        strokeWeight(1);
        rect(x, y, cellWidth, cellHeight);
      }
    }
  }
};

function drawModule(module, x, y, cellWidth, cellHeight) {
  noStroke();
  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);

  if (module === 'square') {
    rect(x, y, cellWidth, cellHeight);
  }

  if (module === 'circle') {
    ellipse(x + cellWidth / 2, y + cellHeight / 2, cellWidth, cellHeight);
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
  if (event.target !== drawingContext.canvas) return;

  const column = floor(((mouseX - gridLeft()) / gridSize) * params.columns);
  const row = floor(((mouseY - gridTop()) / gridSize) * params.rows);

  //clicks around the grid do nothing
  if (column < 0 || column >= params.columns || row < 0 || row >= params.rows) return;

  const nextIndex = (MODULES.indexOf(grid[row][column]) + 1) % MODULES.length;
  grid[row][column] = MODULES[nextIndex];
};

// Makes the grid match columns and rows, keeping the cells that are still there.
function resizeGrid() {
  const resized = [];
  for (let row = 0; row < params.rows; row++) {
    resized[row] = [];
    for (let column = 0; column < params.columns; column++) {
      resized[row][column] = grid[row]?.[column] ?? 'empty';
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
  gui.add(params, 'columns', 1, 32, 1).onChange(resizeGrid);
  gui.add(params, 'rows', 1, 32, 1).onChange(resizeGrid);
  gui.add(params, 'showGrid').name('show grid');
  gui.add({ clearGrid }, 'clearGrid').name('clear');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, addControls });
new p5();
