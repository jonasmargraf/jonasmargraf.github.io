float x, y;
float diameter = 200;

void setup() {
  smooth();
  size(2000, 1000);
  strokeWeight(0.5);
  background(#B8DADE);
  x = -diameter/2;
  y = height/2;
}

void draw() {

  if (frameCount % 1600 == 0){
    background(#B8DADE);
  }

  diameter = random(100) + 20;

  x = (x + 5) % ((width + diameter) - diameter/2);

  if (frameCount % 10 == 0){
    y = (y + random(-150, 150)) % (height-diameter);
  }

  if (y < diameter || y > height-diameter){
    y = random(diameter, height-diameter);
  }

  // y = constrain(0+diameter, height-diameter);

  stroke(255, 200);
  fill(random(155)+100, 0, 40, 100);
  ellipse(x, y+50, diameter, diameter);
  fill(255, 200);
  ellipse(x, y+50, 5, 5);
}
