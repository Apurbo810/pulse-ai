import si from "systeminformation";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

while (true) {
  const load = await si.currentLoad();

  console.clear();

  console.log("Current Load :", load.currentLoad.toFixed(2) + "%");
  console.log("User         :", load.currentLoadUser.toFixed(2) + "%");
  console.log("System       :", load.currentLoadSystem.toFixed(2) + "%");
  console.log("Idle         :", load.currentLoadIdle.toFixed(2) + "%");

  await sleep(2000);
}