float x, y;
int diameter = 200;

void setup() {
	size(1200, 400);
	background(#AFEEFF);
	noStroke();
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

	fill(255, 200);
	ellipse(x, y, diameter, diameter);
	x = (x + 5) % ((width + diameter) - diameter/2);
}
