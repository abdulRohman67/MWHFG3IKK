import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "materials");

/* LOADING */
const loading = document.getElementById("loading");
const showLoading = () => loading.style.display = "block";
const hideLoading = () => loading.style.display = "none";

let stockData = [];

/* SIMPAN */
simpan.onclick = () => {
  if (!mid.value || !material.value || !net.value) return;

  showLoading();
  push(dataRef, {
    mid: mid.value,
    material: material.value,
    bin: bin.value,
    defect: defect.value,
    net: net.value,
    tanggalInput: new Date().toLocaleString(),
    tanggalDelivery: "",
    status: "stock"
  }).then(hideLoading);

  mid.value = material.value = net.value = defect.value = "";
};

/* LOAD DATA */
showLoading();
onValue(dataRef, snap => {
  stockData = [];
  snap.forEach(c => {
    const d = c.val();
    if (d.status === "stock") {
      stockData.push({ id: c.key, ...d });
    }
  });
  render(stockData);
  hideLoading();
});

/* RENDER */
function render(data) {
  listData.innerHTML = "";
  data.forEach(d => {
    listData.innerHTML += `
    <tr data-id="${d.id}">
      <td><input type="checkbox" class="pilih" value="${d.id}"></td>
      <td class="mid">${d.mid}</td>
      <td class="material">${d.material}</td>
      <td class="bin">${d.bin}</td>
      <td class="defect">${d.defect}</td>
      <td class="net">${d.net}</td>
      <td>${d.tanggalInput}</td>
      <td>${d.tanggalDelivery || "-"}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editRow(this)">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="hapus('${d.id}')">Hapus</button>
      </td>
    </tr>`;
  });
}

/* SEARCH */
function filterData() {
  const id = searchId.value.toLowerCase();
  const date = searchDate.value;
  render(stockData.filter(d =>
    d.mid.toLowerCase().includes(id) &&
    (!date || d.tanggalInput.includes(date))
  ));
}
searchId.onkeyup = filterData;
searchDate.onchange = filterData;

/* EDIT */
window.editRow = btn => {
  const tr = btn.closest("tr");
  const id = tr.dataset.id;

  if (btn.innerText === "Edit") {
    btn.innerText = "Save";
    btn.className = "btn btn-success btn-sm";

    tr.querySelectorAll(".mid,.material,.net,.defect").forEach(td => {
      td.dataset.old = td.innerText;
      td.innerHTML = `<input class="form-control form-control-sm" value="${td.dataset.old}">`;
    });

    tr.querySelector(".bin").innerHTML = `
      <select class="form-select form-select-sm">
        <option>A</option><option>B</option><option>C</option>
      </select>`;
  } else {
    update(ref(db, "materials/" + id), {
      mid: tr.querySelector(".mid input").value,
      material: tr.querySelector(".material input").value,
      net: tr.querySelector(".net input").value,
      defect: tr.querySelector(".defect input").value,
      bin: tr.querySelector(".bin select").value
    });
  }
};

/* DELETE */
window.hapus = id => remove(ref(db, "materials/" + id));

/* DELIVERY */
window.kirimDelivery = () => {
  if (!tglDelivery.value) return;
  document.querySelectorAll(".pilih:checked").forEach(cb => {
    update(ref(db, "materials/" + cb.value), {
      status: "delivery",
      tanggalDelivery: tglDelivery.value
    });
  });
  tglDelivery.value = "";
};

/* EXCEL */
window.downloadExcel = () => {
  const wb = XLSX.utils.table_to_book(document.querySelector("table"));
  XLSX.writeFile(wb, "stock_material.xlsx");
};

/* CHECK ALL */
checkAll.onclick = () =>
  document.querySelectorAll(".pilih").forEach(c => c.checked = checkAll.checked);
