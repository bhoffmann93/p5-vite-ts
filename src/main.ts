import p5 from 'p5';
import { Pane } from 'tweakpane';
import Stats from 'stats.js';
import { timestamp } from './utils/utils';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const params = {
  color: 205,
};

const pane = new Pane({ title: 'Controls' });
pane.addBinding(params, 'color', { min: 0, max: 255, step: 1, label: 'fill' });

let sketch: p5;
new p5((p: p5) => {
  sketch = p;
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    stats.begin();
    p.background(50);
    p.fill(params.color);
    p.noStroke();

    const centerX = p.width / 2.0;
    const centerY = p.height / 2.0;
    p.rect(centerX, centerY, 50, 50);
    stats.end();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
    stats.dom.style.display = stats.dom.style.display === 'none' ? 'block' : 'none';
  }
  if (e.key === 's') {
    sketch.saveCanvas(`${__GIT_BRANCH__}-${timestamp()}`, 'png');
  }
});
