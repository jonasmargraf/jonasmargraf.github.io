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
    "uStepSize"
];

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');
// Toggle high dpi mode
const adapt_to_device_ratio = false;
// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, adapt_to_device_ratio);


// CreateScene function that creates and return the scene
const createScene = () => {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    const noise_shader = new BABYLON.PostProcess("noise", "./fever_dream_noise", uniforms_noise, null, 1.0, camera);
    const lighting_shader = new BABYLON.PostProcess("lighting", "./lighting_simple", uniforms_lighting, null, 1.0, camera);

    // Return the created scene
    return scene;
};

const scene = createScene();
let time = 0.0;
let divFps = document.getElementById("fps");

// Initialize Assets Manager
let assetsManager = new BABYLON.AssetsManager(scene);
assetsManager.useDefaultLoadingScreen = false;

// Use AssetsManager to load presets from JSON file
let presetsTask = assetsManager.addTextFileTask("presets task", "presets.json");

presetsTask.onSuccess = (task) => {
    presets = JSON.parse(task.text);
};

let presets = [];
let current_preset = 0;
let preset_radios = document.getElementsByName("preset");

preset_radios.forEach(preset_radio => {
    preset_radio.addEventListener("click", () => {
        selectPreset(preset_radio.value);
    });
});

function selectPreset(preset_index) {
    current_preset = preset_index;
    console.log(current_preset);
}

assetsManager.load();

function applyUniformsFromPreset(effect, uniforms, preset) {
    // Iterate over uniforms array, grab stored value for each 
    // element from current preset and pass to shader
    uniforms.forEach(uniform => {
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
}

// Callback for when JSON presets are loaded:
// This starts the render loop
assetsManager.onFinish = (tasks) => {
    let noise_shader = scene.getPostProcessByName("noise");
    let lighting_shader = scene.getPostProcessByName("lighting");

    engine.runRenderLoop(() => {
        // Update FPS display
        divFps.innerHTML = engine.getFps().toFixed() + " fps";
        // Increment timer
        time += engine.getDeltaTime() * scene.getAnimationRatio() * 0.0001;
        // Get uniform values for current preset
        let preset = presets[current_preset];

        // Pass uniforms to shader
        noise_shader.onApply = (effect) => {
            effect.setFloat2("uScreenSize", noise_shader.width, noise_shader.height);
            effect.setFloat("uTime", time);
            applyUniformsFromPreset(effect, uniforms_noise, preset);
        };
        // Pass uniforms to shader
        lighting_shader.onApply = (effect) => {
            effect.setFloat2(
                "uStepSize",
                1.0 / lighting_shader.width,
                1.0 / lighting_shader.height
            );
            effect.setFloat("uTime", time);
            applyUniformsFromPreset(effect, uniforms_lighting, preset);
        };

        scene.render();
    });
};

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});

///////////////////////////////////////////////////////////////////////////
// AUDIO PLAYER STUFF

Amplitude.init({
    songs: [
        {
            "name": "From The Wild Had Been Conquered",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/01.mp3"
        },
        {
            "name": "IRL Angel",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/02.mp3"
        },
        {
            "name": "Cave Song",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/03.mp3"
        },
        {
            "name": "Hands, Folded",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/04.mp3"
        },
        {
            "name": "Last and First Men",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/05.mp3"
        }
    ],
    callbacks: {
        initialized: function() {
            console.log("Amplitude.js initialized.");
            // Have to pause Amplitude after init as a workaround for bug where
            // the time / progress bar doesn't update on mobile / iOS.
            // For more info see:
            // https://github.com/521dimensions/amplitudejs/issues/447
            Amplitude.pause();
        },
        song_change: function() {
            console.log("Song changed.");
            // console.log(Amplitude.getActiveIndex());
            // console.log(selectPreset);
            selectPreset(Amplitude.getActiveIndex());
        }
    }
});