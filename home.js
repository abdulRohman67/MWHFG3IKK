import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/* ============================= FIREBASE ============================ */
const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const dataRef = ref(db, "materials");

/* ============================= ELEMENTS ============================ */
const bin = document.getElementById("bin");
const lokasi = document.getElementById("lokasi");
const simpan = document.getElementById("simpan");
const listData = document.getElementById("listData");
const checkAll = document.getElementById("checkAll");
const tglDelivery = document.getElementById("tglDelivery");
const loading = document.getElementById("loading");
const mid = document.getElementById("mid");
const material = document.getElementById("material");
const defect = document.getElementById("defect");
const net = document.getElementById("net");
const operatorInput = document.getElementById("operator"); 
const dn = document.getElementById("dn"); 
const operator1Input = document.getElementById("operator1"); // delivery input

let currentOperator = localStorage.getItem("nama") ?? "-";

/* ============================= AMBIL USER LOGIN FIREBASE ============================ */
onAuthStateChanged(auth, user => {
  if (user) {
    currentOperator = user.displayName || user.email || currentOperator;
  }
  if (operatorInput) operatorInput.value = currentOperator;
  if (operator1Input) operator1Input.value = currentOperator;
});

/* ============================= BIN → LOKASI ============================ */
bin.addEventListener("change", () => {
  lokasi.innerHTML = `<option value="">Pilih Lokasi</option>`;
  if (!bin.value) return (lokasi.disabled = true);
  lokasi.disabled = false;
  for (let i = 1; i <= 25; i++) {
    lokasi.innerHTML += `<option value="${bin.value + i}">${bin.value + i}</option>`;
  }
});

/* ============================= CREATE (SIMPAN) ============================ */
simpan.onclick = () => {
  if (!mid.value || !material.value || !bin.value || !lokasi.value || !defect.value || !net.value || !dn.value) {
    alert("Lengkapi data");
    return;
  }

  push(dataRef, {
    mid: mid.value,
    material: material.value,
    bin: bin.value,
    lokasi: lokasi.value,
    defect: defect.value,
    net: net.value,
    operator1: currentOperator,
    tanggalInput: new Date().toLocaleString(),
    dn: dn.value,
    tanggalDelivery: "",
    tanggalReturn: "",
    status: "stock"
  });

  mid.value = material.value = defect.value = net.value = "";
  bin.value = lokasi.value = "";
  lokasi.disabled = true;
};

/* ============================= READ (LOAD HOME) ============================ */
let stockData = [];

function showLoading(show) {
  loading.style.display = show ? "block" : "none";
}

showLoading(true);

onValue(dataRef, snap => {
  stockData = [];
  snap.forEach(c => {
    const d = c.val();
    if (d.status === "stock") {
      stockData.push({ id: c.key, ...d });
    }
  });
  render(stockData);
  showLoading(false);
});

/* ============================= HITUNG TOTAL NET ============================= */
function hitungTotalNet(data) {
  const total = data.reduce((sum, item) => sum + Number(item.net || 0), 0);

  const existingTotalRow = listData.querySelector(".total-net-row");
  if (existingTotalRow) existingTotalRow.remove();

  const tr = document.createElement("tr");
  tr.className = "total-net-row text-bold";
  tr.innerHTML = `
    <td colspan="6" class="text-end"><strong>Total Net</strong></td>
    <td><strong>${total}</strong></td>
    <td colspan="6"></td>
  `;
  listData.appendChild(tr);
}

/* ============================= RENDER TABLE ============================ */
function render(data) {
  listData.innerHTML = "";
  if (data.length === 0) {
    listData.innerHTML = `<tr><td colspan="12" class="text-center text-muted">Tidak ada data</td></tr>`;
    return;
  }

  data.forEach(d => {
    listData.innerHTML += `
      <tr data-id="${d.id}">
        <td><input type="checkbox" class="pilih" value="${d.id}"></td>
        <td class="mid">${d.mid}</td>
        <td class="material">${d.material}</td>
        <td class="bin">${d.bin}</td>
        <td class="lokasi">${d.lokasi}</td>
        <td class="defect">${d.defect}</td>
        <td class="net">${d.net}</td>
        <td>${d.tanggalInput}</td>
        <td>${d.tanggalDelivery || "-"}</td>
        <td>${d.tanggalReturn || "-"}</td>
        <td>${d.operator1 || "-"}</td>
        <td class="dn">${d.dn}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editRow(this)">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="hapus('${d.idnonaktif}')">Hapus</button>
          <button class="btn btn-secondary btn-sm" onclick="batalEdit(this)">Batal</button>
        </td>
      </tr>`;
  });

  hitungTotalNet(data);
  window.currentRenderedData = data; // simpan data yang sedang ditampilkan
}

