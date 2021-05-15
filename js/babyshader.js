const uniforms_noise = [
    "uTime",
    "uPreset",
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
    "uScreenSize",
    "uScroll",
    "uMousePosition"
];

const uniforms_lighting = [
    "uTime",
    "uPreset",
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

const holder = document.getElementById("holder");
const div_more = "<div style='height:1000px; z-index:-100;'></div>";
// Get the canvas DOM element
const canvas = document.getElementById("renderCanvas");
// Toggle high dpi mode
const adapt_to_device_ratio = false;
// Load the 3D engine
const engine_options = { 
    preserveDrawingBuffer: true,
    stencil: true,
    doNotHandleTouchAction: true,
    // premultipliedAlpha: false
};
const engine = new BABYLON.Engine(canvas, true, engine_options, adapt_to_device_ratio);

// CreateScene function that creates and returns the scene
const createScene = () => {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    // camera.attachControl(canvas, false);

    const noise_shader = new BABYLON.PostProcess("noise", "/glsl/fever_dream_noise", uniforms_noise, null, 1.0, camera);
    const lighting_shader = new BABYLON.PostProcess("lighting", "/glsl/lighting_simple", uniforms_lighting, null, 1.0, camera);

    // Return the created scene
    return scene;
};

const scene = createScene();
let time = 0.0;
let song_start_time = 0.0;
let mouse_x = 0.0;
let mouse_y = 0.0;
let scroll_x = 0.0;
let scroll_y = 0.0;
// let divFps = document.getElementById("fps");

// Initialize Assets Manager
let assetsManager = new BABYLON.AssetsManager(scene);
assetsManager.useDefaultLoadingScreen = false;

// Use AssetsManager to load presets from JSON file
let presetsTask = assetsManager.addTextFileTask("presets task", "/data/presets.json");

presetsTask.onSuccess = (task) => {
    presets = JSON.parse(task.text);
};

let presets = [];
let current_preset = 0;

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
        // divFps.innerHTML = engine.getFps().toFixed();
        // Increment timer
        time += engine.getDeltaTime() * scene.getAnimationRatio() * 0.0001 * 0.5;
        // Get uniform values for current preset
        let preset = presets[current_preset];

        // analyzer.getFloatFrequencyData(freq_array);
        if (Amplitude.getPlayerState() === "playing"){
            // const current_time = analyzer.context.currentTime - song_start_time;
            // console.log(current_time);
        }
        // console.log(analyzer.context.getOutputTimestamp())

        // Pass uniforms to shader
        noise_shader.onApply = (effect) => {
            effect.setInt("uPreset", current_preset);
            effect.setFloat2("uScreenSize", noise_shader.width, noise_shader.height);
            effect.setFloat("uTime", time);
            applyUniformsFromPreset(effect, uniforms_noise, preset);
            // effect.setFloat("uOctaveFalloff", mouse_x);
            effect.setFloat2("uScroll", scroll_x, scroll_y);
            effect.setFloat2("uMousePosition", mouse_x, mouse_y);
            // const noise_freq = preset["uNoiseFrequency"] + 0.005 * (100.0 - Math.abs(Math.max(freq_array[1], -100.0)));
            // console.log(noise_freq);
            // effect.setFloat("uNoiseFrequency", noise_freq);
        };
        // Pass uniforms to shader
        lighting_shader.onApply = (effect) => {
            effect.setInt("uPreset", current_preset);
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

///////////////////////////////////////////////////////////////////////////
// AUDIO PLAYER STUFF

let analyzer = null;
const fft_bin_count = 16;
const freq_array = new Float32Array(fft_bin_count);

function configureAnalyzer() {
    console.log("hey");
    analyzer = Amplitude.getAnalyser();
    analyzer.fftSize = fft_bin_count * 2;
    analyzer.smoothingTimeConstant = 0.99999;
    // analyzer.smoothingTimeConstant = 1.0;
    console.log(analyzer);
    const context = analyzer.context;
    const audio_element = Amplitude.getAudio();
    const audio_node = context.createMediaElementSource(audio_element);
    audio_node.connect(analyzer);
}

Amplitude.init({
    songs: [
        {
            "name": "From The Wild Had Been Conquered",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/01_Jonas Margraf_From The Wild Had Been Conquered.mp3"
        },
        {
            "name": "IRL Angel",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/02_Jonas Margraf_IRL Angel.mp3"
        },
        {
            "name": "Anchialine Pool",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/03_Jonas Margraf_Anchialine Pool.mp3"
        },
        {
            "name": "Hands, Folded",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/04_Jonas Margraf_Hands, Folded.mp3"
        },
        {
            "name": "Last and First Men",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/05_Jonas Margraf_Last And First Men.mp3"
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
            // configureAnalyzer();
        },
        song_change: function() {
            console.log("Song changed.");
            // console.log(Amplitude.getActiveIndex());
            // console.log(selectPreset);
            selectPreset(Amplitude.getActiveIndex());
        },
        play: function() {
            console.log("play");
            // console.log(Amplitude.getAnalyser().context);
            // song_start_time = Amplitude.getAnalyser().context.currentTime;
            // console.log(song_start_time);
            const button = document.getElementById("play-pause-icon");
            button.innerHTML = "pause";
        },
        pause: function() {
            console.log("pause");
            const button = document.getElementById("play-pause-icon");
            button.innerHTML = "play_arrow";
        },
        playing: function() {
            console.log("playing");
            song_start_time = Amplitude.getAnalyser().context.currentTime;
            // console.log(song_start_time);
        }
    }
});

///////////////////////////////////////////////////////////////////////////
// Callbacks & Event Handlers

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    canvas.width = Math.min(canvas.width, 200);
    canvas.height = Math.min(canvas.height, 200);
    engine.resize();
    console.log(canvas);
});

