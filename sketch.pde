float x, y;
int diameter = 200;

void setup() {
	size(1200, 400);
	background(#AFEEFF);
	x = -diameter/2;
	y = height/2;
}

void draw() {

	if (frameCount % 200 == 0){
		background(#AFEEFF);
	}
	if (frameCount % 20 == 0){
		y = random(height);
	}

	diameter = random(150) + 50;

	stroke(random(255));
	fill(255, 100);
	ellipse(x, y, diameter, diameter);
	x = (x + 5) % ((width + diameter) - diameter/2);
}
