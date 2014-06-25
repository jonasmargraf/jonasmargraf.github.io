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

	if (frameCount % 400 == 0){
		background(#AFEEFF);
	}
	if (frameCount % 20 == 0){
		y = (y + random(-50, 50)) % height;
	}

	diameter = random(100) + 50;

	stroke(random(125), 100);
	fill(255, 100);
	ellipse(x, y, diameter, diameter);
	x = (x + 5) % ((width + diameter) - diameter/2);
}