window.addEventListener("mousemove", (event) => {
    mouse_x = event.clientX / canvas.width;
    mouse_y = event.clientY / canvas.height;
    mouse_y = 1.0 - mouse_y;
    mouse_x = 2.0 * mouse_x - 1.0;
    mouse_y = 2.0 * mouse_y - 1.0;
//     mouse_y *= 5.0;
//     mouse_y += 1.0;
    // console.log(mouse_x, mouse_y);
});

window.addEventListener("touchmove", (event) => {
    mouse_x = event.touches[0].clientX / canvas.width;
    mouse_y = event.touches[0].clientY / canvas.height;
    mouse_y = 1.0 - mouse_y;
    mouse_x = 2.0 * mouse_x - 1.0;
    mouse_y = 2.0 * mouse_y - 1.0;
    // mouse_x = mouse_x - 0.5;
    // mouse_y = mouse_y - 0.5;
//     mouse_y *= 5.0;
//     mouse_y *= 5.0;
//     mouse_y += 1.0;
//     // console.log(mouse_x, mouse_y);
});

window.addEventListener("scroll", (event) => {
    scroll_x = window.scrollX / canvas.width;
    scroll_y = window.scrollY / canvas.height;
    // console.log(event)
    // if ((window.scrollY + window.innerHeight + 100) > document.body.scrollHeight) {
        // holder.innerHTML += div_more;
    // };
});

// holder.innerHTML += div_more;

window.addEventListener("click", (event) => {
    // console.log(time);
    console.log(presets[current_preset])

    // const analyser = Amplitude.getAnalyser();
    // analyser.fftSize = 32;
    // const context = analyser.context;
    // console.log(analyser)
    // const audio_element = Amplitude.getAudio();
    // // console.log(audio_element);
    // const audio_node = context.createMediaElementSource(audio_element);
    // audio_node.connect(analyser);
    // const freq_array = new Float32Array(analyser.frequencyBinCount);

    // analyzer.getFloatFrequencyData(freq_array);
    // console.log(freq_array);
});

// window.scrollTo(0, 1000);
window.addEventListener("load",function() {
    setTimeout(function() {
        window.scrollTo(0, 1000);
    }, 1000);
});

