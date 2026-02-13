import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, onValue, update }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
});

const db = getDatabase(app);
const dataRef = ref(db, "materials");

let deliveryData = [];

/* LOAD */
onValue(dataRef, snap => {
  deliveryData = [];
  snap.forEach(c => {
    const d = c.val();
    if (d.status === "delivery") {
      deliveryData.push({ id: c.key, ...d });
    }
  });
  render(deliveryData);
});

function render(data) {
  listData.innerHTML = "";
  data.forEach(d => {
    listData.innerHTML += `
    <tr>
      <td><input type="checkbox" class="pilih" value="${d.id}"></td>
      <td>${d.mid}</td>
      <td>${d.material}</td>
      <td>${d.bin}</td>
      <td>${d.net}</td>
      <td>${d.tanggalDelivery}</td>
    </tr>`;
  });
}

/* SEARCH */
function filterData() {
  const id = searchId.value.toLowerCase();
  const date = searchDate.value;

  const filtered = deliveryData.filter(d => {
    const matchId = d.mid.toLowerCase().includes(id);
    const matchDate = !date || d.tanggalDelivery.includes(date);
    return matchId && matchDate;
  });

  render(filtered);
}

searchId.onkeyup = filterData;
searchDate.onchange = filterData;

/* RETURN */
window.returnData = () => {
  document.querySelectorAll(".pilih:checked").forEach(cb => {
    update(ref(db, "materials/" + cb.value), { status: "stock" });
  });
};

/* EXCEL */
window.downloadExcel = () => {
  const wb = XLSX.utils.table_to_book(document.querySelector("table"));
  XLSX.writeFile(wb, "delivery_material.xlsx");
};

/* CHECK ALL */
checkAll.onclick = () => {
  document.querySelectorAll(".pilih").forEach(c => c.checked = checkAll.checked);
};
