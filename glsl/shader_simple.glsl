precision mediump float;
uniform float uv;
void main() {
	// gl_FragColor = vec4(0.18, 0.54, 0.34, 1.0);
	// gl_FragColor = vec4(gl_FragCoord.x/1000.0, 0.0, 0.0, 1.0);
	gl_FragColor = vec4(gl_FragCoord.x/uv, 0.0, 0.0, 1.0);
}
