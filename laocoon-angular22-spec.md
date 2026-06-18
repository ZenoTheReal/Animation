# Recreate this site as an Angular 22 Application: Laocoön — Bronze and Time

You are an expert Angular 22 developer. Produce a **fully standalone Angular 22 application** that
reproduces the project below **exactly** — same layout, sections, visuals, motion, and interaction.
Use Angular CLI conventions, standalone components, **zoneless change detection**, and **signal-based
reactivity** throughout. No NgModules. No zone.js. Every state mutation flows through signals.

---

## What it is

A cinematic, scroll-driven landing page titled **"Bronze and Time"** centered on a glowing,
semi-polished **bronze horse** sculpture rendered in WebGL on a deep-black stage. The camera flies
a full 360° orbit around the statue as you scroll through a very tall page (900vh); molten **forge
sparks** rise around it; a slow **liquid-bronze wave shader** breathes in the background, shifting
its palette from molten bronze at the top to deep sapphire blue at the bottom. Over the canvas sits
an editorial overlay: a fixed header (brand + nav + Contact button), four text "slides" that fade in
at scroll milestones with per-letter blur-up animation, a five-line vertical grid with drifting
dots, a stories-style scroll progress bar, and a custom double-ring cursor. Fonts are *Italiana*
(display headings) and *Outfit* (body). The whole thing is dark, slow, and luxurious.

---

## Angular 22 Project Setup

### Prerequisites & Scaffolding

```bash
ng new laocoon --standalone --style=scss --routing=false --skip-tests
cd laocoon
npm install three
npm install --save-dev @types/three
```

> **Angular 22 note:** `--standalone` is the default; NgModules are opt-in only. The flag is
> included for explicitness.

---

### `package.json` (key dependencies)

```json
{
  "dependencies": {
    "@angular/animations": "^22.0.0",
    "@angular/common":     "^22.0.0",
    "@angular/core":       "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@angular/build": "^22.0.0",
    "@angular/cli":  "^22.0.0",
    "@types/three":  "^0.160.0",
    "typescript":    "~5.5.0"
  }
}
```

---

### `tsconfig.json` (key settings)

```json
{
  "compilerOptions": {
    "target":               "ES2022",
    "module":               "ES2022",
    "moduleResolution":     "bundler",
    "useDefineForClassFields": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata":  true,
    "strict":               true,
    "skipLibCheck":         true
  }
}
```

---

### `angular.json` (key build settings)

```json
{
  "projects": {
    "laocoon": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "index": "src/index.html",
            "styles": ["src/styles.scss"],
            "assets": ["src/assets"]
          }
        }
      }
    }
  }
}
```

---

### `src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Statue of Laocoön</title>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

### `src/main.ts` — Zoneless bootstrap

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig }             from './app/app.config';
import { AppComponent }          from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

---

### `src/app/app.config.ts` — Providers

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),   // zone.js-free — Angular 22 stable API
  ]
};
```

> **Angular 22 note:** `provideZonelessChangeDetection()` graduated from experimental in v19 and is
> the production default by v22. Do **not** import `zone.js` anywhere.

---

## Global Styles — `src/styles.scss`

```scss
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Outfit:wght@300;400;600&family=Playfair+Display:ital,wght@1,500&display=swap');

*, *::before, *::after {
  margin: 0; padding: 0;
  box-sizing: border-box;
  user-select: none;
  cursor: none !important;
}

html, body {
  width: 100%; margin: 0; padding: 0;
  background-color: #000000;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar { display: none; width: 0; }
}

body {
  min-height: 900vh;
  font-family: 'Outfit', sans-serif;
  color: #ffffff;
  overflow-x: hidden;
  cursor: none;
}
```

---

## Project File Structure

```
src/
├── index.html
├── main.ts
├── styles.scss
└── app/
    ├── app.component.ts          ← root shell, composes all components
    ├── app.config.ts             ← zoneless providers
    ├── constants/
    │   └── scene.constants.ts    ← all hardcoded values (URLs, scroll ranges, lights…)
    ├── services/
    │   ├── scroll.service.ts     ← smoothed scroll signal + slide-active computed signals
    │   ├── cursor.service.ts     ← cursor XY signals + normalised mouse signals
    │   └── three-scene.service.ts← entire Three.js scene: init, load, update, loop
    ├── pipes/
    │   └── char-split.pipe.ts    ← transforms a title string → CharToken[] for @for
    └── components/
        ├── cursor/
        │   └── cursor.component.ts
        ├── header/
        │   ├── header.component.ts
        │   └── header.component.scss
        ├── slide/
        │   ├── slide.component.ts
        │   └── slide.component.scss
        ├── image-mask/
        │   ├── image-mask.component.ts
        │   └── image-mask.component.scss
        ├── grid-overlay/
        │   ├── grid-overlay.component.ts
        │   └── grid-overlay.component.scss
        └── webgl-canvas/
            ├── webgl-canvas.component.ts
            └── webgl-canvas.component.scss
```

---

## Constants — `src/app/constants/scene.constants.ts`

Hardcode every value here; import into services and components. Never scatter magic numbers.

```typescript
export const ASSET_BASE_URL =
  'https://api.getlayers.ai/storage/v1/object/public/public/assets/laocoon-59f84455c6';

export const MODEL_URL    = `${ASSET_BASE_URL}/bronze_horse.glb`;
export const IMAGE_1_URL  = `${ASSET_BASE_URL}/1.png`;

