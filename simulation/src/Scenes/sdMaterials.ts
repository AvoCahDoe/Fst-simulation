import { Scene , Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Texture } from "babylonjs";

export class sdMaterials{

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
        camera.speed = 0.25 ;


        //light + adjustements
        const hemiLight = new HemisphericLight("hemilight",new Vector3(0,1,0),this.scene);
        hemiLight.intensity = 1;

        //mesh building a ground by default palce in 0,0,0
        const ground = MeshBuilder.CreateGround("ground",{width:10,height:10},this.scene)

    

        const ball = MeshBuilder.CreateSphere("ball",{diameter:1},this.scene)
        ball.position = new Vector3(0,1,0)
        // or ball.position.x = 1 ...



        // assign textures
        ground.material = this.CreateGroundMaterial();
        ball.material = this.CreateBallMaterial();



        return scene
    }







CreateGroundMaterial():StandardMaterial {
    const groundMat  = new StandardMaterial("groundMat",this.scene);
        const uvScale = 4 ;
        const texArray:Texture[] = [];

    const diffuseTex = new Texture("./textures/CobbleStone/CobbleStone_Diff.jpg",this.scene);
    groundMat.diffuseTexture = diffuseTex;
texArray.push(diffuseTex)

        const NormalTex = new Texture("./textures/CobbleStone/CobbleStone_Normal.jpg",this.scene);
    groundMat.bumpTexture = NormalTex
texArray.push(NormalTex)

            const aoTex = new Texture("./textures/CobbleStone/CobbleStone_AO.jpg",this.scene);
    groundMat.ambientTexture = aoTex 
texArray.push(aoTex)

    // for specular groundMat.specularTexture

    texArray.forEach((tex)=>{
        tex.uScale = uvScale;
        tex.vScale = uvScale;
    })

    return groundMat
        
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
