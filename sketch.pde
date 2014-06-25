float x, y;
int diameter = 200;

void setup() {
  size(500, 500);
  background(#AFEEFF);
  noStroke();
  x = -diameter/2;
  y = height/2;
}

void draw() {
  background(#AFEEFF);
  fill(255, 200);
  ellipse(x, y, diameter, diameter);
  x = (x + 5) % ((width + diameter) - diameter/2);
}
