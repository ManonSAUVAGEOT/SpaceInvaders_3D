import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.module.js";
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";


export default class Alien{
	
	constructor(){
		this.tab_aliens = [];
		this.groupA;
		this.box;
		this.nbr_life;
		this.condgameover;
		this.tab_soucoupe = [];
		this.mesh_soucoupe;
		this.cond1;
		this.cond2;
		this.condmissile;
		this.missile;
		this.vitesse = 0.05;
		this.missile_vitesse = 0.2;
		this.pos_soucoupe = 70;
		this.audio;
	}

	chargerGLTF = (url) => {
		var loader = new GLTFLoader();
		return new Promise((resolve,reject) => {
			loader.load(url, data => resolve(data),null,reject);
		})
	}

	async createAlien(){
	    this.groupA = new THREE.Group();
	    const cube = new THREE.BoxGeometry( 1, 1, 1 );
	    const geometryG = new THREE.MeshLambertMaterial({color: 'green',transparent : true, opacity: 0.0 });
	    var z = -2;
	    for(var x = -8; x <= 8; x += 2){
			var pokemon1 = await this.chargerGLTF("../Src/medias/models/Whimsicott/scene.gltf");
			pokemon1.scene.scale.set(0.04,0.04,0.04);
			const mesh = new THREE.Mesh(cube, geometryG);
			mesh.position.set(x, 0.5, z);
			mesh.add(pokemon1.scene);
			this.groupA.add(mesh);
			this.tab_aliens.push(mesh);
	    }
    	z = -4;
	    for(var x = -8; x <= 8; x += 2){
			var pokemon1 = await this.chargerGLTF("../Src/medias/models/Diglett/scene.gltf");
			pokemon1.scene.scale.set(0.5,0.5,0.5);
			pokemon1.scene.position.y = 1;
			const mesh = new THREE.Mesh(cube, geometryG);
			mesh.position.set(x, 0.5, z);
			mesh.add(pokemon1.scene);
			this.groupA.add(mesh);
			this.tab_aliens.push(mesh);
	    }
	    z = -6;
	    for(var x = -8; x <= 8; x += 2){
			var pokemon1 = await this.chargerGLTF("../Src/medias/models/Pikachu/scene.gltf");
			pokemon1.scene.scale.set(0.05,0.05,0.05);
			const mesh = new THREE.Mesh(cube, geometryG);
			mesh.position.set(x, 0.5, z);
			mesh.add(pokemon1.scene);
			this.groupA.add(mesh);
			this.tab_aliens.push(mesh);
	    }
	    z = -8;
	    for(var x = -8; x <= 8; x += 2){
			var pokemon1 = await this.chargerGLTF("../Src/medias/models/Squirtle/scene.gltf");
			pokemon1.scene.scale.set(1.5,1.5,1.5);
			pokemon1.scene.position.y = 1;
			const mesh = new THREE.Mesh(cube, geometryG);
			mesh.position.set(x, 0.5, z);
			mesh.add(pokemon1.scene);
			this.groupA.add(mesh);
			this.tab_aliens.push(mesh);
	    }
	    this.cond1 = true;
	  	this.cond2 = false;
	    this.box = new THREE.Box3().setFromObject(this.groupA);
	    this.condmissile = false;
	    this.nbr_life = 3;
	    this.condgameover = false;
	    this.audio = new Audio('Src/medias/sounds/attaque.mp3');
	    return this.groupA;
	}

	moveAliens = (score) => {
		const xmin = -21;
		const xmax = 21;
		this.box = new THREE.Box3().setFromObject(this.groupA);
		if(this.cond2){
			this.groupA.position.z +=1;
			this.missile_vitesse +=0.05;
			this.cond2 = false;
		}
		if(this.box.max.x >= xmax){
			this.cond1 = false;
			this.cond2 = true;
		}else{
			if(this.box.min.x <= xmin){
				this.cond1 = true;
				this.cond2 = true;
			}
		}
		if(this.cond1){
			this.groupA.position.x += this.vitesse;
		}else{
			this.groupA.position.x -= this.vitesse;
		}
		if(this.groupA.position.z >= 16.5){
			this.condgameover = true;
			document.getElementById("gameover").style.visibility = "visible";
			document.getElementById("scorefinal").innerHTML = 'Score : ' + score;
			return true;
		}
		return false;
	}
	
