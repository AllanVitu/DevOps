/* ==========================================================================
   SHADER-BG.JS — The ShaderGradient sphere, rendered in plain WebGL.

   ShaderGradient ships as a React + three.js component. This site has no build
   step and no runtime dependencies, so the scene is reproduced here directly:
   same classic-Perlin displacement, same colour formula, same camera framing.
   Two things are simplified on purpose — the mesh is traced per pixel instead
   of tessellated (the camera is zoomed far past the point where triangles
   would show), and the "city" HDR environment becomes a Fresnel term.

   Progressive enhancement: without JS or WebGL the canvas never fades in and
   .backdrop keeps its CSS grid and halos.
   ========================================================================== */
(() => {
    'use strict';

    /* Lifted verbatim from the ShaderGradient export. What is missing from it
       is either a default or export-only (format, frameRate, range, helpers). */
    const P = {
        color1: '#ffffff',
        color2: '#3dfff5',
        color3: '#0700ff',
        uDensity: 1.1,
        uStrength: 1,
        uSpeed: 0.1,
        uTime: 0,
        brightness: 1.1,
        reflection: 0.1,
        cAzimuthAngle: 0,
        cPolarAngle: 140,
        cameraZoom: 17.3,
        fov: 45,
        pixelDensity: 1,
    };

    /* For type="sphere" ShaderGradient ignores cDistance and dollies to a fixed
       14, driving the framing through cameraZoom instead. */
    const DISTANCE = 14;
    /* MeshPhysicalMaterial({ metalness: .2 }); roughness stays at its default. */
    const METALNESS = 0.2;
    /* Bound on the displacement, per unit of uStrength. The shader's own factor
       is 0.75 and cnoise stays inside ±0.98 over the domain sampled here, so
       0.8 brackets the surface with a little room to spare. */
    const MAX_DISPLACEMENT = 0.8;
    /* Steps along the ray, then bisections inside the crossing found. Twelve is
       where the seam at the silhouette stops shrinking — past that the residual
       is the fade below, not the sampling. */
    const MARCH_STEPS = 12;
    /* Penetration depth over which the blob fades in at its own silhouette. */
    const SILHOUETTE_FADE = 0.12;
    /* uSpeed is slow enough that 30fps is indistinguishable from 60, and it
       halves the GPU cost of a decoration nobody looks at directly. */
    const FPS = 30;
    /* glsl-noise/classic/3d hashes its lattice mod 289, so the time offset can
       wrap there seamlessly — which keeps float precision bounded all session. */
    const TIME_PERIOD = 289 / P.uSpeed;

    const VERT = `
attribute vec2 aPos;
varying vec2 vNdc;

void main() {
    vNdc = aPos;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    /* The noise and the two shading lines at the end are ShaderGradient's own;
       the ray setup around them replaces its vertex displacement. */
    const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vNdc;

uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;
uniform vec2 uHalfExtent;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

uniform float uTime;
uniform float uSpeed;
uniform float uNoiseDensity;
uniform float uNoiseStrength;
uniform float uBrightness;
uniform float uReflection;

/* noise source: https://github.com/hughsk/glsl-noise/blob/master/classic/3d.glsl */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

/* ShaderGradient's vertex shader, read as a radial height field: along every
   direction of the unit sphere the surface sits at radius 1 + displacement. */
float surfaceRadius(vec3 dir, float t) {
    return 1.0 + 0.75 * cnoise(0.43 * dir * uNoiseDensity + t) * uNoiseStrength;
}

/* Signed distance from a point to the surface, measured radially: negative
   inside the blob, positive outside. */
float field(vec3 q, float t) {
    return length(q) - surfaceRadius(normalize(q), t);
}

void main() {
    vec3 rd = normalize(uCamFwd
        + uCamRight * vNdc.x * uHalfExtent.x
        + uCamUp * vNdc.y * uHalfExtent.y);
    float t = uTime * uSpeed;

    /* March between two spheres the displacement can never leave, looking for
       the first inward crossing. Iterating on the radius alone is far cheaper
       but oscillates wherever the relief runs steep against the ray (which is
       most of the frame at this zoom), and a single global bracket can settle
       on a later crossing than the one facing us. The inner bound doubles as a
       guard: the centre ray would otherwise reach the origin, where a radial
       field has no direction. */
    float reach = ${MAX_DISPLACEMENT} * uNoiseStrength;
    float outer = 1.0 + reach;
    float inner = max(1.0 - reach, 0.06);
    float b = dot(uCamPos, rd);
    float centre = dot(uCamPos, uCamPos);
    float dOuter = b * b - (centre - outer * outer);
    float dInner = b * b - (centre - inner * inner);
    float tStart = dOuter > 0.0 ? -b - sqrt(dOuter) : -b;
    float tEnd = dInner > 0.0 ? -b - sqrt(dInner) : -b;
    float stride = (tEnd - tStart) / ${MARCH_STEPS}.0;

    float t0 = tStart;
    float f0 = field(uCamPos + rd * t0, t);
    float ta = t0, fa = f0, tb = t0, fb = f0, fMin = f0;
    bool found = false;

    for (int i = 1; i <= ${MARCH_STEPS}; i++) {
        float t1 = tStart + stride * float(i);
        float f1 = field(uCamPos + rd * t1, t);
        if (!found && f1 < 0.0) { found = true; ta = t0; fa = f0; tb = t1; fb = f1; }
        fMin = min(fMin, f1);
        t0 = t1;
        f0 = f1;
    }

    if (found) {
        for (int i = 0; i < 4; i++) {
            float tm = 0.5 * (ta + tb);
            float fm = field(uCamPos + rd * tm, t);
            if (fm < 0.0) { tb = tm; fb = fm; } else { ta = tm; fa = fm; }
        }
    } else {
        tb = tEnd;
        fb = f0;
    }

    /* Subtracting the residual lands p exactly on the surface. */
    vec3 q = uCamPos + rd * tb;
    vec3 dir = normalize(q);
    vec3 p = dir * (length(q) - fb);

    vec3 base = mix(mix(uColor1, uColor2, smoothstep(-3.0, 3.0, p.x)), uColor3, p.z);

    /* An ambientLight of brightness * PI through a Lambert BRDF is just a
       multiply; the clearcoat over the city HDR becomes a Fresnel highlight. */
    vec3 col = base * ${1 - METALNESS} * uBrightness;
    float fresnel = pow(1.0 - clamp(dot(dir, -rd), 0.0, 1.0), 5.0);
    col += (0.04 + 0.96 * fresnel) * uReflection;

    /* At the silhouette the traced point stops being meaningful and the colour
       jumps. Fading out over the last stretch of penetration hides that seam
       behind the page colour, and gives a soft edge instead of a cut-out where
       a wide viewport reaches past the blob. The depth is a min, not an argmin,
       so it stays continuous even where the nearest point flips sides. */
    float alpha = smoothstep(0.0, ${SILHOUETTE_FADE}, -fMin);

    /* The Canvas runs linear + flat, so nothing is tone mapped on the way out. */
    gl_FragColor = vec4(col, alpha);
}`;

    const rad = (deg) => (deg * Math.PI) / 180;

    const rgb = (hex) => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [1, 2, 3].map((i) => parseInt(m[i], 16) / 255) : [0, 0, 0];
    };

    const cross = (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];

    const unit = (v) => {
        const len = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / len, v[1] / len, v[2] / len];
    };

    /* ----------------------------------------------------------------------
       CAMERA
       camera-controls orbits the origin, and the mesh sits there unrotated, so
       world space and the object space the colour formula reads are the same.
       ---------------------------------------------------------------------- */
    function camera() {
        const polar = rad(P.cPolarAngle);
        const azimuth = rad(P.cAzimuthAngle);
        const pos = [
            DISTANCE * Math.sin(polar) * Math.sin(azimuth),
            DISTANCE * Math.cos(polar),
            DISTANCE * Math.sin(polar) * Math.cos(azimuth),
        ];

        const fwd = unit([-pos[0], -pos[1], -pos[2]]);
        // Degenerate only on a pole, where any right vector will do.
        const side = cross(fwd, [0, 1, 0]);
        const right = Math.hypot(side[0], side[1], side[2]) < 1e-6 ? [1, 0, 0] : unit(side);

        return { pos, fwd, right, up: cross(right, fwd) };
    }

    function shader(gl, type, source) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, source);
        gl.compileShader(sh);
        return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }

    /* ----------------------------------------------------------------------
       BOOT
       ---------------------------------------------------------------------- */
    function init() {
        const canvas = document.querySelector('.backdrop-canvas');
        if (!canvas) return;

        // The silhouette fades to transparent, and the canvas paints over its
        // own CSS background colour rather than over the fallback layers.
        const gl = canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'low-power',
        });
        if (!gl) return;

        const vs = shader(gl, gl.VERTEX_SHADER, VERT);
        const fs = shader(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        // One triangle big enough to cover the clip cube — no quad, no indices.
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const u = (name) => gl.getUniformLocation(program, name);
        const cam = camera();
        gl.uniform3fv(u('uCamPos'), cam.pos);
        gl.uniform3fv(u('uCamFwd'), cam.fwd);
        gl.uniform3fv(u('uCamRight'), cam.right);
        gl.uniform3fv(u('uCamUp'), cam.up);
        gl.uniform3fv(u('uColor1'), rgb(P.color1));
        gl.uniform3fv(u('uColor2'), rgb(P.color2));
        gl.uniform3fv(u('uColor3'), rgb(P.color3));
        gl.uniform1f(u('uSpeed'), P.uSpeed);
        gl.uniform1f(u('uNoiseDensity'), P.uDensity);
        gl.uniform1f(u('uNoiseStrength'), P.uStrength);
        gl.uniform1f(u('uBrightness'), P.brightness);
        gl.uniform1f(u('uReflection'), P.reflection);

        const uTime = u('uTime');
        const uHalfExtent = u('uHalfExtent');
        // three.js divides the frustum by camera.zoom; height leads, x follows aspect.
        const halfHeight = Math.tan(rad(P.fov) / 2) / P.cameraZoom;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, P.pixelDensity);
            const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
            gl.uniform2f(uHalfExtent, (halfHeight * w) / h, halfHeight);
        };

        const draw = (elapsed) => {
            resize();
            gl.uniform1f(uTime, elapsed);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            canvas.classList.add('is-live');
        };

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = null;
        let last = 0;
        const start = performance.now();

        const tick = (now) => {
            frame = requestAnimationFrame(tick);
            if (now - last < 1000 / FPS) return;
            last = now;
            draw(((now - start) / 1000) % TIME_PERIOD);
        };

        const play = () => {
            if (frame !== null || reduceMotion.matches || document.hidden) return;
            last = 0;
            frame = requestAnimationFrame(tick);
        };

        const pause = () => {
            if (frame === null) return;
            cancelAnimationFrame(frame);
            frame = null;
        };

        // A still frame is worth painting even when motion is unwelcome.
        draw(P.uTime);

        document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
        reduceMotion.addEventListener('change', () => (reduceMotion.matches ? pause() : play()));
        window.addEventListener('resize', () => {
            if (frame === null) draw(P.uTime);
        });

        // A lost context leaves a blank canvas; fade back to the CSS backdrop.
        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            pause();
            canvas.classList.remove('is-live');
        });

        play();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
