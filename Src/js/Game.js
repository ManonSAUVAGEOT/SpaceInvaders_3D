import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.module.js";
import {TrackballControls} from  "https://threejs.org/examples/jsm/controls/TrackballControls.js";
import Player from "./Player.js";
import Alien from "./Alien.js";
import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js";
import { HalftonePass } from "https://threejs.org/examples/jsm/postprocessing/HalftonePass.js";

var container, w, h, scene, controls, renderer, camera, light, audio, audiovic;
var score,highscore = 0, group, soucoupe, bunker, player, level, pokeball, missile;
var textGeometry, textMaterial, textMesh;
var gamewin, condlife, pause, condmusic, condmenu, condpro, condstart = true;
var composer, params, halftonePass;

const i = new Player();
const a = new Alien();

document.getElementById("highscore").innerHTML = 'HighScore: ' + highscore;
window.addEventListener('resize', resize);

//h
document.addEventListener('keydown', menu);
//m
document.addEventListener('keydown', musique);
//p
document.addEventListener('keydown', playgame);
//--> et <--
document.addEventListener('keydown', i.movePlayer);
document.addEventListener('keydown', i.switchCamera);
//space
document.addEventListener('keyup', i.shoot);
//k
document.addEventListener('keydown', kill);
//i
document.addEventListener('keydown',invincible);
//s
document.addEventListener('keydown',effet);

//Commencer une partie
document.getElementById("start").onclick = () => {
  if(condstart){
    //Première partie
    console.log("C'est parti");
    document.getElementById("acceuil").style.display = "none";
    document.getElementById("game").style.display = "block";
    condstart = false;
    init();
  }else{
    //Rejouer après la première partie
    console.log("C'est reparti");
    document.getElementById("acceuil").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("level1").style.visibility = "visible";
    reset();
    setTimeout( () => {
      animate();
      document.getElementById("level1").style.visibility = "hidden";
    }, 2000);
  }
};

//Next Level
document.getElementById("nextlevel").onclick = () => {
  console.log("Next level!");
  if(condmusic){
    //audiopause(audiovic);   
  }
  level = level + 1;
  newgame();
  document.getElementById("gamewin").style.visibility = "hidden";
  if(level == 2){
    document.getElementById("level2").style.visibility = "visible";
  }
  if(level == 3){
    document.getElementById("level3").style.visibility = "visible";
  }
  setTimeout( () => {
    animate();
    document.getElementById("level2").style.visibility = "hidden";
    document.getElementById("level3").style.visibility = "hidden";
  }, 2000);
};

//Revenir au menu
document.getElementById("menu").onclick = () => {
  console.log("Retour Menu");
  if(condmusic){
    audio = new Audio('Src/medias/sounds/defaite.m4a');
    play(audio);
  }
  if(score > highscore){
    highscore = score;
  }
  document.getElementById("acceuil").style.display = "block";
  document.getElementById("highscore").innerHTML = 'HighScore: ' + highscore;
  document.getElementById("game").style.display = "none";
  document.getElementById("gameover").style.visibility = "hidden";
};

//Revenir au menu après avoir gagner
document.getElementById("endmenu").onclick = () => {
  console.log("Retour Menu");
  if(condmusic){
    //audiopause(audiovic);
  }
  if(score > highscore){
    highscore = score;
  }
  document.getElementById("acceuil").style.display = "block";
  document.getElementById("highscore").innerHTML = 'HighScore: ' + highscore;
  document.getElementById("game").style.display = "none";
  document.getElementById("endgame").style.visibility = "hidden";
};

