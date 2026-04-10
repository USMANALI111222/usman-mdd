function getRuntime() {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  let result = "";
  if (days > 0) result += `${days} day${days !== 1 ? "s" : ""}, `;
  if (hours > 0) result += `${hours} hour${hours !== 1 ? "s" : ""}, `;
  if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? "s" : ""}, `;
  result += `${seconds} second${seconds !== 1 ? "s" : ""}`;

  return result;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanNum(num) {
  return num.replace(/[^0-9]/g, "");
}

module.exports = { getRuntime, formatBytes, sleep, randomItem, cleanNum };