// Scroll active windows [start, end]
export const SLIDE_RANGES = [
  [-0.10, 0.12],   // slide-1
  [ 0.28, 0.40],   // slide-2
  [ 0.56, 0.68],   // slide-3
  [ 0.84, 1.05],   // slide-4
] as const;

// Nav click → target scroll fraction
export const NAV_TARGETS = [0.0, 0.34, 0.62, 0.94] as const;

// Three.js constants
export const SPARK_COUNT        = 450;
export const MODEL_TARGET_SCALE = 3.5;
export const PIVOT_Y_OFFSET     = -0.4;
export const CAMERA_START       = { x: 0, y: 0.2, z: 3.0 } as const;
export const TONE_MAPPING_EXPOSURE = 2.2;

// Material
export const BRONZE_ROUGHNESS  = 0.42;
export const BRONZE_METALNESS  = 0.92;
export const MAP_ANISOTROPY    = 16;

// Lerp factors
export const LERP_SCROLL       = 0.025;
export const LERP_MOUSE        = 0.05;
export const LERP_OUTER_CURSOR = 0.2;
export const LERP_CAMERA       = 0.025;
```

---

## Services

### `src/app/services/scroll.service.ts`

Owns all scroll state. Tracks raw `window.scrollY`, smooths it via a lerp each rAF tick, and
exposes **read-only computed signals** for each slide's active state and stories-dash progress.
All writes are internal; components inject the service and read signals only.

```typescript
import {
  Injectable, signal, computed, effect, inject, DestroyRef, untracked
} from '@angular/core';
import { SLIDE_RANGES } from '../constants/scene.constants';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly destroyRef = inject(DestroyRef);

  // ── Raw & smoothed progress [0..1] ──────────────────────────────────────
  private readonly _targetScroll  = signal(0);
  private readonly _currentScroll = signal(0);

  readonly targetScroll  = this._targetScroll.asReadonly();
  readonly currentScroll = this._currentScroll.asReadonly();

  // ── Scroll velocity (for spark turbulence) ───────────────────────────────
  readonly scrollVelocity = computed(() =>
    Math.abs(this._targetScroll() - this._currentScroll()));

  // ── Per-slide active flags ───────────────────────────────────────────────
  readonly slide1Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[0][0] && s <= SLIDE_RANGES[0][1];
  });
  readonly slide2Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[1][0] && s <= SLIDE_RANGES[1][1];
  });
  readonly slide3Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[2][0] && s <= SLIDE_RANGES[2][1];
  });
  readonly slide4Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[3][0] && s <= SLIDE_RANGES[3][1];
  });

  // ── Per-dash fill heights [0..1] ─────────────────────────────────────────
  readonly dashProgress = computed<[number, number, number, number]>(() => {
    const s = this._currentScroll();
    return [0, 1, 2, 3].map(i => {
      const start = i * 0.25, end = (i + 1) * 0.25;
      return Math.max(0, Math.min(1, (s - start) / (end - start)));
    }) as [number, number, number, number];
  });

  constructor() {
    // Listen to scroll outside Angular change detection — zoneless-safe
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this._targetScroll.set(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() =>
      window.removeEventListener('scroll', onScroll));
  }

  /** Called every rAF tick (from ThreeSceneService animation loop). */
  tick(lerp: number): void {
    const t = this._targetScroll();
    const c = this._currentScroll();
    this._currentScroll.set(c + (t - c) * lerp);
  }
}
```

---

### `src/app/services/cursor.service.ts`

Owns mouse position as signals. Inner cursor updates instantly; outer cursor is lerped each tick.

```typescript
import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { LERP_OUTER_CURSOR } from '../constants/scene.constants';

@Injectable({ providedIn: 'root' })
export class CursorService {
  private readonly destroyRef = inject(DestroyRef);

  // Pixel positions
  private readonly _innerX = signal(window.innerWidth  / 2);
  private readonly _innerY = signal(window.innerHeight / 2);
  private readonly _outerX = signal(window.innerWidth  / 2);
  private readonly _outerY = signal(window.innerHeight / 2);

  // Normalised mouse [-1..1] for Three.js
  private readonly _mouseNormX = signal(0);
  private readonly _mouseNormY = signal(0);

  // Smoothed normalised mouse (lerped in tick)
  private _smoothMouseX = 0;
  private _smoothMouseY = 0;

  readonly innerX     = this._innerX.asReadonly();
  readonly innerY     = this._innerY.asReadonly();
  readonly outerX     = this._outerX.asReadonly();
  readonly outerY     = this._outerY.asReadonly();
  readonly smoothMouseX = () => this._smoothMouseX;
  readonly smoothMouseY = () => this._smoothMouseY;

  constructor() {
    const onMove = (e: MouseEvent) => {
      this._innerX.set(e.clientX);
      this._innerY.set(e.clientY);
      this._mouseNormX.set((e.clientX / window.innerWidth)  * 2 - 1);
      this._mouseNormY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove);
    this.destroyRef.onDestroy(() =>
      window.removeEventListener('mousemove', onMove));
  }

