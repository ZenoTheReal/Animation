import { Injectable, inject, DestroyRef, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ScrollService } from './scroll.service';
import { CursorService  } from './cursor.service';
import {
  MODEL_URL, SPARK_COUNT, MODEL_TARGET_SCALE, PIVOT_Y_OFFSET,
  CAMERA_START, TONE_MAPPING_EXPOSURE, BRONZE_ROUGHNESS, BRONZE_METALNESS,
  MAP_ANISOTROPY, LERP_SCROLL, LERP_CAMERA
} from '../constants/scene.constants';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private readonly scrollService = inject(ScrollService);
  private readonly cursorService = inject(CursorService);
  private readonly destroyRef    = inject(DestroyRef);
  private readonly platformId    = inject(PLATFORM_ID);
  private readonly isBrowser     = isPlatformBrowser(this.platformId);

  private scene!:       THREE.Scene;
  private camera!:      THREE.PerspectiveCamera;
  private renderer?:    THREE.WebGLRenderer;
  private canvas?:      HTMLCanvasElement;
  private resizeHandler?: () => void;
  private startTime =   0;
  private lastTime =    0;
  private mixer?:       THREE.AnimationMixer;

  constructor() {
    this.destroyRef.onDestroy(() => this.teardown());
  }

  private readonly handleContextLost = (event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost. Pausing rendering loop.');
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  };

  private readonly handleContextRestored = () => {
    console.log('WebGL context restored. Re-initializing scene.');
    if (this.canvas) {
      const canvasRef = this.canvas;
      this.teardown();
      this.init(canvasRef);
    }
  };

  private getDelta(): number {
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000.0;
    this.lastTime = now;
    return Math.min(delta, 0.1);
  }

  private getElapsedTime(): number {
    return (performance.now() - this.startTime) / 1000.0;
  }

  private modelPivot?:  THREE.Group;
  private sparkParticles?: THREE.Points;
  private sparkData:    SparkDatum[] = [];

  private bgMaterial?:  THREE.ShaderMaterial;
  private shaderUniforms = {
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(1024, 768) },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uScroll:     { value: 0 },
  };

  private sizes = { width: 1024, height: 768 };
  private rafId = 0;

  // Loading signals
  readonly loadingProgress = signal(0);
  readonly isLoaded = signal(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Public init — called by WebglCanvasComponent after view renders
  // ─────────────────────────────────────────────────────────────────────────
  init(canvas: HTMLCanvasElement): void {
    if (!this.isBrowser) return;

    this.teardown();

    this.loadingProgress.set(0);
    this.isLoaded.set(false);

    this.canvas = canvas;
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);

    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.shaderUniforms.uResolution.value.set(this.sizes.width, this.sizes.height);

    this.startTime = performance.now();
    this.lastTime = performance.now();

    try {
      this.buildScene();
      this.buildCamera();
      this.createBackgroundShader();
      this.buildRenderer(canvas);
      this.buildLights();
      this.createSparks();
      this.loadModel();
    } catch (err) {
      console.warn('WebGL context creation failed or is unsupported. Falling back to clean CSS/DOM layout.', err);
      // Immediately clear the loader overlay so that slides are interactable
      this.loadingProgress.set(100);
      this.isLoaded.set(true);
    }

    this.bindResize();
    this.startLoop();
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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

        // Finish loading
        this.loadingProgress.set(100);
        this.isLoaded.set(true);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
          this.loadingProgress.set(percent);
        } else {
          // If total is unknown, just progress up to 90%
          const current = this.loadingProgress();
          if (current < 90) {
            this.loadingProgress.set(current + 5);
          }
        }
      },
      err => {
        console.error('Error loading bronze horse:', err);
        // Set to loaded anyway so we don't block user forever if load fails
        this.isLoaded.set(true);
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Background liquid-bronze wave shader
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
    this.camera.add(bgMesh);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Resize
  // ─────────────────────────────────────────────────────────────────────────
  private bindResize(): void {
    this.resizeHandler = () => {
      this.sizes.width  = window.innerWidth;
      this.sizes.height = window.innerHeight;
      if (this.camera) {
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();
      }
      if (this.renderer) {
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
      this.shaderUniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
    };
    window.addEventListener('resize', this.resizeHandler);
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
    if (!this.isBrowser) return;

    const dt  = this.getDelta();
    const t   = this.getElapsedTime();

    // Drive scroll
    this.scrollService.tick(LERP_SCROLL);

    // If WebGL is not supported / failed to build renderer, return early
    if (!this.renderer) return;

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

    if (this.camera) {
      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), LERP_CAMERA);
      this.camera.lookAt(new THREE.Vector3(lookAtX, -0.15, 0));
    }

    // Shader uniforms
    this.shaderUniforms.uTime.value   = t;
    this.shaderUniforms.uMouse.value.set(mouseX, -mouseY);
    this.shaderUniforms.uScroll.value = scroll;

    this.renderer.render(this.scene, this.camera);
  }

  public teardown(): void {
    if (!this.isBrowser) return;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }

    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
      this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
      this.canvas = undefined;
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = undefined;
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => this.disposeMaterial(mat));
            } else {
              this.disposeMaterial(mesh.material);
            }
          }
        } else if ((object as THREE.Points).isPoints) {
          const points = object as THREE.Points;
          if (points.geometry) {
            points.geometry.dispose();
          }
          if (points.material) {
            if (Array.isArray(points.material)) {
              points.material.forEach((mat) => this.disposeMaterial(mat));
            } else {
              this.disposeMaterial(points.material);
            }
          }
        }
      });

      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
    }

    if (this.bgMaterial) {
      this.bgMaterial.dispose();
      this.bgMaterial = undefined;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined;
    }

    this.modelPivot = undefined;
    this.sparkParticles = undefined;
    this.sparkData = [];
  }

  private disposeMaterial(material: THREE.Material): void {
    material.dispose();
    const matAny = material as any;
    const maps = [
      'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
      'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap'
    ];
    for (const mapName of maps) {
      if (matAny[mapName] && typeof matAny[mapName].dispose === 'function') {
        matAny[mapName].dispose();
      }
    }
  }
}

interface SparkDatum {
  speedX: number; speedY: number; speedZ: number;
  swaySpeed: number; swayRadius: number; phase: number;
}
