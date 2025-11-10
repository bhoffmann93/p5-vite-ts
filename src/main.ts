import p5 from 'p5';

import './style.css';

const doThings = (name: string) => {
  return name;
};

// eslint-disable-next-line
const sketch = new p5((p5Instance: p5) => {
  const p = p5Instance;

  const x = 100;
  const y = 100;

  p.setup = () => {
    p.createCanvas(500, 500);
  };

  p.draw = () => {
    p.background(0);
    p.fill(205);
    p.rect(x, y, 50, 50);
  };
}, document.getElementById('app')!);
