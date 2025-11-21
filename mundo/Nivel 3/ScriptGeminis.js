console.clear();

const ARTIFACT_NAME = 'geminis';
const ARTIFACT_THRESHOLD = 20;

var Stage = (function () {
  function Stage() {
    var _this = this;
    this.render = function () {
      _this.renderer.render(_this.scene, _this.camera);
    };
    this.add = function (elem) { _this.scene.add(elem); };
    this.remove = function (elem) { _this.scene.remove(elem); };

    this.container = document.getElementById("game");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // tono oscuro de Nivel 3
    this.renderer.setClearColor("#202030", 1);
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    var aspect = window.innerWidth / window.innerHeight;
    var d = 20;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = 2;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.light.position.set(0, 499, 0);
    this.scene.add(this.light);
    this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.softLight);

    window.addEventListener("resize", function () {
      _this.onResize();
    });
    this.onResize();
  }
  Stage.prototype.setCamera = function (y, speed) {
    if (speed === void 0) speed = 0.3;
    TweenLite.to(this.camera.position, speed, { y: y + 4, ease: Power1.easeInOut });
    // mantener lookAt suave si es necesario
  };
  Stage.prototype.onResize = function () {
    var viewSize = 30;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.left = window.innerWidth / -viewSize;
    this.camera.right = window.innerWidth / viewSize;
    this.camera.top = window.innerHeight / viewSize;
    this.camera.bottom = window.innerHeight / -viewSize;
    this.camera.updateProjectionMatrix();
  };
  return Stage;
})();

var Block = (function () {
  function Block(block) {
    this.STATES = { ACTIVE: "active", STOPPED: "stopped", MISSED: "missed" };
    this.MOVE_AMOUNT = 12;
    this.dimension = { width: 0, height: 0, depth: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.targetBlock = block;
    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
    this.workingPlane = this.index % 2 ? "x" : "z";
    this.workingDimension = this.index % 2 ? "width" : "depth";

    this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10;
    this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2;
    this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10;

    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0;
    this.position.y = this.dimension.height * this.index;
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0;

    this.colorOffset = this.targetBlock ? this.targetBlock.colorOffset : Math.round(Math.random() * 100);

    // colores adaptados para Géminis (azules)
    if (!this.targetBlock) {
      this.color = 0x4DB8FF;
    } else {
      var offset = this.index + this.colorOffset;
      var r = Math.sin(0.3 * offset) * 55 + 80;
      var g = Math.sin(0.3 * offset + 2) * 55 + 150;
      var b = Math.sin(0.3 * offset + 4) * 55 + 200;
      this.color = new THREE.Color(r / 255, g / 255, b / 255);
    }

    // Estado inicial
    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;

    // VELOCIDAD: usar signo positivo y small step similar a Base
    this.speed = 0.05 + this.index * 0.005;
    if (this.index > 40) this.speed = 0.05 + 40 * 0.005;

    // direction (movimiento): inicializar con speed (se invertirá si hace falta)
    this.direction = this.index % 2 ? this.speed : -this.speed;

    // crear geometría (applyMatrix compatible con r83 ya presente)
    var geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));

    // MATERIAL: usar MeshLambertMaterial para comportamiento igual al Base
    this.material = new THREE.MeshLambertMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, this.material);

    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    // Solo los bloques activos comienzan desplazados en el plano
    if (this.state === this.STATES.ACTIVE) {
      this.position[this.workingPlane] = this.index % 2 ? this.MOVE_AMOUNT : -this.MOVE_AMOUNT;
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
    }
  }

  // Reversión simple de dirección
  Block.prototype.reverseDirection = function () {
    this.direction = -this.direction;
  };

  Block.prototype.place = function () {
    // protección por si falta targetBlock
    if (!this.targetBlock) {
      this.state = this.STATES.STOPPED;
      return { plane: this.workingPlane, direction: this.direction };
    }

    this.state = this.STATES.STOPPED;
    var overlap = this.targetBlock.dimension[this.workingDimension] - Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane]);
    var blocksToReturn = { plane: this.workingPlane, direction: this.direction };

    // bonus (alineado)
    if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension];
      blocksToReturn.bonus = true;
      this.position.x = this.targetBlock.position.x;
      this.position.z = this.targetBlock.position.z;
      this.dimension.width = this.targetBlock.dimension.width;
      this.dimension.depth = this.targetBlock.dimension.depth;
    }

    if (overlap > 0) {
      var choppedDimensions = { width: this.dimension.width, height: this.dimension.height, depth: this.dimension.depth };
      choppedDimensions[this.workingDimension] -= overlap;
      this.dimension[this.workingDimension] = overlap;

      var placedGeometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
      placedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));
      var placedMesh = new THREE.Mesh(placedGeometry, this.material);

      var choppedGeometry = new THREE.BoxGeometry(choppedDimensions.width, choppedDimensions.height, choppedDimensions.depth);
      choppedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(choppedDimensions.width / 2, choppedDimensions.height / 2, choppedDimensions.depth / 2));
      var choppedMesh = new THREE.Mesh(choppedGeometry, this.material);

      var choppedPosition = { x: this.position.x, y: this.position.y, z: this.position.z };

      if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {
        this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane];
      } else {
        choppedPosition[this.workingPlane] += overlap;
      }

      placedMesh.position.set(this.position.x, this.position.y, this.position.z);
      choppedMesh.position.set(choppedPosition.x, choppedPosition.y, choppedPosition.z);

      blocksToReturn.placed = placedMesh;
      if (!blocksToReturn.bonus) blocksToReturn.chopped = choppedMesh;
    } else {
      this.state = this.STATES.MISSED;
    }

    this.dimension[this.workingDimension] = overlap;
    return blocksToReturn;
  };

  Block.prototype.tick = function () {
    if (this.state == this.STATES.ACTIVE) {
      var value = this.position[this.workingPlane];
      if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) this.reverseDirection();
      this.position[this.workingPlane] += this.direction;
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
    }
  };

  return Block;
})();

