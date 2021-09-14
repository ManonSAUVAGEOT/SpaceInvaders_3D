import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.module.js";
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";

export default class Player{
  
  constructor(){
    this.tab_bunkers = [];
    this.mesh_player;
    this.tab_player = [];
    this.camera;
    this.condcam;
    this.missile;
    this.condmissile;
    this.condmissile2;
    this.condsoucoupe;
    this.condalien;
    this.score;
    this.audio = new Audio('Src/medias/sounds/attrape.wav');
    this.groupB;
    this.missile_vitesse = 0.5;
  }

  chargerGLTF = (url) => {
    var loader = new GLTFLoader();
    return new Promise((resolve,reject) => {
      loader.load(url, data => resolve(data),null,reject);
    })
  }

  createBunker = () => {
    this.groupB = new THREE.Group();
    const square = new THREE.BoxGeometry( 2, 4, 0.1 );
    const loader = new THREE.TextureLoader();
    //1
    const texture = loader.load('Src/medias/images/carte4.png');
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    var mesh = new THREE.Mesh(square, material);
    mesh.position.set(-15.5, 0.5, 15);
    this.groupB.add(mesh);
    this.tab_bunkers.push(mesh);
    //2
    const texture1 = loader.load('Src/medias/images/carte2.png');
    const material1 = new THREE.MeshBasicMaterial({
      map: texture1,
    });
    mesh = new THREE.Mesh(square, material1);
    mesh.position.set(-7.5, 0.5, 15);
    this.groupB.add(mesh);
    this.tab_bunkers.push(mesh);
    //3
    const texture2 = loader.load('Src/medias/images/carte1.png');
    const material2 = new THREE.MeshBasicMaterial({
      map: texture2,
    });
    mesh = new THREE.Mesh(square, material2);
    mesh.position.set(0, 0.5, 15);
    this.groupB.add(mesh);
    this.tab_bunkers.push(mesh);
    //4
    const texture3 = loader.load('Src/medias/images/carte3.png');
    const material3 = new THREE.MeshBasicMaterial({
      map: texture3,
    });
    mesh = new THREE.Mesh(square, material3);
    mesh.position.set(7.5, 0.5, 15);
    this.groupB.add(mesh);
    this.tab_bunkers.push(mesh);
    //5
    const texture4 = loader.load('Src/medias/images/carte.png');
    const material4 = new THREE.MeshBasicMaterial({
      map: texture4,
    });
    mesh = new THREE.Mesh(square, material4);
    mesh.position.set(15.5, 0.5, 15);
    this.groupB.add(mesh);
    this.tab_bunkers.push(mesh);

    return this.groupB;
  }

  async createPlayer(){
    const cube = new THREE.BoxGeometry( 1, 1, 1 );
    const geometryG = new THREE.MeshLambertMaterial({color: 'green',transparent : true, opacity: 0.0 });
    this.mesh_player = new THREE.Mesh(cube, geometryG);
    var pokemon1 = await this.chargerGLTF("../Src/medias/models/Dresseur/untitled.gltf");
    pokemon1.scene.scale.set(0.03,0.03,0.03);
    pokemon1.scene.position.y = -1;
    this.mesh_player.position.set(0, 0.5, 18);
    this.mesh_player.add(pokemon1.scene);
    this.mesh_player.rotateY(Math.PI);
    this.condmissile = false;
    this.condmissile2 = false;
    this.tab_player.push(this.mesh_player);
    this.condsoucoupe = false;
    this.condalien = false;
    return this.mesh_player;
  }