  /** Called every rAF tick. Lerps the outer ring and smooths mouse. */
  tick(lerpOuter: number, lerpMouse: number): void {
    const ix = this._innerX(), iy = this._innerY();
    this._outerX.set(this._outerX() + (ix - this._outerX()) * lerpOuter);
    this._outerY.set(this._outerY() + (iy - this._outerY()) * lerpOuter);
    this._smoothMouseX += (this._mouseNormX() - this._smoothMouseX) * lerpMouse;
    this._smoothMouseY += (this._mouseNormY() - this._smoothMouseY) * lerpMouse;
  }
}
```

---

### `src/app/services/three-scene.service.ts`

Owns the entire Three.js scene. Initialised once with a canvas reference; updated every rAF tick.
Injects `ScrollService` and `CursorService` and reads their values directly — no subscriptions,
no Observables; just plain signal reads inside the tight rAF loop.

```typescript
import { Injectable, inject, DestroyRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ScrollService } from './scroll.service';
import { CursorService  } from './cursor.service';
import {
  MODEL_URL, SPARK_COUNT, MODEL_TARGET_SCALE, PIVOT_Y_OFFSET,
  CAMERA_START, TONE_MAPPING_EXPOSURE, BRONZE_ROUGHNESS, BRONZE_METALNESS,
  MAP_ANISOTROPY, LERP_SCROLL, LERP_MOUSE, LERP_OUTER_CURSOR, LERP_CAMERA
} from '../constants/scene.constants';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private readonly scrollService = inject(ScrollService);
  private readonly cursorService = inject(CursorService);
  private readonly destroyRef    = inject(DestroyRef);

  private scene!:       THREE.Scene;
  private camera!:      THREE.PerspectiveCamera;
  private renderer!:    THREE.WebGLRenderer;
  private clock =       new THREE.Clock();
  private mixer?:       THREE.AnimationMixer;

  private modelPivot?:  THREE.Group;
  private sparkParticles?: THREE.Points;
  private sparkData:    SparkDatum[] = [];

  private bgMaterial?:  THREE.ShaderMaterial;
  private shaderUniforms = {
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uScroll:     { value: 0 },
  };

  private sizes = { width: window.innerWidth, height: window.innerHeight };
  private rafId = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Public init — called by WebglCanvasComponent after view renders
  // ─────────────────────────────────────────────────────────────────────────
  init(canvas: HTMLCanvasElement): void {
    this.buildScene();
    this.buildCamera();
    this.createBackgroundShader();
    this.buildRenderer(canvas);
    this.buildLights();
    this.createSparks();
    this.loadModel();
    this.bindResize();
    this.startLoop();
    this.destroyRef.onDestroy(() => this.teardown());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Scene / Camera / Renderer
  // ─────────────────────────────────────────────────────────────────────────
  private buildScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000000');
    this.scene.fog = new THREE.FogExp2('#000000', 0.01);
  }

  private buildCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      50, this.sizes.width / this.sizes.height, 0.1, 100
    );
    this.camera.position.set(CAMERA_START.x, CAMERA_START.y, CAMERA_START.z);
    this.scene.add(this.camera);
  }

  private buildRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lights (dramatic chiaroscuro)
  // ─────────────────────────────────────────────────────────────────────────
  private buildLights(): void {
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.1));

    const key = new THREE.SpotLight('#ffffff', 18.0);
    key.position.set(4, 6, 3);
    key.angle = Math.PI / 4;
    key.penumbra = 0.9;
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1.0;
    key.shadow.camera.far  = 15;
    key.shadow.bias = -0.001;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight('#e3f2ff', 10.0);
    rim.position.set(-5, 3, -4);
    this.scene.add(rim);

    const fill = new THREE.DirectionalLight('#fff3e6', 0.8);
    fill.position.set(-2, -4, 2);
    this.scene.add(fill);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Forge sparks
  // ─────────────────────────────────────────────────────────────────────────
  private createSparkTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.6,  'rgba(255,255,255,0.3)');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(c);
  }

  private createSparks(): void {
    const geo  = new THREE.BufferGeometry();
    const pos  = new Float32Array(SPARK_COUNT * 3);
    const col  = new Float32Array(SPARK_COUNT * 3);

    for (let i = 0; i < SPARK_COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 6.5;
      pos[i*3+1] = (Math.random() - 0.5) * 5.0 - 0.5;
      pos[i*3+2] = (Math.random() - 0.5) * 6.5;

      if (Math.random() < 0.6) {
        col[i*3] = 1.0; col[i*3+1] = 0.4 + Math.random()*0.15; col[i*3+2] = 0.05 + Math.random()*0.1;
      } else {
        col[i*3] = 0.55 + Math.random()*0.15; col[i*3+1] = 0.82 + Math.random()*0.12; col[i*3+2] = 1.0;
      }

      this.sparkData.push({
        speedX: (Math.random()-0.5)*0.4, speedY: 0.15+Math.random()*0.3, speedZ: (Math.random()-0.5)*0.4,
        swaySpeed: 0.5+Math.random()*1.5, swayRadius: 0.05+Math.random()*0.15, phase: Math.random()*Math.PI*2
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    this.sparkParticles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.025, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, map: this.createSparkTexture()
    }));
    this.scene.add(this.sparkParticles);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Model load
  // ─────────────────────────────────────────────────────────────────────────
  private loadModel(): void {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        this.modelPivot = new THREE.Group();
        this.scene.add(this.modelPivot);
        this.modelPivot.add(model);

        model.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = mesh.receiveShadow = true;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.roughness = BRONZE_ROUGHNESS;
              mat.metalness = BRONZE_METALNESS;
              mat.flatShading = false;
              if (mat.map) mat.map.anisotropy = MAP_ANISOTROPY;
            }
          }
        });

        if (gltf.animations?.length) {
          this.mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => this.mixer!.clipAction(clip).play());
        }

        // Scale → max dim 3.5
        const b0 = new THREE.Box3().setFromObject(model);
        const s0 = b0.getSize(new THREE.Vector3());
        const maxDim = Math.max(s0.x, s0.y, s0.z);
        model.scale.setScalar(MODEL_TARGET_SCALE / (maxDim > 0.0001 ? maxDim : 1));
        model.updateMatrixWorld(true);

        // Recenter inside pivot
        const center = new THREE.Box3()
          .setFromObject(model)
          .getCenter(new THREE.Vector3());
        model.position.sub(center);
        this.modelPivot.position.y = PIVOT_Y_OFFSET;
      },
      undefined,
      err => console.error('Error loading bronze horse:', err)
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Background liquid-bronze wave shader
  // (same GLSL verbatim — only moved from inline script to service method)
  // ─────────────────────────────────────────────────────────────────────────
  private createBackgroundShader(): void {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`;

    const fragmentShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2  uResolution;
      uniform vec2  uMouse;
      uniform float uScroll;

      float hash(float n){ return fract(sin(n)*43758.5453123); }
      float noise(in vec3 x){
        vec3 p=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
        float n=p.x+p.y*57.0+113.0*p.z;
        return mix(mix(mix(hash(n+0.0),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y),
                   mix(mix(hash(n+113.0),hash(n+114.0),f.x),mix(hash(n+170.0),hash(n+171.0),f.x),f.y),f.z);
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*uResolution.xy)/uResolution.y;
        float aspect=uResolution.x/uResolution.y;
        float time=uTime*0.08;
        float scroll=uScroll;

        float angle1=0.6,angle2=-0.7,angle3=1.2;
        float freq1=2.4,freq2=3.2,freq3=4.0;

        vec2 warpedUv=uv;
        float scrollDeform=scroll*5.0;
        warpedUv.x+=sin(uv.y*2.5+time*0.2+scrollDeform)*0.35;
        warpedUv.y+=cos(uv.x*2.5-time*0.15-scrollDeform*0.8)*0.35;
        warpedUv.x+=sin(uv.y*1.2-time*0.1-scrollDeform*1.5)*0.25;
        warpedUv.y+=cos(uv.x*1.2+time*0.18+scrollDeform*1.2)*0.25;
        vec2 scrollDrift=vec2(scroll*0.04,-scroll*0.02);
        vec2 mouseShift=vec2(uMouse.x*aspect*0.05,uMouse.y*0.05);
        warpedUv+=scrollDrift+mouseShift;

        vec2 dir1=vec2(cos(angle1),sin(angle1));
        vec2 dir2=vec2(cos(angle2),sin(angle2));
        vec2 dir3=vec2(cos(angle3),sin(angle3));
        float w1=sin(dot(warpedUv,dir1)*freq1+time*1.0);
        float w2=cos(dot(warpedUv,dir2)*freq2-time*1.4+w1*0.4);
        float w3=sin(dot(warpedUv,dir3)*freq3+time*1.8+w2*0.5);
        float waveField=w1*0.50+w2*0.35+w3*0.15;

        float wideSheen=pow(max(0.0,1.0-abs(waveField-0.1)),2.5);
        float crispSpecular=pow(max(0.0,1.0-abs(waveField-0.15)),8.0);
        float crest=wideSheen*0.5+crispSpecular*0.9;

        vec3 c0_shadow=vec3(0.0010,0.0006,0.0004);
        vec3 c0_wave1 =vec3(0.085,0.040,0.015);
        vec3 c0_wave2 =vec3(0.050,0.022,0.008);
        vec3 c0_crest =vec3(0.45,0.30,0.18);
        vec3 c1_shadow=vec3(0.0004,0.0006,0.0012);
        vec3 c1_wave1 =vec3(0.015,0.035,0.065);
        vec3 c1_wave2 =vec3(0.008,0.020,0.045);
        vec3 c1_crest =vec3(0.18,0.35,0.55);

        float t=smoothstep(0.0,1.0,scroll);
        vec3 colShadow=mix(c0_shadow,c1_shadow,t);
        vec3 colWave1 =mix(c0_wave1, c1_wave1, t);
        vec3 colWave2 =mix(c0_wave2, c1_wave2, t);
        vec3 colCrest =mix(c0_crest, c1_crest, t);

        vec3 color=colShadow;
        color=mix(color,colWave2,smoothstep(-0.6,0.2,waveField));
        color=mix(color,colWave1,smoothstep(0.0,0.8,waveField));
        color+=colCrest*crest*1.4;
        float vignette=1.0-dot(uv,uv)*0.12;
        color*=vignette;
        gl_FragColor=vec4(color,1.0);
      }`;

    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: this.shaderUniforms,
      depthWrite: false, depthTest: false
    });

    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30), this.bgMaterial
    );
    bgMesh.position.set(0, 0, -8.0);
    bgMesh.renderOrder = -10;
    this.camera.add(bgMesh);   // camera-local so it always fills view
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Resize
  // ─────────────────────────────────────────────────────────────────────────
  private bindResize(): void {
    const onResize = () => {
      this.sizes.width  = window.innerWidth;
      this.sizes.height = window.innerHeight;
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.shaderUniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
    };
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Animation loop
  // ─────────────────────────────────────────────────────────────────────────
  private startLoop(): void {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      this.tick();
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private tick(): void {
    const dt  = this.clock.getDelta();
    const t   = this.clock.getElapsedTime();

    // Drive scroll + cursor lerps (writes back into signals)
    this.scrollService.tick(LERP_SCROLL);
    this.cursorService.tick(LERP_OUTER_CURSOR, LERP_MOUSE);

    if (this.mixer) this.mixer.update(dt);

    const scroll  = this.scrollService.currentScroll();
    const mouseX  = this.cursorService.smoothMouseX();
    const mouseY  = this.cursorService.smoothMouseY();
    const scrollV = this.scrollService.scrollVelocity();

    // Gentle model tilt from mouse
    if (this.modelPivot) {
      this.modelPivot.rotation.y = mouseX * 0.25;
      this.modelPivot.rotation.x = mouseY * 0.15;
    }

    // Sparks
    if (this.sparkParticles) {
      const pos = this.sparkParticles.geometry.attributes['position'].array as Float32Array;
      const speedMul = 1.0 + scrollV * 9.0;
      const turb     = scrollV * 0.8;

      for (let i = 0; i < SPARK_COUNT; i++) {
        const idx = i * 3;
        const d   = this.sparkData[i];
        pos[idx]   += d.speedX * dt * speedMul;
        pos[idx+1] += d.speedY * dt * speedMul;
        pos[idx+2] += d.speedZ * dt * speedMul;
        const sway = d.swayRadius * (1.0 + turb * 4.0);
        pos[idx]   += Math.sin(t * d.swaySpeed + d.phase) * sway * dt;
        pos[idx+2] += Math.cos(t * d.swaySpeed + d.phase) * sway * dt;
        if (pos[idx+1] > 3.0 || Math.abs(pos[idx]) > 3.5 || Math.abs(pos[idx+2]) > 3.5) {
          pos[idx+1] = -2.5;
          pos[idx]   = (Math.random()-0.5) * 3.0;
          pos[idx+2] = (Math.random()-0.5) * 3.0;
        }
      }
      this.sparkParticles.geometry.attributes['position'].needsUpdate = true;
    }

    // Camera orbit (360° driven by scroll)
    const phi    = scroll * Math.PI * 2.0;
    const camY   = 0.35 + Math.sin(scroll * Math.PI) * 0.8;
    const radius = 4.2  - Math.sin(scroll * Math.PI) * 0.6;
    const camX   = radius * Math.sin(phi);
    const camZ   = radius * Math.cos(phi);

    const transP    = Math.min(1.0, scroll / 0.28);
    const easeFactor = (Math.cos(transP * Math.PI) + 1.0) * 0.5;
    const lookAtX   = -0.9 * easeFactor;

    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), LERP_CAMERA);
    this.camera.lookAt(new THREE.Vector3(lookAtX, -0.15, 0));

    // Shader uniforms
    this.shaderUniforms.uTime.value   = t;
    this.shaderUniforms.uMouse.value.set(mouseX, -mouseY);
    this.shaderUniforms.uScroll.value = scroll;

    this.renderer.render(this.scene, this.camera);
  }

  private teardown(): void {
    cancelAnimationFrame(this.rafId);
    this.renderer.dispose();
  }
}

