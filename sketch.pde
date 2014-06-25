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

	noFill();
	beginShape();
	vertex(x, y);

	x = (x + 5) % ((width + diameter) - diameter/2);

	if (frameCount % 10 == 0){
		y = (y + random(-50, 50)) % height;
	}

	vertex(x, y);
	endShape();

	diameter = random(80) + 50;

	stroke(random(125), 100);
	fill(255, random(150));
	ellipse(x, y, diameter, diameter);
}
