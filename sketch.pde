float x, y;
int diameter = 200;

void setup() {
  size(1200, 400);
  strokeWeight(0.5);
  background(#AFEEFF);
  x = -diameter/2;
  y = height/2;
}

void draw() {

  if (frameCount % 800 == 0){
    background(#AFEEFF);
  }

  x = (x + 5) % ((width + diameter) - diameter/2);

  if (frameCount % 10 == 0){
    y = (y + random(-50, 50)) % (height-100);
  }

  diameter = random(80) + 50;

  stroke(random(100)+155, 100);
  fill(#C64C4C, 100);
  ellipse(x, y+50, diameter, diameter);
}
