import * as THREE from 'three'
import WebGL from './WebGL'
import * as DAT from 'dat.gui'
import { OrbitControls } from './OrbitControls'
import gsap from 'gsap'

// DAT GUI
const gui = new DAT.GUI()
const world = {
    plane: {
        width: 11,
        height: 11,
        widthSegments: 15,
        heightSegments: 15
    }
}

gui.add(world.plane, 'width', 1, 50).onChange(setValuesFromGUI)
gui.add(world.plane, 'height', 1, 50).onChange(setValuesFromGUI)
gui.add(world.plane, 'widthSegments', 1, 50).onChange(setValuesFromGUI)
gui.add(world.plane, 'heightSegments', 1, 50).onChange(setValuesFromGUI)

function setValuesFromGUI(){
    plane.geometry.dispose()
    plane.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    )
    const pArray = plane.geometry.attributes.position.array
    for(let i = 0; i < pArray.length; i += 3){
        pArray[i+2] = Math.random()
    }

    setColors()
}

// Creating a scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)

document.body.appendChild(renderer.domElement)

// Creating a cube geometry and attaching it to the scene
const cubeGeometry = new THREE.BoxGeometry(1,1,1)
const cubeMaterial = new THREE.MeshPhongMaterial({color: 0xffff3f, flatShading: THREE.FlatShading})
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
//scene.add(cube)

// Creating a plane geometry and attaching it to the scene
const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
const planeMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)

// Creating and attaching lights to the scenes
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0,0,1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0,-1,-1)
scene.add(backLight)

// Ray casting 
const rayCaster = new THREE.Raycaster()

// Atatching orbital controls
new OrbitControls(camera, renderer.domElement)

// Position the camera little away from the center 
camera.position.z = 5

// Randomizing the vertices
const pArray = plane.geometry.attributes.position.array
for(let i = 0; i < pArray.length; i += 3){
    const x = pArray[i]
    const y = pArray[i+1]
    const z = pArray[i+2]

    pArray[i] = x + Math.random() - 0.5
    pArray[i+1] = y + Math.random() - 0.5
    pArray[i+2] = z + Math.random() - 0.5
}


plane.geometry.attributes.position.originalPosition = plane.geometry.attributes.position.array
console.log(plane.geometry.attributes.position)

// Setting the color attribute
function setColors(){
    const colors = []
for (let i = 0; i < plane.geometry.attributes.position.count; i++){
    colors.push(0.8, 0.71, 0.75)
}
plane.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

setColors()

// const cArray = cube.geometry.attributes.position.array
// for(let i = 0; i < cArray.length; i += 3){
//     cArray[i+2] = Math.random()
// }

// Mouse object for getting coordinates
const mouse = {
    x: undefined,
    y: undefined
}

let frame = 0

// Function to animate 
function animate(){
    requestAnimationFrame(animate)
    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01
    // cube.rotation.z += 0.01
    // plane.rotation.x += 0.01
    // plane.rotation.y += 0.01
    // plane.rotation.z += 0.01
    frame+=0.01
    // Rendering the scene
    renderer.render(scene, camera)
    // Setting the ray caster
    rayCaster.setFromCamera(mouse, camera)

    const { array, originalPosition } = plane.geometry.attributes.position

    // Hover effect using ray casting
    const intercepts = rayCaster.intersectObject(plane)
    if(intercepts.length > 0){
        const {color} = intercepts[0].object.geometry.attributes
        color.setX(intercepts[0].face.a, 1)
        color.setY(intercepts[0].face.a, 0.72)
        color.setZ(intercepts[0].face.a, 0.78)

        color.setX(intercepts[0].face.b, 1)
        color.setY(intercepts[0].face.b, 0.72)
        color.setZ(intercepts[0].face.b, 0.75)

        color.setX(intercepts[0].face.c, 1)
        color.setY(intercepts[0].face.c, 0.72)
        color.setZ(intercepts[0].face.c, 0.78)

        intercepts[0].object.geometry.attributes.color.needsUpdate = true

        const initialColor = {
            r: 0.8,
            g: 0.71,
            b: 0.75
        }

        const hoverColor = {
            r: 1,
            g: 0.72,
            b: 0.78
        }

        // Using gsap to introduce fade out after hovering 
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                color.setX(intercepts[0].face.a, hoverColor.r)
                color.setY(intercepts[0].face.a, hoverColor.g)
                color.setZ(intercepts[0].face.a, hoverColor.b)

                color.setX(intercepts[0].face.b, hoverColor.r)
                color.setY(intercepts[0].face.b, hoverColor.g)
                color.setZ(intercepts[0].face.b, hoverColor.b)

                color.setX(intercepts[0].face.c, hoverColor.r)
                color.setY(intercepts[0].face.c, hoverColor.g)
                color.setZ(intercepts[0].face.c, hoverColor.b)
            }
        })
    }
}

// Rendering the scene
if(WebGL.isWebGLAvailable()){
    console.log('WebGL is available. Rendering scene...')
    animate()
}
else{
    const warning = WebGL.getWebGLErrorMessage()
    document.body.appendChild(warning)
}

// Listener to capture mouse coordinates
addEventListener('mousemove', (event)=>{
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
})
