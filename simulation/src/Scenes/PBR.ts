import { Scene ,StandardMaterial, Engine, FreeCamera,Texture, Vector3, HemisphericLight, MeshBuilder,CubeTexture,PBRMaterial } from "babylonjs";

export class PBR{

    scene : Scene;
    engine : Engine ;

    constructor(private canvas : HTMLCanvasElement){
        this.engine = new Engine(this.canvas,true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();

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
        camera.speed = 0.25

        //light + adjustements
        const hemiLight = new HemisphericLight("hemilight",new Vector3(0,1,0),this.scene);
        hemiLight.intensity = 1;        // 0 to tuen it off 

        const envTex = CubeTexture.CreateFromPrefilteredData("./environment/sky.env",scene);
        scene.environmentTexture = envTex;

        scene.createDefaultSkybox(envTex,true)



        return scene
    }


    CreateEnvironment():void{       // bon pratique to seperate Mesh 3la scene
                //mesh building a ground by default palce in 0,0,0
        const ground = MeshBuilder.CreateGround("ground",{width:10,height:10},this.scene)


        const ball = MeshBuilder.CreateSphere("ball",{diameter:1},this.scene)
        ball.position = new Vector3(0,1,0)
        // or ball.position.x = 1 ...

        ground.material = this.CreateAsphalt();
        ball.material = this.CreateBallMaterial();


    }



    CreateAsphalt() : PBRMaterial {
        const pbr = new PBRMaterial("pbr",this.scene);
        pbr.albedoTexture = new Texture("./textures/ground/rocky_terrain_03_diff_1k.jpg",this.scene);
        // pbr.bumpTexture = new Texture("./textures/ground/rocky_terrain_03_nor_1k.jpg",this.scene);
        // pbr.invertNormalMapX = true;
        // pbr.invertNormalMapY = true;



        //must adjust roughness bach ground dont act like a mirror
        pbr.roughness = 1 //no extreme shine
        return pbr ;
    }






    CreateBallMaterial():StandardMaterial {

           const ballMat  = new StandardMaterial("ballMat",this.scene);
        const uvScale = 2 ;
        const texArray:Texture[] = [];
     

    const diffuseTex = new Texture("./textures/metal/metal_Diffuse.jpg",this.scene);
    ballMat.diffuseTexture = diffuseTex;
texArray.push(diffuseTex)

        const NormalTex = new Texture("./textures/metal/metal_Normal.jpg",this.scene);
    ballMat.bumpTexture = NormalTex
    ballMat.invertNormalMapX = true
    ballMat.invertNormalMapY = true

texArray.push(NormalTex)

            const aoTex = new Texture("./textures/metal/metal_AO.jpg",this.scene);
    ballMat.ambientTexture = aoTex 
texArray.push(aoTex)


    texArray.forEach((tex)=>{
        tex.uScale = uvScale;
        tex.vScale = uvScale;
    })


    return ballMat;







    }














}