interface SparkDatum {
  speedX: number; speedY: number; speedZ: number;
  swaySpeed: number; swayRadius: number; phase: number;
}
```

---

## Pipe — `src/app/pipes/char-split.pipe.ts`

Replaces the imperative `splitTitlesIntoChars()` DOM mutation from the original. Returns a
typed array that the template iterates with `@for`, keeping the component template declarative.

```typescript
import { Pipe, PipeTransform } from '@angular/core';

export interface CharToken {
  char: string;    // the character (never a space — spaces are emitted separately)
  delay: number;   // seconds, for transition-delay
  isSpace: boolean;
  isBr: boolean;
}

@Pipe({ name: 'charSplit', standalone: true, pure: true })
export class CharSplitPipe implements PipeTransform {
  /**
   * Input:  'Bronze <br>and Time'
   * Output: CharToken[] — one token per visible character + space/br markers.
   */
  transform(raw: string): CharToken[] {
    const tokens: CharToken[] = [];
    let charIndex = 0;
    // Split on <br> tags while preserving them as separate tokens
    const parts = raw.split(/(<br\s*\/?>)/i);
    for (const part of parts) {
      if (/^<br/i.test(part)) {
        tokens.push({ char: '', delay: 0, isSpace: false, isBr: true });
      } else {
        for (const ch of part) {
          if (ch === ' ') {
            tokens.push({ char: ' ', delay: 0, isSpace: true, isBr: false });
          } else {
            tokens.push({ char: ch, delay: charIndex * 0.035, isSpace: false, isBr: false });
            charIndex++;
          }
        }
      }
    }
    return tokens;
  }
}
```

---

## Components

### `src/app/components/cursor/cursor.component.ts`

```typescript
import {
  Component, ChangeDetectionStrategy, inject, afterRender, ElementRef
} from '@angular/core';
import { CursorService } from '../../services/cursor.service';

