import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

/* =============================
   FIREBASE
============================= */
const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "materials");

/* =============================
   ELEMENTS
============================= */
const listData = document.getElementById("listData");
const btnReturn = document.getElementById("returnData");
const tglReturn = document.getElementById("tglReturn");
const checkAll = document.getElementById("checkAll");

const searchId = document.getElementById("searchId");
const searchMaterial = document.getElementById("searchMaterial");
const searchDate = document.getElementById("searchDate");
const btnCari = document.getElementById("cari1");

/* =============================
   LOADING ELEMENT
============================= */
let loading = document.createElement("tr");
loading.id = "loadingRow";
loading.innerHTML = `<td colspan="10" class="text-center py-5">
  <div class="spinner-border text-primary"></div>
  <p class="mt-2 mb-0">Memuat data...</p>
</td>`;
listData.appendChild(loading);

/* =============================
   AMBIL DATA DARI FIREBASE
============================= */
let deliveryData = [];

onValue(dataRef, snap => {
  deliveryData = [];
  listData.innerHTML = "";
  let ada = false;

  snap.forEach(c => {
    const d = c.val();
    if (d.status === "delivery") {
      ada = true;
      deliveryData.push({ id: c.key, ...d });
    }
  });

  renderTable(deliveryData);

  if (!ada) {
    listData.innerHTML = `<tr>
      <td colspan="10" class="text-center text-muted py-5">
        Tidak ada data delivery
      </td>
    </tr>`;
  }
});

/* =============================
   RENDER TABLE + TOTAL NET
============================= */
function renderTable(data) {
  listData.innerHTML = "";

  if (data.length === 0) {
    listData.innerHTML = `<tr>
      <td colspan="10" class="text-center text-muted py-5">Tidak ada data</td>
    </tr>`;
    removeTotalRow();
    return;
  }

  data.forEach(d => {
    listData.innerHTML += `<tr data-key="${d.id}">
      <td><input type="checkbox" class="chkReturn"></td>
      <td>${d.mid}</td>
      <td>${d.material}</td>
      <td>${d.bin}</td>
      <td>${d.lokasi}</td>
      <td>${d.defect}</td>
      <td>${d.net}</td>
      <td>${d.tanggalInput}</td>
      <td>${d.tanggalDelivery}</td>
      <td>${d.operator1}</td>
    </tr>`;
  });

  renderTotalNet(data);
}

// Hapus baris total sebelumnya jika ada
function removeTotalRow() {
  const existing = document.querySelector(".total-net-row");
  if (existing) existing.remove();
}

// Hitung dan render Total Net
function renderTotalNet(data) {
  removeTotalRow();
  const totalNet = data.reduce((sum, item) => sum + Number(item.net || 0), 0);

  const tr = document.createElement("tr");
  tr.className = "total-net-row";
  tr.innerHTML = `
    <td colspan="6" class="text-end"><strong>Total Net</strong></td>
    <td><strong>${totalNet}</strong></td>
    <td colspan="3"></td>
  `;
  listData.appendChild(tr);

  // Simpan data dan total untuk download Excel
  window.currentRenderedData = data;
  window.currentTotalNet = totalNet;
}

/* =============================
   CHECK ALL
============================= */
checkAll.onclick = () => {
  document.querySelectorAll(".chkReturn").forEach(c => {
    c.checked = checkAll.checked;
  });
};

/* =============================
   RETURN
============================= */
btnReturn.onclick = () => {
  if (!tglReturn.value) {
    alert("Isi tanggal return");
    return;
  }

  const checked = document.querySelectorAll(".chkReturn:checked");
  if (checked.length === 0) {
    alert("Pilih data");
    return;
  }

  checked.forEach(chk => {
    const key = chk.closest("tr").dataset.key;

    update(ref(db, "materials/" + key), {
      status: "stock",
      tanggalReturn: tglReturn.value
    });
  });

  tglReturn.value = "";
  checkAll.checked = false;
};

/* =============================
   DOWNLOAD EXCEL + TOTAL NET
============================= */
window.downloadExcel = () => {
  const dataToExport = window.currentRenderedData || deliveryData;
  if (dataToExport.length === 0) {
    alert("Tidak ada data untuk di-download");
    return;
  }

  const wsData = dataToExport.map(d => ({
    ID: d.mid,
    Material: d.material,
    Bin: d.bin,
    Lokasi: d.lokasi,
    Defect: d.defect,
    Net: d.net,
    "Tanggal Input": d.tanggalInput,
    "Tanggal Delivery": d.tanggalDelivery,
    "Operator Delivery": d.operator1
  }));

  // Tambahkan baris Total Net
  wsData.push({
    ID: "",
    Material: "",
    Bin: "",
    Lokasi: "",
    Defect: "TOTAL NET",
    Net: window.currentTotalNet || 0,
    "Tanggal Input": "",
    "Tanggal Delivery": "",
    "Operator Delivery": ""
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Delivery");
  XLSX.writeFile(wb, `Data_Delivery_MWH_${new Date().toISOString().slice(0,10)}.xlsx`);
};

/* =============================
   SEARCH / FILTER
============================= */
btnCari.addEventListener("click", () => {
  const idVal = searchId.value.trim().toUpperCase();
  const materialVal = searchMaterial.value.trim().toUpperCase();
  const dateVal = searchDate.value;

  const filtered = deliveryData.filter(d => {
    const matchId = idVal ? d.mid.toUpperCase().includes(idVal) : true;
    const matchMaterial = materialVal ? d.material.toUpperCase().includes(materialVal) : true;
    const matchDate = dateVal ? d.tanggalDelivery.startsWith(dateVal) : true;

    return matchId && matchMaterial && matchDate;
  });

  renderTable(filtered);
});