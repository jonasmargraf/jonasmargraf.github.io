// Get the canvas DOM element
var canvas = document.getElementById('renderCanvas');
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

const uniforms_noise = [
    "uTime",
    "uSeed",
    "uOctaves",
    "uOctaveFalloff",
    "uNoiseFrequency",
    "uNoiseLacunarity",
    "uMainFbmFrequency",
    "uMainWarpGain",
    "uBaseColor1",
    "uBaseColor2",
    "uHighlightColor1",
    "uHighlightColor2",
    "uScrollSpeed",
    "uQFrequency",
    "uQAmplitude",
    "uRFrequency",
    "uFbmMode",
    "uColorMode",
    "uPaletteBrightness",
    "uPaletteContrast",
    "uPaletteFrequency",
    "uPalettePhase",
    "uScreenSize"
];

const uniforms_lighting = [
    "uTime",
    "uContrast",
    "uBrightness",
    "uLightColor1",
    "uLightColor2",
    "uLightPosition1",
    "uLightPosition2",
    "uDiffuseStrength",
    "uSpecularStrength",
    "uSpecularExponent",
    "uBumpScale",
    "uScreenSize"
];

// CreateScene function that creates and return the scene
var createScene = () => {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    let noise_shader = new BABYLON.PostProcess("noise", "./fever_dream_noise", uniforms_noise, null, 1.0, camera);
    let lighting_shader = new BABYLON.PostProcess("lighting", "./lighting_simple", uniforms_lighting, null, 1.0, camera);

    // Return the created scene
    return scene;
};

let scene = createScene();
let time = 0.0;
let divFps = document.getElementById("fps");

// Use AssetsManager to load presets from JSON file
let assetsManager = new BABYLON.AssetsManager(scene);
assetsManager.useDefaultLoadingScreen = false;
let presetsTask = assetsManager.addTextFileTask("presets task", "presets.json");
let presets = [];

presetsTask.onSuccess = (task) => {
    presets = JSON.parse(task.text)
};

presetsTask.onError = (task, message, exception) => {
    console.log(message, exception)
};

assetsManager.load();

// Callback for when JSON presets are loaded:
// This starts the render loop
assetsManager.onFinish = (tasks) => {
    let noise_shader = scene.getPostProcessByName("noise")
    let lighting_shader = scene.getPostProcessByName("lighting")
    let preset = presets[0]

    engine.runRenderLoop(() => {
            divFps.innerHTML = engine.getFps().toFixed() + " fps";
            // time += 0.02;
            time += engine.getDeltaTime() * scene.getAnimationRatio() * 0.0001;

            // Pass uniforms to shader
            noise_shader.onApply = (effect) => {
                effect.setFloat2("uScreenSize", noise_shader.width, noise_shader.height);
                effect.setFloat("uTime", time);
                // Iterate over uniforms array, grab stored value for each 
                // element from current preset and pass to shader
                uniforms_noise.forEach(uniform => {
                    if (uniform in preset) {
                        let parameter_from_preset = preset[uniform];
                        // If the uniform is just a float, 
                        // we can call setFloat() directly
                        if (typeof (parameter_from_preset) == "number") {
                            effect.setFloat(uniform, parameter_from_preset);
                        }
                        // If the uniform is some kind of vector, we need
                        // to create a babylon.js vector2/3/4 depending on
                        // how long the array for this parameter is
                        else if (typeof (parameter_from_preset) == "object") {
                            let param = new BABYLON["Vector" + parameter_from_preset.length];
                            param = param.fromArray(parameter_from_preset);
                            effect["setVector" + parameter_from_preset.length](uniform, param);
                        }
                    };
                });
            };

            // Pass uniforms to shader
            lighting_shader.onApply = (effect) => {
                effect.setFloat2(
                    "uScreenSize", 
                    1.0 / lighting_shader.width, 
                    1.0 / lighting_shader.height
                    );
                effect.setFloat("uTime", time);
                // Iterate over uniforms array, grab stored value for each 
                // element from current preset and pass to shader
                uniforms_lighting.forEach(uniform => {
                    if (uniform in preset) {
                        let parameter_from_preset = preset[uniform];
                        // If the uniform is just a float, 
                        // we can call setFloat() directly
                        if (typeof (parameter_from_preset) == "number") {
                            effect.setFloat(uniform, parameter_from_preset);
                        }
                        // If the uniform is some kind of vector, we need
                        // to create a babylon.js vector2/3/4 depending on
                        // how long the array for this parameter is
                        else if (typeof (parameter_from_preset) == "object") {
                            let param = new BABYLON["Vector" + parameter_from_preset.length];
                            param = param.fromArray(parameter_from_preset);
                            effect["setVector" + parameter_from_preset.length](uniform, param);
                        }
                    };
                });
            };
            scene.render();
        });
};

// the canvas/window resize event handler
window.addEventListener('resize', () => {
        engine.resize();
    });