async function init(){
  document.getElementById("level1").style.visibility = "visible";
  container = document.querySelector('#game');
  w = container.clientWidth;
  h = container.clientHeight;
  gamewin = false;
  
  //Scene
  scene = new THREE.Scene();

  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'Src/medias/images/background/nx.png',
    'Src/medias/images/background/px.png',
    'Src/medias/images/background/py.png',
    'Src/medias/images/background/ny.png',
    'Src/medias/images/background/nz.png',
    'Src/medias/images/background/pz.png',
  ]);
  scene.background = texture;

  //Camera
  camera = i.createCamera(w,h);

  //Contrôle
  controls = new TrackballControls(i.getCamera, container);
  controls.target = new THREE.Vector3(0, 0, 0.75);

  //Rendu
  const renderConfig = {container, alpha: true};
  renderer = new THREE.WebGLRenderer(renderConfig);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  //Lumière
  var color = 0xFFFFFF;
  var intensity = 1;
  light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 40);
  scene.add(light);

  //Post-processing
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  params = {
    shape: 1,
    radius: 4,
    rotateR: Math.PI / 12,
    rotateB: Math.PI / 12 * 2,
    rotateG: Math.PI / 12 * 3,
    scatter: 0,
    blending: 1,
    blendingMode: 1,
    greyscale: false,
    disable: false
  };
  halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );

  //Bunker, dresseur et pokéball
  bunker = i.createBunker();
  scene.add(bunker);
  await i.createPlayer().then((pokemon) => {
    player = pokemon;
    scene.add(player);
  })
  await i.createMissile().then((pokemon) => {
    pokeball = pokemon;
    scene.add(pokeball);
  })

  //Pokémons, pokémon légendaire et projectile
  await a.createSoucoupe().then((pokemon) => {
    soucoupe = pokemon;
    scene.add(soucoupe);
  })
  await a.createAlien().then((pokemon) => {
    group = pokemon;
    scene.add(group);
  })
  await a.createMissile().then((pokemon) => {
    missile = pokemon;
    scene.add(missile);
  })

  score = 0;
  level = 1;
  pause = false; 
  condmusic = true; 
  condmenu=false;
  condpro = true;
  audio = new Audio('Src/medias/sounds/PokemonMusic.m4a');
  //audiovic = new Audio('Src/medias/sounds/victoire.m4a');
  setFirstScore()
  play(audio);
  document.getElementById("level1").style.visibility = "hidden";
  animate();
}

function reset(){
  scene.remove(player);
  scene.remove(soucoupe);
  scene.remove(group);
  group.length = 0;
  scene.remove(bunker);
  scene.remove(textMesh);
  scene.remove(pokeball);
  scene.remove(missile);

  score = 0;
  level = 1;
  pause = false;
  condmenu=false;
  gamewin = false;

  a.reset();
  i.reset();

  player = i.getMeshPlayer;
  scene.add(player);
  bunker = i.createBunker();
  scene.add(bunker);
  pokeball = i.getMissile;
  scene.add(pokeball);

  soucoupe = a.getMeshSoucoupe();
  soucoupe.position.set(70, 0.5, -15);
  scene.add(soucoupe);
  group = a.getGroupAliens;
  group.position.set(0,0,0);
  scene.add(group);
  missile = a.getMissile;
  scene.add(missile);

  audio = new Audio('Src/medias/sounds/PokemonMusic.m4a');
  if(condmusic){
    play(audio);
  }
  setFirstScore();
}

//Créer un nouveau jeu pour changer de niveau
async function newgame(){
  scene.remove(missile);
  a.nextLevel();
  soucoupe = a.getMeshSoucoupe();
  soucoupe.position.set(a.getPosSoucoupe, 0.5, -15);
  scene.add(soucoupe);
  group = a.getGroupAliens;
  group.position.set(0,0,0);
  scene.add(group);
  missile = a.getMissile;
  scene.add(missile);

  scene.remove(pokeball);
  i.newGame();
  pokeball = i.getMissile;
  scene.add(pokeball);
  gamewin = false;
  
  audio = new Audio('Src/medias/sounds/Musique.mp3');
  if(condmusic){
    play(audio);
  }
}

//Fonction d'animation
function animate() {
  if(!pause){
    if(!a.getGameOver && !gamewin){
      if(a.moveAliens(score)){
        audiopause(audio);
      }
      a.moveSoucoupe();
      if(!i.getAlien){
        a.random_shoot();
      }
      if(i.getCondMissile){
        i.moveMissile(scene);
        if(i.CollisionBunker()){
          addProcessing();
        }
        if(i.CollisionAlien(a.getAliens, condmusic)){
          score = score + i.getScore;
          i.CheckAlien(a.getAliens);
          setScore();
        }
        if(i.CollisionSoucoupe(a.getSoucoupe)){
          score = score + 100;
          setScore();
        }
      }
      if(a.getCondMissile){
        a.moveMissile();
        if(a.CollisionBunker(i.getBunkers, i.getGroupBunkers, scene)){
          addProcessing();
        }
        if(a.Collision(i.getPlayer, condlife, condmusic)){
          audiopause(audio);
          document.getElementById("gameover").style.visibility = "visible";
          document.getElementById("scorefinal").innerHTML = 'Score : ' + score;
        }
      }
      if(i.getAlien){
        console.log("You win!");
        if(condmusic){
          audiopause(audio);
          //play(audiovic);
        }
        gamewin = true;
        if(level == 3){
          document.getElementById("endgame").style.visibility = "visible";
          document.getElementById("scorefinal3").innerHTML = 'Score Final: ' + score;
        }else{
          document.getElementById("gamewin").style.visibility = "visible";
          document.getElementById("scorefinal2").innerHTML = 'Score : ' + score;
        }
      }
      requestAnimationFrame(animate);
      //controls.update();
      composer.render();
    }
  }
}

