import { Scene , Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder } from "babylonjs";

export class BasicScene{

    scene : Scene;
    engine : Engine ;

    constructor(private canvas : HTMLCanvasElement){
        this.engine = new Engine(this.canvas,true);
        this.scene = this.CreateScene();

        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }




    CreateScene():Scene{

        //scene et camera
        //camera starts of at the center point by default
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera",new Vector3(0,1,-2),this.scene);
        camera.attachControl(); //to control camera with mouse 


        //light + adjustements
        const hemiLight = new HemisphericLight("hemilight",new Vector3(0,1,0),this.scene);
        hemiLight.intensity = 0.5;

        //mesh building a ground by default palce in 0,0,0
        const ground = MeshBuilder.CreateGround("ground",{width:10,height:10},this.scene)


        const ball = MeshBuilder.CreateSphere("ball",{diameter:1},this.scene)
        ball.position = new Vector3(0,1,0)
        // or ball.position.x = 1 ...

        return scene
    }

















}