/* ============================= EDIT INLINE ============================ */
window.editRow = btn => {
  const tr = btn.closest("tr");
  const id = tr.dataset.id;

  if (btn.innerText === "Edit") {
    btn.innerText = "Save";
    btn.className = "btn btn-success btn-sm";

    tr.querySelectorAll(".mid,.material,.defect,.net,.dn").forEach(td => {
      td.dataset.old = td.innerText;
      td.innerHTML = `<input class="form-control form-control-sm" value="${td.dataset.old}">`;
    });

    const binTd = tr.querySelector(".bin");
    const lokasiTd = tr.querySelector(".lokasi");
    binTd.dataset.old = binTd.innerText;
    lokasiTd.dataset.old = lokasiTd.innerText;

    binTd.innerHTML = `<select class="form-select form-select-sm bin-edit" onchange="ubahLokasiEdit(this)">
      ${["A","B","C","D","E","F","G","H","I","J","K","L"].map(b => `<option ${b===binTd.dataset.old?"selected":""}>${b}</option>`).join("")}</select>`;

    lokasiTd.innerHTML = lokasiEdit(binTd.dataset.old, lokasiTd.dataset.old);

  } else {
    update(ref(db, "materials/" + id), {
      mid: tr.querySelector(".mid input").value,
      material: tr.querySelector(".material input").value,
      bin: tr.querySelector(".bin select").value,
      lokasi: tr.querySelector(".lokasi select").value,
      defect: tr.querySelector(".defect input").value,
      net: tr.querySelector(".net input").value,
      dn: tr.querySelector(".dn input").value
    });

    btn.innerText = "Edit";
    btn.className = "btn btn-primary btn-sm";

    tr.querySelectorAll(".mid,.material,.defect,.net,.dn").forEach(td => {
      td.innerText = td.querySelector("input").value;
    });

    const binTd = tr.querySelector(".bin");
    const lokasiTd = tr.querySelector(".lokasi");
    binTd.innerText = binTd.querySelector("select").value;
    lokasiTd.innerText = lokasiTd.querySelector("select").value;
  }
};

/* ============================= BATAL EDIT ============================ */
window.batalEdit = btn => {
  const tr = btn.closest("tr");
  tr.querySelectorAll(".mid,.material,.defect,.net,.bin,.lokasi,.dn").forEach(td => {
    if (td.dataset.old !== undefined) {
      td.innerText = td.dataset.old;
      delete td.dataset.old;
    }
  });
  const editBtn = tr.querySelector("button.btn-success, button.btn-warning");
  if (editBtn) {
    editBtn.innerText = "Edit";
    editBtn.className = "btn btn-warning btn-sm";
  }
};

/* ============================= BIN → LOKASI EDIT ============================ */
function lokasiEdit(bin, selected) {
  let html = `<select class="form-select form-select-sm">`;
  for (let i = 1; i <= 25; i++) {
    const v = bin + i;
    html += `<option ${v===selected?"selected":""}>${v}</option>`;
  }
  return html + `</select>`;
}

window.ubahLokasiEdit = sel => {
  const tr = sel.closest("tr");
  tr.querySelector(".lokasi").innerHTML = lokasiEdit(sel.value, "");
};

/* ============================= DELETE ============================ */
window.hapus = id => {
  if (confirm("Maaf Hapus data ini di Non aktifkan")) {
    remove(ref(db, "materials/" + id));
  }
};

/* ============================= DELIVERY ============================ */
window.kirimDelivery = () => {
  if (!tglDelivery.value) {
    alert("Isi tanggal delivery");
    return;
  }

  const checked = document.querySelectorAll(".pilih:checked");
  if (checked.length === 0) {
    alert("Pilih data");
    return;
  }

  const operatorName = operator1.value;

  checked.forEach(cb => {
    update(ref(db, "materials/" + cb.value), {
      status: "delivery",
      tanggalDelivery: tglDelivery.value,
      operator1: operatorName
    });
  });

  tglDelivery.value = "";
  checkAll.checked = false;
  operator1.value = sessionStorage.getItem("namaLogin");
};

/* ============================= DOWNLOAD EXCEL SESUAI FILTER ============================ */
window.downloadExcel = () => {
  const dataToExport = window.currentRenderedData || stockData;

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
    "Tanggal Delivery": d.tanggalDelivery || "-",
    "Tanggal Return": d.tanggalReturn || "-",
    "Operator Input": d.operator1 || "-",
    "NO DN": d.dn
  }));

  const totalNet = dataToExport.reduce((sum, item) => sum + Number(item.net || 0), 0);
  wsData.push({
    ID: "",
    Material: "",
    Bin: "",
    Lokasi: "",
    Defect: "TOTAL NET",
    Net: totalNet,
    "Tanggal Input": "",
    "Tanggal Delivery": "",
    "Tanggal Return": "",
    "Operator Input": "",
    "NO DN": ""
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data MWH");

  XLSX.writeFile(wb, `Data_MWH_${new Date().toISOString().slice(0,10)}.xlsx`);
};

/* ============================= KAPITAL ============================ */
["mid", "dn", "defect"].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
    });
  }
});

/* ============================= SEARCH / FILTER ============================ */
const searchId = document.getElementById("searchId");
const searchMaterial = document.getElementById("searchmaterial");
const btnCari = document.getElementById("cari");

btnCari.addEventListener("click", () => {
  const idVal = searchId.value.trim().toUpperCase();
  const materialVal = searchMaterial.value.trim().toUpperCase();

  const filtered = stockData.filter(d => {
    const matchId = idVal ? d.mid.toUpperCase().includes(idVal) : true;
    const matchMaterial = materialVal ? d.material.toUpperCase().includes(materialVal) : true;
    return matchId && matchMaterial;
  });

  render(filtered);

});