@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cursor-inner" #inner></div>
    <div class="cursor-outer" #outer></div>
  `,
  styles: [`
    .cursor-inner {
      position: fixed; top: 0; left: 0;
      width: 6px; height: 6px;
      border: 2px solid rgba(255,255,255,1);
      border-radius: 50%;
      transform: translate(-50%,-50%);
      pointer-events: none;
      z-index: 9999;
    }
    .cursor-outer {
      position: fixed; top: 0; left: 0;
      width: 40px; height: 40px;
      border: 1.5px solid rgba(255,255,255,0.7);
      border-radius: 50%;
      transform: translate(-50%,-50%);
      pointer-events: none;
      z-index: 9998;
      transition: width 0.3s, height 0.3s, background 0.3s;
    }
  `]
})
export class CursorComponent {
  private readonly cursorService = inject(CursorService);
  private innerEl?: HTMLElement;
  private outerEl?: HTMLElement;

  constructor(private host: ElementRef<HTMLElement>) {
    // afterRender fires after every CD cycle — but since we're zoneless
    // and drive from rAF, this ensures DOM refs are ready for the loop.
    afterRender(() => {
      if (!this.innerEl) {
        this.innerEl = this.host.nativeElement.querySelector('.cursor-inner') as HTMLElement;
        this.outerEl = this.host.nativeElement.querySelector('.cursor-outer') as HTMLElement;
      }
      // Sync positions every frame via signals (zoneless: only runs when signals change)
      if (this.innerEl) {
        this.innerEl.style.left = `${this.cursorService.innerX()}px`;
        this.innerEl.style.top  = `${this.cursorService.innerY()}px`;
      }
      if (this.outerEl) {
        this.outerEl.style.left = `${this.cursorService.outerX()}px`;
        this.outerEl.style.top  = `${this.cursorService.outerY()}px`;
      }
    });
  }
}
```