//Fonctions pour la musique
function musique(event){
  if(event.key == "m"){
    if(condmusic){
    console.log("Stop musique")
    audiopause(audio);
    //audiopause(audiovic);
    condmusic = false;
    }else{
      console.log("Musique")
      play(audio);
      condmusic = true;
    }
  }
}

function play(audio) {
  audio.play();
}
function audiopause(audio) {
  audio.pause();
  audio.currentTime = 0
}

//Fonction pour mettre pause
function playgame(event){
  if(event.key == "p"){
    if(pause){
      document.getElementById("pause").style.visibility = "hidden";
      pause = false;
      animate();
    }else{
      console.log("Pause!");
      document.getElementById("pause").style.visibility = "visible";
      pause = true;
    }
  }
}

//Fonction pour ajuster le jeu à la taille de la fenêtre
function resize() {
  w = container.clientWidth;
  h = container.clientHeight;
  i.getCamera.aspect = w/h;
  i.getCamera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

//Fonction pour attraper tout les Pokémons
function kill(event) {
  if(event.key == "k"){
    scene.remove(group);
    scene.remove(soucoupe);
    group.length = 0;
    a.kill();
    i.killAlien();
    i.killSoucoupe();
    console.log("KILL!");
  }
}

//Fonction pour afficher les raccourcis
function menu(event) {
  if(event.key == "h"){
    if(condmenu){
      document.getElementById("pokédex").style.visibility = "hidden";
      condmenu=false;
      pause = false;
      animate();
    }else{
      console.log("Pokédex!");
      document.getElementById("pokédex").style.visibility = "visible";
      condmenu = true;
      pause = true;
      animate();
    }
  }
}

//Fonction pour devenir invincible
function invincible(event){
  if(event.keyCode == 73){
    if(condlife){
      console.log("You are not invicible anymore!")
      if(a.getNbrLife == 3){
        document.getElementById("Invincible").style.display = "none";
        document.getElementById("Vies3").style.display = "block";
      }
      else if(a.getNbrLife == 2){
        document.getElementById("Invincible").style.display = "none";
        document.getElementById("Vies2").style.display = "block";
      }
      else if(a.getNbrLife == 1){
        document.getElementById("Invincible").style.display = "none";
        document.getElementById("Vies1").style.display = "block";
      }
      condlife = false;
    }else{
      console.log("You are INVINCIBLE !");
      document.getElementById("Vies3").style.display = "none";
      document.getElementById("Vies1").style.display = "none";
      document.getElementById("Vies2").style.display = "none";
      document.getElementById("Invincible").style.display = "block";
      condlife = true;
    }
  }
}

//Fonctions pour le score
function setFirstScore(){
    const loader = new THREE.FontLoader();
    loader.load('./Src/js/gentilis_regular.typeface.json', function(text) {
    textGeometry = new THREE.TextGeometry("Score : " + score, {font: text , size: 3, height: 1});
    textMaterial = new THREE.MeshBasicMaterial({color: 'yellow'});
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-10,8,-10);
    scene.add(textMesh); });
}

function setScore(){
  scene.remove(textMesh);
  const loader = new THREE.FontLoader();
  loader.load('./Src/js/gentilis_regular.typeface.json', function(text) {
    textGeometry = new THREE.TextGeometry("Score : " + score, {font: text , size: 3, height: 1});
    textMaterial = new THREE.MeshBasicMaterial({color: 'yellow'});
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-10,8,-10);
    if(i.getCondCam){
      textMesh.rotateX(Math.PI/8);
    }
    scene.add(textMesh); });
}

//Fonctions post-processing
function addProcessing(){
  if(condpro){
    composer.addPass( halftonePass );
    setTimeout( () => {
      removeProcessing();
    }, 500);
  }
}

function removeProcessing(){
  composer.removePass( halftonePass );
}

function effet(event) {
  if(event.key == "s"){
    console.log("plus d'effet");
    condpro = !condpro;
  }
}