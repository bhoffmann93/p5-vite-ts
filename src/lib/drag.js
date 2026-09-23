// Dragging points with the mouse. Returns the point itself, not a copy, so
// moving what it returns moves the original:
//
//   const grabbed = findPointAt(points, mouseX, mouseY, 20);
//   if (grabbed) grabbed.set(mouseX, mouseY);

export function findPointAt(points, x, y, grabRadius) {
  for (const candidate of points) {
    if (dist(x, y, candidate.x, candidate.y) < grabRadius) return candidate;
  }
  return null;
}
