#define PI 3.14159265359

precision highp float;

uniform float uTime;
uniform int uPreset;

uniform float uSeed;
// uniform vec4 var;
uniform float uOctaves;
uniform float uOctaveFalloff;
uniform float uNoiseFrequency;
uniform float uNoiseLacunarity;
uniform float uMainFbmFrequency;
uniform float uMainWarpGain;
uniform vec3 uBaseColor1;
uniform vec3 uBaseColor2;
uniform vec3 uHighlightColor1;
uniform vec3 uHighlightColor2;
uniform vec2 uScrollSpeed;
uniform vec2 uQFrequency;
uniform vec2 uQAmplitude;
uniform vec2 uRFrequency;
uniform float uFbmMode;
uniform float uColorMode;
// uniform float uUvScale;
const float uvScale = 3.0;
uniform vec3 uPaletteBrightness;
uniform vec3 uPaletteContrast;
uniform vec3 uPaletteFrequency;
uniform vec3 uPalettePhase;
uniform float uPalettePhaseOffset;
// uniform float uRandomAngle;
uniform vec2 uScreenSize;
uniform vec2 uScroll;
uniform vec2 uMousePosition;

// varying vec2 vUV;

out vec4 fragColor;

float sinc(float x, float k)
{
    const float a = PI*(k*x-1.0);
    return sin(a)/a;
}

// signed hash function (-1 to 1)
float shash(vec2 p)
{
	// 1.0 if PRESET 5
	float seed = uSeed;
	seed += mix(0.0, floor(uTime * 200) * 0.005, uPreset == 4 || uPreset == 2);
	return -1.0 + 2.0*fract((10000.0 + seed) * sin(17.0 * p.x + p.y * 0.1) *
								(0.1 + abs(sin(p.y * 13.0 + p.x))));
}

// 2D noise
// https://www.shadertoy.com/view/4dS3Wd
float noise(vec2 x)
{
	vec2 i = floor(x);
	vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = shash(i);
	float b = shash(i + vec2(1.0, 0.0));
	float c = shash(i + vec2(0.0, 1.0));
	float d = shash(i + vec2(1.0, 1.0));

	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 x)
{
	float v = 0.0;
	float a = 0.5;
	float maxAmp = a;
	vec2 shift = vec2(100.0);
	// Rotate to reduce axial bias
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

    float freq = uNoiseFrequency;
    float lac = uNoiseLacunarity;
	float octave_falloff = uOctaveFalloff;
	octave_falloff *= 0.8 + 0.2 * sinc(sin(uTime * 0.2), 2);

    const int MAX_OCTAVES = 8;

	for (int i = 0; i < MAX_OCTAVES; i++)
	{
		if (i >= int(uOctaves))
		{
			break;
		}
		v += a * abs(noise(x*freq));
		x = rot * x * 2.01 + shift;
		maxAmp += a*octave_falloff;
		a *= octave_falloff;
		freq *= uNoiseLacunarity;
	}
	if (uFbmMode == 2.0)
	{
		v = 1.0 - v;
		v = pow(v, 5.0);
	}
	
	// Normalize noise value so that maximum amplitude = 1.0
	v /= maxAmp;

	return v;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d)
{
	return a + b * cos(6.28318 * (c * t + d));
}

void main(void)
{
	vec4 var = vec4(0.0);
	var.x = uTime * -0.52;
	var.y = uTime * -0.56;
	var.z = uTime * 0.0164;
	var.w = -uTime * 0.0551;
    float time = uTime;
// 	Normalize coordinates to be aspect-ratio independent
// 	and move 0,0 to center of screen
	float lfo2 = sinc(sin(uTime * 0.4), 2);
	// lfo2 = 1.0;
    vec2 zw = uScreenSize;
	// PRESET 5
	zw.y *= mix(1.0, 0.6 + 0.5 * cos(uTime*2), uPreset == 4);
	// vec2 vUV = gl_FragCoord.xy / zw;
	// vec2 uv = vUV;
	// vec2 uv = (vUV.st * zw) / zw.y + vec2(uScrollSpeed.x*time, uScrollSpeed.y*time);
	vec2 uv = (2.0*vUV.st - 1.0);
	float angle = 0.0;
	angle = mix(angle, radians(uTime*30+uv.x*uv.x*uv.x*20), uPreset == 4);
	// PRESET 1 / 5
	// angle = 0.0;
	float lfo4 = 0.5 * sin(-uTime * 0.2) * 2.0 * cos(0.5 * length(uv * 1.0));
	// PRESET 2
	angle = mix(angle, radians(sinc(fract(uTime*0.2), 4 * lfo4) * 110.0), uPreset == 1);
	angle = mix(angle, mod(uTime, 360.0), uPreset == 3);
	mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
	// uv *= rot;
	uv *= uPreset == 3? mat2(1.0) : rot;
	uv = (uv * zw) / zw.y;
	// PRESET 3
	if (uPreset == 3)
	{
		uv.x = uv.x * cos(abs(uv.y));
		// uv *= uPreset == 3 ? rot : mat2(1.0);
		uv *= rot;
	}
	uv *= 1.0 + lfo2 * 0.5;
	vec2 mouse_position = (uMousePosition * zw) / zw.y;
	float mouse_dist = distance(uv, mouse_position);
	mouse_dist = mix(0.6, 1.0, 1.0 - smoothstep(0.0, 0.5, mouse_dist));
	// uv *= 2.0 * clamp(distance(uv, mouse_position), 0.1, 0.5);
	// uv *= mouse_dist;
	uv -= uScroll;
	uv *= mix(uvScale, 1.0, uPreset == 2);
	// uv.x *= 2.0;
	// uv += vec2(time)*uScrollSpeed;
	uv += uTime * uScrollSpeed;

	vec3 color = vec3(0.0);

	vec2 q = vec2(fbm(uQFrequency.x*uv + vec2(var.x, var.y)),
								fbm(uQFrequency.y*uv + vec2(1.5*(atan(uTime*0.9)), 0.61*sin(uTime*0.53))));

	vec2 r = vec2(fbm(uRFrequency.x*uv + uQAmplitude.x*q + uv + vec2(var.z, var.w)),
								fbm(uRFrequency.y*uv + uQAmplitude.y*q + uv + vec2(0.0*sin(uTime*4.3), uTime*1.23)));


	float lfo1 = 1.0 + 0.5 * sin(uTime * 2.0) * 2.0 * cos(length(uv * 1.0));
	lfo1 = mix(1.0, lfo1, uPreset == 0);
	float lfo3 = fbm(vec2(0.5 + 0.5 * lfo1, 0.5 + 0.5 * lfo2));

	float f = fbm(uMainFbmFrequency*uv + uMainWarpGain*r*lfo1);

	if (uColorMode >= 0.5)
	{
		vec3 a = uPaletteBrightness;
		vec3 b = uPaletteContrast;
		vec3 c = uPaletteFrequency;
		vec3 d = uPalettePhase;
        d = fract(d + uPalettePhaseOffset + uTime);
		color = palette(f, a, b, c, d);
	}
	else
	{
		color = mix(uBaseColor1, uBaseColor2, f);
		// PRESET 3
		r = mix(r, r * 1.0 + 0.04*step(0.5, fract(uTime * 5000)), uPreset == 3);
		color = mix(color, uHighlightColor1, dot(r, r));
		// color = color * step(0.5, fract(uTime * 5000));
		color = mix(color, uHighlightColor2, 0.4*q.y*q.y);
	}

	// heightMap = vec4(vec3(f), 1.0);

	// gl_FragColor = vec4(color, 1.0);
	fragColor = vec4(color, f);
}