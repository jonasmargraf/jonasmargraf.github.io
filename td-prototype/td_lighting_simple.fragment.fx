#ifdef GL_ES
    precision highp float;
#endif

// uniform sampler2D textureSampler;
uniform vec2 uStepSize;
uniform vec3 uLightColor1;
uniform vec3 uLightColor2;
uniform vec3 uLightPosition1;
uniform vec3 uLightPosition2;
uniform float uContrast;
uniform float uBrightness;
uniform float uBumpScale;
uniform float uDiffuseStrength;
uniform float uSpecularStrength;
uniform float uSpecularExponent;

// varying vec2 vUV;

out vec4 fragColor;

float getHeight(vec2 uv) {
	// float h = texture2D(textureSampler, uv).a;
	float h = texture2D(sTD2DInputs[0], uv).a;
	return h;
}

vec3 bumpFromDepth(vec2 uv, float scale) {
	vec2 step = uStepSize;
	step *= 8.0;
	// step *= 0.2;

	float height = getHeight(uv);

	vec2 dxy = height - vec2(
		getHeight(uv - vec2(step.x, 0.)),
		getHeight(uv - vec2(0., step.y))
		);

    return normalize(vec3(dxy * scale / step, 1.0));
}

void main(void)
{
    vec2 uv = vUV.st;
    // vec4 input_tex = texture2D(textureSampler, uv);
    vec4 input_tex = texture2D(sTD2DInputs[0], uv);
    vec3 color = input_tex.rgb;

	float bumpScale = uBumpScale * 0.01;
	vec3 normal = bumpFromDepth(uv, bumpScale);
	// vec3 specNormal = bumpFromDepth(uv, bumpScale);
    vec3 specNormal = normal;
	vec3 normalSpec = normal;
	// normal = 0.4 + 0.60 * normal;

	float ambientStrength = 0.2;
	vec3 ambient = ambientStrength * uLightColor1;

	vec3 lightDirection1 = normalize(uLightPosition1 - normal);
	vec3 lightDirection2 = normalize(uLightPosition2 - normal);
	float diff = max(dot(normal, lightDirection1), 0.0);
	float diff2 = max(dot(normal, lightDirection2), 0.0);
	vec3 diffuse = diff * uLightColor1;
	vec3 diffuse2 = diff2 * uLightColor2;
	diffuse *= uDiffuseStrength;
	diffuse2 *= uDiffuseStrength;
	diffuse += diffuse2;

	color *= dot(normal, vec3(1.0));
	normal = specNormal;
	float specular = dot(normalize(reflect(vec3(-2.0, 0.0, 10.0), normal)), normalize(vec3(2.0, 1.0, -9.0)));
	specular = pow(specular, uSpecularExponent);
	specular *= uSpecularStrength;
	specular = clamp(specular, 0.0, 1.0);

	color *= ambient + diffuse;
	color += specular;

	color = (color - 0.5) * uContrast + 0.5 + uBrightness;

	color = clamp(color, 0.0, 1.0);

   	fragColor = vec4(color, 1.0);
}
