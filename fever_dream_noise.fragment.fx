precision highp float;

uniform float uTime;

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

varying vec2 vUV;

// signed hash function (-1 to 1)
float shash(vec2 p)
{
	return -1.0 + 2.0*fract((10000.0 + uSeed) * sin(17.0 * p.x + p.y * 0.1) *
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

    const int MAX_OCTAVES = 8;
    
    for (int i = 0; i < MAX_OCTAVES; i++)
    {
        if (i >= int(uOctaves))
        {
            break;
        }
        v += a * abs(noise(x*freq));
        x = rot * x * 2.01 + shift;
        maxAmp += a*uOctaveFalloff;
        a *= uOctaveFalloff;
        freq *= uNoiseLacunarity;
    }
    v = 1.0 - v;
    v = pow(v, 5.0);

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
    vec2 zw = uScreenSize;
	// vec2 vUV = gl_FragCoord.xy / zw;
	vec2 uv = (vUV.st * zw) / zw.y + vec2(uScrollSpeed.x*time, uScrollSpeed.y*time);
	uv = ((2.0*vUV.st - 1.0) * zw) / zw.y;
	uv *= uvScale;
	float angle = 45.0;
	mat2 rot = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
	uv *= rot;
	uv += vec2(time)*uScrollSpeed;

	vec3 color = vec3(0.0);

	vec2 q = vec2(fbm(uQFrequency.x*uv + vec2(var.x, var.y)),
								fbm(uQFrequency.y*uv + vec2(1.5*(atan(uTime*0.9)), 0.61*sin(uTime*0.53))));

	vec2 r = vec2(fbm(uRFrequency.x*uv + uQAmplitude.x*q + uv + vec2(var.z, var.w)),
								fbm(uRFrequency.y*uv + uQAmplitude.y*q + uv + vec2(0.0*sin(uTime*4.3), uTime*1.23)));


	float f = fbm(uMainFbmFrequency*uv + uMainWarpGain*r);

	if (uColorMode >= 0.5)
	{
		vec3 a = uPaletteBrightness;
		vec3 b = uPaletteContrast;
		vec3 c = uPaletteFrequency;
		vec3 d = uPalettePhase;
        d = fract(d + uPalettePhaseOffset);
		color = palette(f, a, b, c, d);
	}
	else
	{
		color = mix(uBaseColor1, uBaseColor2, f);
		color = mix(color, uHighlightColor1, dot(r, r));
		color = mix(color, uHighlightColor2, 0.4*q.y*q.y);
	}

	// heightMap = vec4(vec3(f), 1.0);

	gl_FragColor = vec4(color, 1.0);
}