> **Angular 22 note:** In zoneless mode, `afterRender` only runs when Angular detects dirty
> signals. Because `CursorService` updates its signals inside the rAF loop, Angular's scheduler
> will queue a CD pass and `afterRender` will execute — giving you smooth 60fps DOM updates without
> imperative polling.

---

### `src/app/components/header/header.component.ts`

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NAV_TARGETS } from '../../constants/scene.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl:    './header.component.scss'
})
export class HeaderComponent {
  readonly navItems = [
    { label: 'Bronze', target: NAV_TARGETS[0] },
    { label: 'Marble', target: NAV_TARGETS[1] },
    { label: 'Fluid',  target: NAV_TARGETS[2] },
    { label: 'Digital',target: NAV_TARGETS[3] },
  ];

  navigateTo(fraction: number): void {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * fraction, behavior: 'smooth' });
  }
}
```

**`header.component.html`:**

```html
<div class="main-header">
  <div class="brand">Laocoön</div>

  <nav class="header-nav">
    @for (item of navItems; track item.label; let last = $last) {
      <a class="nav-link" (click)="navigateTo(item.target)">{{ item.label }}</a>
      @if (!last) { <span class="nav-dot"></span> }
    }
  </nav>

  <div class="header-actions">
    <a href="#" class="contact-btn">
      Contact <span class="btn-circle"></span>
    </a>
  </div>
</div>
```

**`header.component.scss`** — same CSS as original `.main-header` and children, scoped.

---

### `src/app/components/slide/slide.component.ts`

A generic slide component driven by `input()` signals. The parent passes slide data and the
`ScrollService` provides the active flag via `computed()` in the parent and then forwards it
as an `input()`.

```typescript
import {
  Component, ChangeDetectionStrategy, input, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharSplitPipe, CharToken } from '../../pipes/char-split.pipe';

