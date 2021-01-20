#ifdef GL_ES
    precision highp float;
#endif

uniform sampler2D textureSampler;

varying vec2 vUV;

void main(void)
{
    vec2 uv = vUV;
    vec4 input_tex = texture(textureSampler, uv);
    vec3 color = input_tex.rgb;

    gl_FragColor = vec4(color, 1.0);
}