	async createMissile(){
		var nbr =  Math.floor(Math.random()*this.tab_aliens.length);
		const littlesphere = new THREE.SphereGeometry(0.2, 15, 15);
		const geometryR = new THREE.MeshPhongMaterial({color: 'red', transparent: true, opacity: 0.0});
		this.missile = new THREE.Mesh(littlesphere, geometryR);
		this.missile.position.set(this.tab_aliens[nbr].position.x + this.groupA.position.x, this.tab_aliens[nbr].position.y, this.tab_aliens[nbr].position.z + this.groupA.position.z);
		var pokemon1 = await this.chargerGLTF("../Src/medias/models/Egg/untitled.gltf");
		pokemon1.scene.scale.set(0.02,0.02,0.02);
		this.missile.add(pokemon1.scene);
		this.missile.visible = false;
		return this.missile
	}

	random_shoot = () => {
		if(!this.condmissile){
			this.condmissile = true;
			var nbr =  Math.floor(Math.random()*this.tab_aliens.length);
			this.missile.position.set(this.tab_aliens[nbr].position.x + this.groupA.position.x, this.tab_aliens[nbr].position.y, this.tab_aliens[nbr].position.z + this.groupA.position.z);
			this.missile.visible = true;
		}
	}

	moveMissile = () => {
		if (this.missile.position.z <= 19){
			this.missile.position.z += this.missile_vitesse;
			this.missile.rotation.z += 0.5;
		}else{
			this.removeMissile();
		}
	}

	removeMissile(){
		this.missile.visible = false;
		this.condmissile = false;
	}

	CollisionBunker = (tab_bunkers, group) => {
	  var raycaster = new THREE.Raycaster();
	  var point = new THREE.Vector3(-1,0,-1);
	  raycaster.set(this.missile.position, point);
	  var intersect = raycaster.intersectObjects(tab_bunkers);
	  var cpt = 0;
	  if(intersect.length > 0){
	    while(intersect[0].object.uuid != tab_bunkers[cpt].uuid){
	      cpt++;
	    }
	    if(intersect[0].object.uuid == tab_bunkers[cpt].uuid){
	      this.removeMissile();
	      intersect[0].object.material.opacity -= 0.2;
	      if(intersect[0].object.material.opacity <= 0.5){
	        tab_bunkers.splice(cpt,1);
	        group.remove(intersect[0].object);
	      }
		  return true;
	    }
	  }
	  return false;
	}

	Collision = (tab_player, condlife, cond) => {
	  var raycaster = new THREE.Raycaster();
	  var point = new THREE.Vector3(-1,0,-1);
	  raycaster.set(this.missile.position, point);
	  var intersect = raycaster.intersectObjects(tab_player);
	  if(intersect.length > 0){
	    if(intersect[0].object.uuid == tab_player[0].uuid){
	      this.removeMissile();
	      if(!condlife){
	      	this.Play(cond);
	      	this.nbr_life = this.nbr_life - 1;
	        if(this.nbr_life == 2){
	      	  document.getElementById("Vies3").style.display = "none";
	      	  document.getElementById("Vies2").style.display = "block";
	        }
	        if(this.nbr_life == 1){
	      	  document.getElementById("Vies2").style.display = "none";
	      	  document.getElementById("Vies1").style.display = "block";
	        }
	        if(this.nbr_life <= 0){
	      	  document.getElementById("Vies1").style.display = "none";
	      	  document.getElementById("Vies0").style.display = "block";
	      	  console.log("GAME OVER");
	      	  intersect[0].object.visible = false;
	          tab_player.splice(0,1);
	          this.condgameover = true;
	          return true
	        }
	      }
	    }
	  }
	  return false;
	}