  createCamera = (w,h) => {
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0,19,27);
    this.camera.lookAt(0,0,0);
    this.condcam = false;
    return this.camera
  }

  movePlayer = (event) => {
  //left
  if(event.keyCode == 37 & this.mesh_player.position.x > -19) {
      this.mesh_player.position.x -= 0.5;
      if(this.condcam){
        this.camera.position.x -= 0.5;
        this.camera.lookAt(this.mesh_player.position.x,1,0);
      }
  }
  //right
  else if(event.keyCode == 39 & this.mesh_player.position.x < 19) {
      this.mesh_player.position.x += 0.5;
      if(this.condcam){
        this.camera.position.x += 0.5;
        this.camera.lookAt(this.mesh_player.position.x,1,0);
      }
  }
}

  switchCamera = (event) => {
    //up
    if(event.keyCode == 38 && this.condcam) {
        this.camera.position.set(0,19,27);
        this.camera.lookAt(0,0,0);
        this.condcam = false;
    }
    //down
    else if(event.keyCode == 40 && !this.condcam) {
      this.camera.position.set(this.mesh_player.position.x,1.8,17);
      this.camera.lookAt(this.mesh_player.position.x,1,0);
      this.condcam = true;
    }
  }

  shoot = (event) => {
    if(event.keyCode == 32 & this.condmissile == false){
        this.condmissile = true;
        this.missile.position.set(this.mesh_player.position.x, this.mesh_player.position.y, this.mesh_player.position.z);
        this.missile.visible = true;
    }
  }

  async createMissile(){
    const littlesphere = new THREE.SphereGeometry(0.2, 15, 15);
    const geometryR = new THREE.MeshPhongMaterial({color: 'red', transparent: true, opacity: 0.0});
    this.missile = new THREE.Mesh(littlesphere, geometryR);
    this.missile.position.set(this.mesh_player.position.x, this.mesh_player.position.y, this.mesh_player.position.z);
    var pokemon1 = await this.chargerGLTF("../Src/medias/models/Pokéball/untitled.gltf");
    pokemon1.scene.scale.set(0.1,0.1,0.1);
    this.missile.add(pokemon1.scene);
    this.missile.visible = false;
    return this.missile
  }

  moveMissile = () => {
    if (this.missile.position.z >= -16){
        this.missile.position.z -= this.missile_vitesse;
        this.missile.rotation.x += 0.5;
        this.missile.rotation.y += 0.5;
    }else{
        this.removeMissile();
    }
  }

  removeMissile = () => {
    this.missile.visible = false;
    this.condmissile = false;
  }

  CollisionBunker = () => {
    var raycaster = new THREE.Raycaster();
    var point = new THREE.Vector3(1,0,1);
    raycaster.set(this.missile.position, point);
    var intersect = raycaster.intersectObjects(this.tab_bunkers);
    var cpt = 0;
    if(intersect.length > 0){
      while(intersect[0].object.uuid != this.tab_bunkers[cpt].uuid){
        cpt++;
      }
      if(intersect[0].object.uuid == this.tab_bunkers[cpt].uuid){
        this.removeMissile();
        intersect[0].object.material.opacity -= 0.2;
        if(intersect[0].object.material.opacity <= 0.5){
          this.tab_bunkers.splice(cpt,1);
          this.groupB.remove(intersect[0].object);
        }
        return true;
      }
    }
    return false;
  }

  CollisionAlien = (tab_aliens, cond) => {
    var raycaster = new THREE.Raycaster();
    var point = new THREE.Vector3(1,0,1);
    raycaster.set(this.missile.position, point);
    var intersect = raycaster.intersectObjects(tab_aliens);
    var cpt = 0;
    if(intersect.length > 0){
      while(intersect[0].object.uuid != tab_aliens[cpt].uuid){
        cpt++;
      }
      if(intersect[0].object.uuid == tab_aliens[cpt].uuid){
        this.Play(cond);
        this.removeMissile();
        this.score = -intersect[0].object.position.z*10;
        intersect[0].object.visible = false;
        tab_aliens.splice(cpt,1);
      }
      return true;
    }
    return false;
  }

  Play = (cond) => {
    if(cond){
      this.audio.play();
    }
  }

  CheckAlien = (tab_aliens) => {
    if(tab_aliens.length == 0){
        this.condalien = true;
      }
  }

  CollisionSoucoupe(tab_soucoupe){
    var raycaster = new THREE.Raycaster();
    var point = new THREE.Vector3(1,0,1);
    raycaster.set(this.missile.position, point);
    var intersect = raycaster.intersectObjects(tab_soucoupe);
    var cpt = 0;
    if(intersect.length > 0){
      if(intersect[0].object.uuid == tab_soucoupe[0].uuid){
        this.removeMissile();
        intersect[0].object.visible = false;
        tab_soucoupe.splice(0,1);
        this.condsoucoupe = true;
        return true;
      }
    }
    return false;
  }

  newGame = () => {
    this.condalien = false;
    this.condsoucoupe = false;
    this.missile.visible = false;
    this.condmissile = false;
    this.missile_vitesse +=0.1;
  }

  reset = () => {
    this.tab_player = [];
    this.tab_bunkers = [];
    this.groupB.clear();
    this.mesh_player.visible = true;
    this.tab_player.push(this.mesh_player);
    this.condmissile = false;
    this.missile.visible = false;
    this.condsoucoupe = false;
    this.condalien = false;
    this.missile_vitesse =0.5;
  }

  killAlien = () => {
    this.condalien = true;
  }

  killSoucoupe = () =>{
    this.condsoucoupe = true;
  }

  get getScore(){
    return this.score
  }

  get getBunkers(){
    return this.tab_bunkers;
  }

  get getGroupBunkers(){
    return this.groupB;
  }

  get getCamera(){
    return this.camera;
  }

  get getCondCam(){
    return this.condcam;
  }

  get getCondMissile(){
    return this.condmissile;
  }
  
  get getCondMissile2(){
    return this.condmissile2;
  }

  get getMissile(){
    return this.missile;
  }

  get getPlayer(){
    return this.tab_player;
  }

  get getMeshPlayer(){
    return this.mesh_player;
  }

  get getAlien(){
    return this.condalien;
  }

  get getSoucoupe(){
    return this.condsoucoupe;
  }

}

