var Game = (function () {
  function Game() {
    var _this = this;
    this.STATES = { READY: "game-ready", PLAYING: "playing", GAMEOVER: "game-over" };

    this.blocks = [];
    this.stage = new Stage();

    this.mainContainer = document.getElementById("container");
    this.scoreContainer = document.getElementById("score");
    this.startButton = document.getElementById("start-button");
    this.instructions = document.getElementById("instructions");
    this.finalScore = document.getElementById("final-score");

    this.artifactScoreDisplay = document.getElementById("artifact-score");
    this.artifactMessage = document.getElementById("artifact-message");

    this.newBlocks = new THREE.Group();
    this.placedBlocks = new THREE.Group();
    this.choppedBlocks = new THREE.Group();

    this.stage.add(this.newBlocks);
    this.stage.add(this.placedBlocks);
    this.stage.add(this.choppedBlocks);

    this.addBlock = this.addBlock.bind(this);
    this.placeBlock = this.placeBlock.bind(this);
    this.tick = this.tick.bind(this);
    this.onTap = function () {
      if (_this.state == "game-ready") _this.startGame();
      else if (_this.state == "playing") _this.placeBlock();
    };
    this.onKeyPress = function (e) { if (e.keyCode == 32) _this.onTap(); };

    document.addEventListener("mousedown", this.onTap);
    document.addEventListener("touchstart", this.onTap);
    document.addEventListener("keydown", this.onKeyPress);

    this.setState("game-ready");
    this.addBlock();
    this.tick();

    this.initArtifactStatus();
  }

  Game.prototype.initArtifactStatus = function () {
    var gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained[ARTIFACT_NAME]) {
      if (this.artifactScoreDisplay) this.artifactScoreDisplay.textContent = String(ARTIFACT_THRESHOLD);
      if (this.artifactMessage) this.artifactMessage.textContent = "¡Artefacto de Géminis Obtenido! 🎉";
    } else {
      if (this.artifactScoreDisplay) this.artifactScoreDisplay.textContent = "0";
      if (this.artifactMessage) this.artifactMessage.textContent = "";
    }
  };

  Game.prototype.setState = function (state) {
    // asigna la clase directa para que tu CSS .game-ready / .game-over funcione
    this.mainContainer.className = state;
    if (state == "game-over") {
      if (this.finalScore) this.finalScore.innerHTML = String(this.blocks.length - 2);
    }
    this.state = state;
  };

  Game.prototype.startGame = function () {
    this.setState("playing");
    if (this.instructions) this.instructions.style.opacity = 0;
    if (this.scoreContainer) this.scoreContainer.innerHTML = "0";
    // añadir un bloque adicional al iniciar para similar al Base
    this.addBlock();
  };

  Game.prototype.resetGame = function () {
    var _this = this;
    var gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained[ARTIFACT_NAME]) {
      delete gained[ARTIFACT_NAME];
      localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
      if (this.artifactMessage) this.artifactMessage.textContent = "";
    }
    if (this.artifactScoreDisplay) this.artifactScoreDisplay.textContent = "0";

    this.blocks.forEach(function (block) { _this.stage.remove(block.mesh); });
    this.blocks = [];
    this.stage.setCamera(2);
    this.setState("game-ready");
    this.addBlock();
    if (this.instructions) this.instructions.style.opacity = 1;
  };

  Game.prototype.endGame = function () {
    this.setState("game-over");
    var currentScore = this.blocks.length - 2;
    if (currentScore >= ARTIFACT_THRESHOLD) {
      var gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
      if (!gained[ARTIFACT_NAME]) {
        gained[ARTIFACT_NAME] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
        if (this.artifactMessage) this.artifactMessage.textContent = "¡Artefacto de Géminis Obtenido! 🎉";
      }
      if (this.artifactScoreDisplay) this.artifactScoreDisplay.textContent = String(ARTIFACT_THRESHOLD);
    } else {
      var currentArtifactScore = parseInt(this.artifactScoreDisplay ? this.artifactScoreDisplay.textContent : "0") || 0;
      if (currentScore > currentArtifactScore && this.artifactScoreDisplay) {
        this.artifactScoreDisplay.textContent = String(currentScore);
      }
    }
  };

  Game.prototype.tick = function () {
    var _this = this;
    if (this.state == "playing") {
      var last = this.blocks[this.blocks.length - 1];
      if (last) last.tick();
    }
    this.stage.render();
    requestAnimationFrame(function () { _this.tick(); });
  };

  Game.prototype.placeBlock = function () {
    try {
      var currentBlock = this.blocks[this.blocks.length - 1];
      if (!currentBlock) return;
      var newBlocks = currentBlock.place();
      this.newBlocks.remove(currentBlock.mesh);
      if (newBlocks.placed) this.placedBlocks.add(newBlocks.placed);
      if (newBlocks.chopped) {
        this.choppedBlocks.add(newBlocks.chopped);
        var positionParams = { y: "-=30", ease: Power1.easeIn, onComplete: (function (ch) { return function(){ _this.choppedBlocks.remove(ch); }; })(newBlocks.chopped) };
        var rotateRandomness = 10;
        var rotationParams = {
          delay: 0.05,
          x: newBlocks.plane == "z" ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
          z: newBlocks.plane == "x" ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
          y: Math.random() * 0.1
        };
        if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
          positionParams[newBlocks.plane] = "+=" + 40 * Math.abs(newBlocks.direction);
        } else {
          positionParams[newBlocks.plane] = "-=" + 40 * Math.abs(newBlocks.direction);
        }
        TweenLite.to(newBlocks.chopped.position, 1, positionParams);
        TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams);
      }
      this.addBlock();
    } catch (err) {
      console.error("[Geminis] Error al colocar bloque:", err);
      try { this.endGame(); } catch(e){ }
    }
  };

  Game.prototype.addBlock = function () {
    var lastBlock = this.blocks[this.blocks.length - 1];
    if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) return this.endGame();
    if (this.scoreContainer) this.scoreContainer.innerHTML = String(this.blocks.length - 1);
    var newKidOnTheBlock = new Block(lastBlock);
    this.newBlocks.add(newKidOnTheBlock.mesh);
    this.blocks.push(newKidOnTheBlock);
    this.stage.setCamera(this.blocks.length * 2);
    if (this.blocks.length >= 5 && this.instructions) this.instructions.classList.add("hide");
  };

  return Game;
})();

var game = new Game();
var startBtn = document.getElementById("start-button");
if (startBtn) startBtn.onclick = function () { game.onTap(); };
var goOver = document.querySelector(".game-over");
if (goOver) goOver.onclick = function () { game.resetGame(); };