    async createSoucoupe(){
      const cube = new THREE.BoxGeometry( 1, 1, 1 );
      const geometryG = new THREE.MeshLambertMaterial({color: 'green',transparent : true, opacity: 0.0 });
      var pokemon1 = await this.chargerGLTF("../Src/medias/models/Mew/scene.gltf");
      pokemon1.scene.scale.set(0.05,0.05,0.05);
      pokemon1.scene.position.y = 1;
      this.mesh_soucoupe = new THREE.Mesh(cube, geometryG);
      this.mesh_soucoupe.position.set(this.pos_soucoupe, 0.5, -15);
      this.mesh_soucoupe.rotateY(-Math.PI/2);
      this.mesh_soucoupe.add(pokemon1.scene);
      this.tab_soucoupe.push(this.mesh_soucoupe);
      return this.mesh_soucoupe;
  }

	moveSoucoupe = () => {
	  if(this.mesh_soucoupe.position.x >= -this.pos_soucoupe){
	    this.mesh_soucoupe.position.x -= this.vitesse;
		this.mesh_soucoupe.rotation.y += 0.05;
	  }else{
	    this.mesh_soucoupe.position.x = this.pos_soucoupe;
	  }
	}

	Play = (cond) => {
	    if(cond){
	      this.audio.play();
	    }
  	}

	getMeshSoucoupe = () => {
		return this.mesh_soucoupe;
	}

	nextLevel = () => {
		this.vitesse += 0.05;
		this.missile_vitesse +=0.1;
		this.pos_soucoupe += 30;
		this.tab_aliens = [];
	    this.tab_soucoupe = [];
	    for(var i=0; i<this.groupA.children.length; i++){
	    	this.groupA.children[i].visible = true;
	    	this.tab_aliens.push(this.groupA.children[i])
	    }
	    this.mesh_soucoupe.visible = true;
	    this.tab_soucoupe.push(this.mesh_soucoupe);
		this.missile.visible = false;
		this.condmissile = false;
	}

	kill = () => {
		for(var i=0; i<this.groupA.children.length; i++){
	    	this.groupA.children[i].visible = false;
	    }
		this.mesh_soucoupe.visible = false;
	}

	reset = () => {
	    this.tab_aliens = [];
	    this.tab_soucoupe = [];
	    for(var i=0; i<this.groupA.children.length; i++){
	    	this.groupA.children[i].visible = true;
	    	this.tab_aliens.push(this.groupA.children[i])
	    }
	    this.mesh_soucoupe.visible = true;
	    this.tab_soucoupe.push(this.mesh_soucoupe);
	    document.getElementById("Vies3").style.display = "block";
	    document.getElementById("Vies0").style.display = "none";
	    this.condgameover = false;
	    this.cond1 = true;
	  	this.cond2 = false;
		this.missile.visible = false;
	    this.condmissile = false;
	    this.nbr_life = 3;
		this.vitesse = 0.05;
		this.missile_vitesse = 0.2;
		this.pos_soucoupe = 70;
	    this.box = new THREE.Box3().setFromObject(this.groupA);
	    this.audio = new Audio('Src/medias/sounds/attaque.mp3');
    }

	getMeshSoucoupe = () => {
		return this.mesh_soucoupe;
	}

	get getAliens(){
		return this.tab_aliens;
	}

	get getGroupAliens(){
		return this.groupA;
	}

	get getCondMissile(){
		return this.condmissile;
	}

	get getMissile(){
		return this.missile;
	}

	get getSoucoupe(){
		return this.tab_soucoupe;
	}

	get getNbrLife(){
		return this.nbr_life;
	}

	get getGameOver(){
		return this.condgameover;
	}

	get getPosSoucoupe(){
		return this.position;
	}

}




