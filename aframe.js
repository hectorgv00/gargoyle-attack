/**
 * Este archivo contiene la lógica de la aplicación. Es un juego en el que tendrás que disparar a las gárgolas que aparecen en la escena. Cada vez que dispares a una gárgola, tu puntuación aumentará en 1. Si no das a la gargola en menos de 3 segundos, perderás.
 */

document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("a-scene");
  const camera = document.querySelector("a-camera");
  const score = 0;
  let canShoot = true;

  // Bloqueo del ratón
  blockMouse(scene);

  // Disparo del jugador
  userShoot(scene, camera, canShoot);

  // Sistema de colisiones
  colisions(scene, score);
});

const colisions = (scene, score) => {
  scene.addEventListener("collide", (e) => {
    const {
      detail: { body, target },
    } = e;

    const actualTarget = e.target;
    const targetClasslist = actualTarget.classList;

    if (targetClasslist.contains("bullet") && body.el.id === "enemy") {
      scene.removeChild(body.el);
      actualTarget.setAttribute("visible", false);
      score++;
      document.getElementById("resultado-visible").textContent = score;
      regenerateEnemy(scene, score);
    }
  });
};

const blockMouse = (scene) => {
  scene.canvas.onclick = () => {
    scene.canvas.requestPointerLock();
  };
};

const unlockMouse = (scene) => {
  const canvas = scene.canvas || scene.querySelector("canvas");
  if (canvas && document.exitPointerLock) {
    document.exitPointerLock();
  }
};
const userShoot = (scene, camera, canShoot) => {
  scene.addEventListener("mousedown", (e) => {
    if (e.button === 0 && canShoot) {
      canShoot = false;

      manageBullet(scene, camera);

      // Cooldown de disparo
      setTimeout(() => (canShoot = true), 100);
    }
  });
};

const manageBullet = (scene, camera) => {
  // Crear bala
  const bullet = document.createElement("a-sphere");
  const direction = new THREE.Vector3();
  camera.object3D.getWorldDirection(direction);

  bullet.setAttribute("position", {
    ...camera.object3D.position,
    y: camera.object3D.position.y + 1.5,
  });
  bullet.setAttribute(
    "dynamic-body",
    "shape: sphere; sphereRadius: 0.1; mass: 0.1"
  );
  bullet.setAttribute("material", "color: black");
  bullet.setAttribute("scale", "0.2 0.2 0.2");
  bullet.setAttribute("velocity", {
    x: -direction.x * 100,
    y: -direction.y * 100,
    z: -direction.z * 100,
  });
  bullet.classList.add("bullet");

  scene.appendChild(bullet);

  setTimeout(() => {
    scene.removeChild(bullet);
  }, 2000);
};

const regenerateEnemy = (scene, score) => {
  const enemy = document.createElement("a-entity");
  enemy.setAttribute("id", "enemy");
  enemy.setAttribute("position", {
    x: Math.floor(Math.random() * 10) - 5,
    y: 4,
    z: Math.floor(Math.random() * 10) - 5,
  });
  enemy.setAttribute("dynamic-body", "shape: box; mass: 0");
  enemy.setAttribute("material", "color: red");
  enemy.setAttribute("gltf-model", "#gargolaModel");
  enemy.setAttribute("scale", "4 4 4");

  scene.appendChild(enemy);

  makeEnemyExplode(scene, enemy, score);
};

const makeEnemyExplode = (scene, enemy, score) => {
  enemy.addEventListener("model-loaded", () => {
    const initialTime = Date.now();
    console.log(initialTime);
    const finalTime = initialTime + 3000;

    const model = enemy.getObject3D("mesh"); // Obtener el mesh del modelo
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const percentage =
        (currentTime - initialTime) / (finalTime - initialTime);
      console.log(percentage);
      console.log(model);
      if (model) {
        model.traverse((node) => {
          if (node.isMesh) {
            node.material.color.set(
              `rgb(${Math.ceil(Number(percentage)) * 255},0,0)`
            );
            node.scale.set(1 + percentage, 1 + percentage, 1 + percentage);
            node.position.y = 0 + percentage;

            console.log(node.position.y);
          }
        });
      }

      if (currentTime >= finalTime) {
        clearInterval(interval);
        scene.removeChild(enemy);
        deadScreen(scene, score);
      }
    }, 100);
  });
};

const deadScreen = (scene, score) => {
  unlockMouse(scene);
  const deadScreen = document.getElementById("deadScreen");
  const resultado = document.getElementById("resultado");
  deadScreen.style.display = "flex";
  resultado.textContent = score;
};
