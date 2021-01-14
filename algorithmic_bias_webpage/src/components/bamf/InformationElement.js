import Three from "three";

class InformationElement    {
    constructor(mesh,position,content = "Das ist eine neue Information über das Bamf"){
        this.mesh = mesh;
        this.position = position;

        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;

        this.content = content;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

}

export {InformationElement};