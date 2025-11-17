// // src/components/WaterShader.tsx
// import { useRef, useEffect } from "react";

// const WaterShader = ({
//   intensity = 0.045,
//   color = "#2C3E50",
// }: {
//   intensity?: number;
//   color?: string;
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const gl = canvas.getContext("webgl");

//     if (!gl) return;

//     canvas.width = canvas.offsetWidth;
//     canvas.height = canvas.offsetHeight;

//     /* ------------------------------
//        Vertex Shader
//     ------------------------------ */
//     const vertex = gl.createShader(gl.VERTEX_SHADER)!;
//     gl.shaderSource(
//       vertex,
//       `
//       attribute vec2 position;
//       varying vec2 uv;
//       void main() {
//         uv = (position + 1.0) * 0.5;
//         gl_Position = vec4(position, 0.0, 1.0);
//       }
//     `
//     );
//     gl.compileShader(vertex);

//     /* ------------------------------
//        Fragment Shader (Caustics + Distortion)
//     ------------------------------ */
//     const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
//     gl.shaderSource(
//       frag,
//       `
//       precision highp float;
//       varying vec2 uv;

//       uniform float time;
//       uniform float intensity;
//       uniform vec3 tint;

//       float hash(vec2 p) {
//         return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
//       }

//       float noise(vec2 p) {
//         vec2 i = floor(p);
//         vec2 f = fract(p);

//         float a = hash(i);
//         float b = hash(i + vec2(1.0, 0.0));
//         float c = hash(i + vec2(0.0, 1.0));
//         float d = hash(i + vec2(1.0, 1.0));

//         vec2 u = f * f * (3.0 - 2.0 * f);

//         return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x)
//                        + (d - b) * u.x * u.y;
//       }

//       // Caustic function
//       float caustics(vec2 p) {
//         float n = 0.0;
//         n += noise(p * 4.0 + time * 0.5);
//         n += noise(p * 8.0 - time * 0.3) * 0.5;
//         n += noise(p * 12.0 + time * 0.8) * 0.25;
//         return n;
//       }

//       void main() {
//         float c = caustics(uv * 3.5);

//         // Distortion effect
//         float distort = caustics(uv * 2.0 + time * 0.2) * intensity;

//         vec3 highlight = vec3(c * 0.65, c * 0.8, c * 1.0);

//         vec3 finalColor = mix(tint, highlight, c * 0.85);

//         gl_FragColor = vec4(finalColor, 0.42); // overlay alpha
//       }
//     `
//     );
//     gl.compileShader(frag);

//     /* ------------------------------
//        Link Program
//     ------------------------------ */
//     const program = gl.createProgram()!;
//     gl.attachShader(program, vertex);
//     gl.attachShader(program, frag);
//     gl.linkProgram(program);
//     gl.useProgram(program);

//     const buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([
//         -1, -1,
//         1, -1,
//         -1, 1,
//         -1, 1,
//         1, -1,
//         1, 1,
//       ]),
//       gl.STATIC_DRAW
//     );

//     const posLoc = gl.getAttribLocation(program, "position");
//     gl.enableVertexAttribArray(posLoc);
//     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

//     const tLoc = gl.getUniformLocation(program, "time");
//     const iLoc = gl.getUniformLocation(program, "intensity");
//     const colLoc = gl.getUniformLocation(program, "tint");

//     gl.uniform1f(iLoc, intensity);

//     // Convert hex -> vec3
//     const hex = color.replace("#", "");
//     const r = parseInt(hex.substring(0, 2), 16) / 255;
//     const g = parseInt(hex.substring(2, 4), 16) / 255;
//     const b = parseInt(hex.substring(4, 6), 16) / 255;

//     gl.uniform3f(colLoc, r, g, b);

//     const render = (t: number) => {
//       gl.uniform1f(tLoc, t * 0.001);
//       gl.drawArrays(gl.TRIANGLES, 0, 6);
//       requestAnimationFrame(render);
//     };

//     render(0);
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute inset-0 w-full h-full pointer-events-none"
//       style={{ zIndex: 40, opacity: 0.7 }}
//     />
//   );
// };

// export default WaterShader;