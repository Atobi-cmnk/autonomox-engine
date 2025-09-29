const button = document.getElementById('ping');
const output = document.getElementById('out');

function log(message) {
  const time = new Date().toLocaleTimeString();
  output.textContent = `[${time}] ${message}\n` + output.textContent;
}

button.addEventListener('click', async () => {
  log('Pinging...');
  try {
    const start = performance.now();
    const res = await fetch(window.location.href, { cache: 'no-store' });
    const ms = Math.round(performance.now() - start);
    log(`OK ${res.status} in ${ms}ms`);
  } catch (e) {
    log(`Error: ${e?.message || e}`);
  }
});
