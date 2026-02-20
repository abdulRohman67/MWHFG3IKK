import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

/* ============================= FIREBASE ============================ */
const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "materials");

/* ============================= ELEMENTS ============================ */
const bin = document.getElementById("bin");
const lokasi = document.getElementById("lokasi");
const simpan = document.getElementById("simpan");
const listData = document.getElementById("listData");
const checkAll = document.getElementById("checkAll");
const tglDelivery = document.getElementById("tglDelivery");
const loading = document.getElementById("loading");

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
  if (!mid.value || !material.value || !bin.value || !lokasi.value || !defect.value || !net.value) {
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
    tanggalInput: new Date().toLocaleString(),
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

// tampilkan loading saat ambil data
showLoading(true);

onValue(dataRef, snap => {
  stockData = [];
  snap.forEach(c => {
    const d = c.val();
    if (d.status === "stock" || d.status === "delivery") {
      stockData.push({ id: c.key, ...d });
    }
  });
  render(stockData);
  showLoading(false); // sembunyikan loading setelah data dimuat
});

/* ============================= RENDER TABLE ============================ */
function render(data) {
  listData.innerHTML = "";
  if (data.length === 0) {
    listData.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Tidak ada data</td></tr>`;
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
        <td>
          <button class="btn btn-warning btn-sm" onclick="editRow(this)">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="hapus('${d.id}')">Hapus</button>
          <button class="btn btn-secondary btn-sm" onclick="batalEdit(this)">Batal</button>
        </td>
      </tr>`;
  });
}

/* ============================= EDIT INLINE ============================ */
window.editRow = btn => {
  const tr = btn.closest("tr");
  const id = tr.dataset.id;

  if (btn.innerText === "Edit") {
    btn.innerText = "Save";
    btn.className = "btn btn-success btn-sm";

    tr.querySelectorAll(".mid,.material,.defect,.net").forEach(td => {
      td.dataset.old = td.innerText;
      td.innerHTML = `<input class="form-control form-control-sm" value="${td.dataset.old}">`;
    });

    const binTd = tr.querySelector(".bin");
    const lokasiTd = tr.querySelector(".lokasi");
    binTd.dataset.old = binTd.innerText;
    lokasiTd.dataset.old = lokasiTd.innerText;

    binTd.innerHTML = `<select class="form-select form-select-sm bin-edit" onchange="ubahLokasiEdit(this)">
      ${["A","B","C","D","E","F","G","H","I"].map(b => `<option ${b===binTd.dataset.old?"selected":""}>${b}</option>`).join("")}
    </select>`;

    lokasiTd.innerHTML = lokasiEdit(binTd.dataset.old, lokasiTd.dataset.old);

  } else {
    update(ref(db, "materials/" + id), {
      mid: tr.querySelector(".mid input").value,
      material: tr.querySelector(".material input").value,
      bin: tr.querySelector(".bin select").value,
      lokasi: tr.querySelector(".lokasi select").value,
      defect: tr.querySelector(".defect input").value,
      net: tr.querySelector(".net input").value
    });
  }
};

/* ============================= BATAL EDIT ============================ */
window.batalEdit = btn => {
  const tr = btn.closest("tr");

  tr.querySelectorAll(".mid,.material,.defect,.net,.bin,.lokasi").forEach(td => {
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
  if (confirm("Hapus data ini?")) {
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

  checked.forEach(cb => {
    update(ref(db, "materials/" + cb.value), {
      status: "delivery",
      tanggalDelivery: tglDelivery.value
    });
  });

  tglDelivery.value = "";
  checkAll.checked = false;
};

/* ============================= CHECK ALL ============================ */
checkAll.onclick = () => {
  document.querySelectorAll(".pilih")
    .forEach(c => c.checked = checkAll.checked);
};


