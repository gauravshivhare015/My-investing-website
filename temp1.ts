import axios from 'axios';

async function run() {
  const res = await axios.get('https://docs.google.com/spreadsheets/d/1lWJXcBqHQia0qrD-FHb7oFM2kAQ_37P3tvPFFBiJ37o/export?format=csv');
  console.log(res.data.split('\n').slice(0, 10).join('\n'));
}

run();