@Component({
  selector: 'app-slide',
  standalone: true,
  imports: [CommonModule, CharSplitPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slide.component.html',
  styleUrl:    './slide.component.scss'
})
export class SlideComponent {
  /** HTML string for the title — may contain <br> tags. */
  title   = input.required<string>();
  /** One or two body paragraphs. */
  descs   = input<string[]>([]);
  /** Whether this slide is in its active scroll window. */
  active  = input<boolean>(false);
  /** CSS id for positioning. */
  slideId = input.required<string>();
  /** Extra CSS class for col layout (e.g. 'two-col'). */
  layout  = input<string>('');

  tokens = computed(() => this.charSplitPipe.transform(this.title()));

  private readonly charSplitPipe = new CharSplitPipe();
}
```

**`slide.component.html`:**

```html
<div
  class="slide"
  [id]="slideId()"
  [class.active]="active()"
  [ngClass]="layout()">

  <h2 class="slide-title">
    @for (tok of tokens(); track $index) {
      @if (tok.isBr) {
        <br>
      } @else if (tok.isSpace) {
        &nbsp;
      } @else {
        <span class="char" [style.transition-delay]="tok.delay + 's'">{{ tok.char }}</span>
      }
    }
  </h2>

  @for (desc of descs(); track $index; let i = $index) {
    <p class="slide-desc" [class]="'col-' + (i+1)">{{ desc }}</p>
  }
</div>
```

**`slide.component.scss`** — same CSS as original `.slide`, `.slide-title`, `.slide-desc`,
`.char` blocks, scoped. Include `#slide-1`, `#slide-2`, `#slide-3`, `#slide-4` id-overrides here.

---

### `src/app/components/image-mask/image-mask.component.ts`

```typescript
import {
  Component, ChangeDetectionStrategy, input
} from '@angular/core';
import { IMAGE_1_URL } from '../../constants/scene.constants';

@Component({
  selector: 'app-image-mask',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slide-image-mask" [class.active]="active()">
      <img [src]="imgSrc" alt="Editorial Concept" />
    </div>
  `,
  styles: [`
    .slide-image-mask {
      position: fixed; top: 90px; left: 60px;
      width: calc(25vw - 60px); aspect-ratio: 1/1;
      overflow: hidden; z-index: 2; pointer-events: none;
      clip-path: inset(0 0 100% 0); opacity: 0;
      transition: clip-path 1.8s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease;
    }
    .slide-image-mask img {
      width: 100%; height: 100%; object-fit: cover;
      transform: scale(1.15);
      transition: transform 1.8s cubic-bezier(0.16,1,0.3,1);
    }
    .slide-image-mask.active { clip-path: inset(0 0 0 0); opacity: 1; }
    .slide-image-mask.active img { transform: scale(1); }
  `]
})
export class ImageMaskComponent {
  active = input<boolean>(false);
  readonly imgSrc = IMAGE_1_URL;
}
```

---

### `src/app/components/grid-overlay/grid-overlay.component.ts`

```typescript
import {
  Component, ChangeDetectionStrategy, inject, afterRender, ElementRef
} from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-grid-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-overlay.component.html',
  styleUrl:    './grid-overlay.component.scss'
})
export class GridOverlayComponent {
  private readonly scrollService = inject(ScrollService);
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterRender(() => {
      const scroll = this.scrollService.currentScroll();
      this.updateGridDots(scroll);
      this.updateDashes();
    });
  }

  private updateGridDots(scroll: number): void {
    const dots = this.el.nativeElement.querySelectorAll<HTMLElement>('.grid-dot');
    dots.forEach((dot, i) => {
      const startY = (i * 17) % 80 + 10;
      let speed = 90 + (i * 55) % 180;
      if (i % 2 === 0) speed = -speed;
      let y = ((startY + scroll * speed) % 100 + 100) % 100;
      dot.style.top = `${y}%`;
    });
  }

  private updateDashes(): void {
    const progress = this.scrollService.dashProgress();
    progress.forEach((p, i) => {
      const fill = this.el.nativeElement
        .querySelector<HTMLElement>(`#dash-fill-${i+1}`);
      if (fill) fill.style.height = `${p * 100}%`;
    });
  }
}
```

**`grid-overlay.component.html`:**

```html
<div class="grid-horizontal-line"></div>
<div class="grid-lines">
  @for (line of [0,1,2,3]; track $index) {
    <div class="grid-line">
      <div class="grid-dot top"></div>
      <div class="grid-dot bottom"></div>
    </div>
  }
  <!-- 5th line: story progress -->
  <div class="grid-line story-progress-container">
    <div class="grid-dot top"></div>
    <div class="grid-dot bottom"></div>
    <div class="story-dashes">
      @for (n of [1,2,3,4]; track n) {
        <div class="story-dash">
          <div class="story-dash-fill" [id]="'dash-fill-' + n"></div>
        </div>
      }
    </div>
  </div>
</div>
```

---

### `src/app/components/webgl-canvas/webgl-canvas.component.ts`

The canvas owner. Gets the `<canvas>` via `viewChild()` and hands it to `ThreeSceneService`.

```typescript
import {
  Component, ChangeDetectionStrategy, viewChild,
  ElementRef, afterNextRender, inject
} from '@angular/core';
import { ThreeSceneService } from '../../services/three-scene.service';

@Component({
  selector: 'app-webgl-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #webgl id="webgl" tabindex="-1"></canvas>`,
  styles: [`
    canvas {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 1; outline: none;
      display: block;
    }
  `]
})
export class WebglCanvasComponent {
  private readonly threeScene = inject(ThreeSceneService);

  // Angular 22 signal-based view query
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('webgl');

  constructor() {
    // afterNextRender: fires once, after the first DOM render.
    // Safe to access native elements and initialise Three.js here.
    afterNextRender(() => {
      this.threeScene.init(this.canvasRef().nativeElement);
    });
  }
}
```

> **Angular 22 note:** `viewChild()` (signal form, v17+) replaces `@ViewChild`. The signal is
> read synchronously inside `afterNextRender`, where the view is guaranteed to exist.

---

### `src/app/app.component.ts` — Root shell

```typescript
import {
  Component, ChangeDetectionStrategy, inject, computed
} from '@angular/core';
import { ScrollService }      from './services/scroll.service';
import { CursorComponent }    from './components/cursor/cursor.component';
import { HeaderComponent }    from './components/header/header.component';
import { SlideComponent }     from './components/slide/slide.component';
import { ImageMaskComponent } from './components/image-mask/image-mask.component';
import { GridOverlayComponent }  from './components/grid-overlay/grid-overlay.component';
import { WebglCanvasComponent }  from './components/webgl-canvas/webgl-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CursorComponent, HeaderComponent, SlideComponent,
    ImageMaskComponent, GridOverlayComponent, WebglCanvasComponent
  ],
  templateUrl: './app.component.html',
  styleUrl:    './app.component.scss'
})
export class AppComponent {
  private readonly scrollService = inject(ScrollService);

  // Slide active states derived from ScrollService computed signals
  readonly slide1Active = this.scrollService.slide1Active;
  readonly slide2Active = this.scrollService.slide2Active;
  readonly slide3Active = this.scrollService.slide3Active;
  readonly slide4Active = this.scrollService.slide4Active;
}
```

**`app.component.html`:**

```html
<!-- Custom cursor -->
<app-cursor />

