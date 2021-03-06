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
// const div_more = "<div style='height:1000px; z-index:-100;'></div>";
const interface_overlay = document.getElementById("interface");
const info_panels = document.getElementsByClassName("info-panel")
const otium_button = document.getElementById("otium-button");
const info_button = document.getElementById("info-button");
const info_button_open = document.getElementById("info-button-open");
const info_button_close = document.getElementById("info-button-close");
const player = document.getElementById("player");
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
// For random initial state use current time (% 100 to avoid overflow issues)
let time = Date.now() % 100;
let song_start_time = time;
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
}

function fade_in() {
    const canvas_container = document.getElementById("canvasContainer");
    canvas_container.classList.remove("brightness-fade-out");
    canvas_container.classList.add("brightness-fade-in");
}

function fade_out() {
    const canvas_container = document.getElementById("canvasContainer");
    canvas_container.classList.remove("brightness-fade-in");
    canvas_container.classList.add("brightness-fade-out");
}

let info_open = false;

function show_info() {
    info_button_open.style.display = "none";
    info_button_close.style.display = "inline-block";
    interface_overlay.classList.remove("no-background");
    interface_overlay.classList.add("background");
    canvas.classList.remove("no-blur");
    canvas.classList.add("blur");
    for (let panel of info_panels) {
        panel.classList.remove("hide");
        panel.classList.add("show");
    }
    player.classList.remove("show");
    player.classList.add("hide");
    otium_button.classList.remove("show");
    otium_button.classList.add("hide");
}

function hide_info() {
    info_button_close.style.display = "none";
    info_button_open.style.display = "inline";
    interface_overlay.classList.remove("background");
    interface_overlay.classList.add("no-background");
    canvas.classList.remove("blur");
    canvas.classList.add("no-blur");
    for (let panel of info_panels) {
        panel.classList.remove("show");
        panel.classList.add("hide");
    }
    player.classList.remove("hide");
    player.classList.add("show");
    otium_button.classList.remove("hide");
    otium_button.classList.add("show");
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
        let time_inc = engine.getDeltaTime() * scene.getAnimationRatio() * 0.0001 * 0.5;
        // if (Amplitude.getPlayerState() != "playing") {
            // time_inc *= 0.5;
        // }
        time += time_inc;
        // Get uniform values for current preset
        let preset = presets[current_preset];

        // Pass uniforms to shader
        noise_shader.onApply = (effect) => {
            effect.setInt("uPreset", current_preset);
            effect.setFloat2("uScreenSize", noise_shader.width, noise_shader.height);
            effect.setFloat("uTime", time);
            applyUniformsFromPreset(effect, uniforms_noise, preset);
            effect.setFloat2("uScroll", scroll_x, scroll_y);
            effect.setFloat2("uMousePosition", mouse_x, mouse_y);
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

Amplitude.init({
    volume: 100,
    songs: [
        {
            "name": "From The Wild Had Been Conquered",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/01_Jonas Margraf_From The Wild Had Been Conquered.mp3",
            "time_callbacks": {
                0: fade_in,
                // 1: function() {
                //     console.log("here");
                //     fade_in();
                // }
                // 1: fade_in(),
                255: fade_out
            }
        },
        {
            "name": "IRL Angel",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/02_Jonas Margraf_IRL Angel.mp3",
            "time_callbacks": {
                1: fade_in,
                283: fade_out
            }
        },
        {
            "name": "Anchialine Pool",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/03_Jonas Margraf_Anchialine Pool.mp3",
            "time_callbacks": {
                1: fade_in,
                226: fade_out
            }
        },
        {
            "name": "Hands, Folded",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/04_Jonas Margraf_Hands, Folded.mp3",
            "time_callbacks": {
                1: fade_in,
                191: fade_out
            }
        },
        {
            "name": "Last and First Men",
            "artist": "Jonas Margraf",
            "album": "Drown In Ur Presence",
            "url": "audio/05_Jonas Margraf_Last And First Men.mp3",
            "time_callbacks": {
                1: fade_in,
                341: function() {
                    fade_out();
                    info_open = !info_open;
                    show_info();
                }
            }
        }
    ],
    callbacks: {
        initialized: function() {
            // Have to pause Amplitude after init as a workaround for bug where
            // the time / progress bar doesn't update on mobile / iOS.
            // For more info see:
            // https://github.com/521dimensions/amplitudejs/issues/447
            Amplitude.pause();
        },
        song_change: function() {
            selectPreset(Amplitude.getActiveIndex());
            const song_index = document.getElementById("song-index");
            const index = Amplitude.getActiveIndex() + 1;
            const track_number = "0" + index + "."
            song_index.innerHTML = track_number;
        },
        play: function() {
            const play = document.getElementById("play-icon");
            const pause = document.getElementById("pause-icon");
            play.style.display = "none";
            pause.style.display = "inline"
        },
        pause: function() {
            const play = document.getElementById("play-icon");
            const pause = document.getElementById("pause-icon");
            pause.style.display = "none";
            play.style.display = "inline"
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
});

window.addEventListener("mousemove", (event) => {
    mouse_x = event.clientX / canvas.width;
    mouse_y = event.clientY / canvas.height;
    mouse_y = 1.0 - mouse_y;
    mouse_x = 2.0 * mouse_x - 1.0;
    mouse_y = 2.0 * mouse_y - 1.0;
});

window.addEventListener("touchmove", (event) => {
    mouse_x = event.touches[0].clientX / canvas.width;
    mouse_y = event.touches[0].clientY / canvas.height;
    mouse_y = 1.0 - mouse_y;
    mouse_x = 2.0 * mouse_x - 1.0;
    mouse_y = 2.0 * mouse_y - 1.0;
});

window.addEventListener("scroll", (event) => {
    scroll_x = window.scrollX / canvas.width;
    scroll_y = window.scrollY / canvas.height;
});

const mute_button = document.getElementById("mute-button");
const icon_sound_on = document.getElementById("icon-sound-on");
const icon_sound_off = document.getElementById("icon-sound-off");
mute_button.addEventListener("click", (e) => {
    if (e.target.id == "icon-sound-off") {
        icon_sound_off.style.display = "none";
        icon_sound_on.style.display = "inline";
    }
    else if (e.target.id == "icon-sound-on") {
        icon_sound_on.style.display = "none";
        icon_sound_off.style.display = "inline";
    }
});

info_button.addEventListener("click", () => {
    info_open = !info_open;
    info_open ? show_info() : hide_info();
});

const landing_overlay = document.getElementById("landing");
const interface_elements = document.getElementsByClassName("interface-element");

const enter_buttons = document.getElementsByClassName("enter");

[].forEach.call(enter_buttons, (e) => {
    e.addEventListener("click", () => {
        landing_overlay.classList.add("hide");
        landing_overlay.addEventListener("transitionend", () => {
            landing_overlay.style.display = "none";
        });
        canvas.classList.remove("blur");
        canvas.classList.add("no-blur");
        for (let e of interface_elements) {
            e.classList.remove("hide");
            e.classList.add("show");
        }
    });
});