<!-- Overlay layer (fixed, pointer-events: none) -->
<div class="cinematic-container">
  <app-header />

  <!-- Slide 1: Bronze and Time (two-column layout) -->
  <app-slide
    slideId="slide-1"
    title="Bronze &lt;br&gt;and Time"
    [descs]="[
      'A timeless material holding centuries of human history. Fluid in hot flames, eternal in its form. Each curve captures a tense, dramatic moment.',
      'Born of molten fire and creative will, it stands to bridge our ancient memory and modern vision. A fluid energy frozen in still, heavy bronze.'
    ]"
    layout="two-col"
    [active]="slide1Active()" />

  <!-- Slide 2 editorial image reveal -->
  <app-image-mask [active]="slide2Active()" />

  <!-- Slide 2: Marble Emotion -->
  <app-slide
    slideId="slide-2"
    title="Marble &lt;br&gt;Emotion"
    [descs]="[
      'A sculpture frozen at the peak of human suffering and heroic struggle. Laocoön and his sons, bound by ruthless fate.'
    ]"
    [active]="slide2Active()" />

  <!-- Slide 3: Liquid Metal -->
  <app-slide
    slideId="slide-3"
    title="Liquid Metal"
    [descs]="[
      'Art that breathes. Mesmerizing waves of liquid bronze flow through space, reflecting every contour and tensed muscle of the ancient masterpiece.'
    ]"
    [active]="slide3Active()" />

  <!-- Slide 4: Eternal Moment -->
  <app-slide
    slideId="slide-4"
    title="Eternal &lt;br&gt;Moment"
    [descs]="[
      'Contemplating antique form through the lens of new dimensions. A classic masterpiece reborn in the currents of radiant digital matter.'
    ]"
    [active]="slide4Active()" />
</div>

<!-- Grid + progress bar overlay -->
<app-grid-overlay />

<!-- Three.js canvas (z-index: 1, behind all overlays) -->
<app-webgl-canvas />
```

**`app.component.scss`:**

```scss
.cinematic-container {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 10; pointer-events: none;
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 0 60px 40px 60px;
  box-sizing: border-box;
}
```

---

## Angular 22 Key Patterns Reference

| Pattern | Where Used | API |
|---------|-----------|-----|
| Zoneless CD | Bootstrap | `provideZonelessChangeDetection()` |
| Signal state | All services | `signal()`, `computed()` |
| Effect (reactive) | — (not used; rAF loop reads signals directly) | `effect()` |
| View query | `WebglCanvasComponent` | `viewChild.required<T>('ref')` |
| DOM init hook | `WebglCanvasComponent` | `afterNextRender()` |
| Frame-sync hook | `CursorComponent`, `GridOverlayComponent` | `afterRender()` |
| Cleanup | All services | `inject(DestroyRef).onDestroy()` |
| Signal input | `SlideComponent`, `ImageMaskComponent` | `input()`, `input.required()` |
| Pipe (pure) | `SlideComponent` | `@Pipe({ pure: true })` |
| Control flow | All templates | `@for`, `@if` |
| Deferred loading | Optional: wrap `<app-webgl-canvas>` | `@defer (on viewport)` |

---

## Fixed Parameters (same as original — bake into constants)

- Background: `#000000`; `FogExp2('#000000', 0.01)`
- Camera: `PerspectiveCamera(50, aspect, 0.1, 100)`, start `(0, 0.2, 3.0)`
- Renderer: antialias, pixelRatio `min(dpr,2)`, `PCFSoftShadowMap`, `ACESFilmicToneMapping`, exposure `2.2`
- Lights: ambient `#fff@0.1`; key SpotLight `#fff@18` at `(4,6,3)`, angle `π/4`, penumbra `0.9`,
  shadow 2048², near 1 far 15 bias -0.001; rim `#e3f2ff@10` at `(-5,3,-4)`; fill `#fff3e6@0.8` at `(-2,-4,2)`
- Bronze: roughness `0.42`, metalness `0.92`, flatShading `false`, anisotropy `16`
- Model: max dim → `3.5`; recenter via scaled bbox; pivot `y = -0.4`
- Sparks: 450, size `0.025`, opacity `0.85`, additive, vertexColors; 60% orange/40% icy-blue;
  recycle at `y>3.0` or `|x|>3.5`/`|z|>3.5` → respawn `y=-2.5, x,z=±1.5`
- Camera orbit: `phi = scroll*2π`; `y = 0.35+sin(scroll·π)*0.8`; `radius = 4.2−sin(scroll·π)*0.6`;
  lookAt `(−0.9·easeFactor, −0.15, 0)`; ease over `scroll/0.28`; lerp `0.025`
- Slide ranges: s1 `[-0.10,0.12]`, s2 `[0.28,0.40]`, s3 `[0.56,0.68]`, s4 `[0.84,1.05]`
- Nav targets: `[0.0, 0.34, 0.62, 0.94]`
- Title: 116px Italiana; body: 16px Outfit 300; title color `#fff6ed`; desc `#d1d5db`
- Page: `min-height: 900vh`; padding `0 60px 40px 60px`

---

## Assets (same as original)

```typescript
// src/app/constants/scene.constants.ts  (already shown above)
const ASSET_BASE_URL =
  'https://api.getlayers.ai/storage/v1/object/public/public/assets/laocoon-59f84455c6';
```

| Asset | Usage | URL |
|-------|-------|-----|
| `bronze_horse.glb` | GLB model via `GLTFLoader` | `{ASSET_BASE_URL}/bronze_horse.glb` |
| `1.png` | Editorial image, slide-2 mask | `{ASSET_BASE_URL}/1.png` |

Spark texture is generated procedurally (no file). Fonts via Google Fonts `@import` in `styles.scss`.
