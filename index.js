import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "materials");

let stockData = [];

/* SIMPAN */
simpan.onclick = () => {
  if (!mid.value || !material.value || !net.value) return;

  push(dataRef, {
    mid: mid.value,
    material: material.value,
    bin: bin.value,
    net: net.value,
    tanggalInput: new Date().toLocaleString(),
    tanggalDelivery: "",
    status: "stock"
  });

  mid.value = material.value = net.value = "";
};

/* LOAD DATA */
onValue(dataRef, snap => {
  stockData = [];
  snap.forEach(c => {
    const d = c.val();
    if (d.status === "stock") {
      stockData.push({ id: c.key, ...d });
    }
  });
  render(stockData);
});

function render(data) {
  listData.innerHTML = "";
  data.forEach(d => {
    listData.innerHTML += `
    <tr data-id="${d.id}">
      <td><input type="checkbox" class="pilih" value="${d.id}"></td>
      <td class="mid">${d.mid}</td>
      <td class="material">${d.material}</td>
      <td class="bin">${d.bin}</td>
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

  const filtered = stockData.filter(d => {
    const matchId = d.mid.toLowerCase().includes(id);
    const matchDate =
      !date ||
      d.tanggalInput.includes(date) ||
      (d.tanggalDelivery && d.tanggalDelivery.includes(date));
    return matchId && matchDate;
  });

  render(filtered);
}

searchId.onkeyup = filterData;
searchDate.onchange = filterData;

/* EDIT INLINE */
window.editRow = btn => {
  const tr = btn.closest("tr");
  const id = tr.dataset.id;

  if (btn.innerText === "Edit") {
    btn.innerText = "Save";
    btn.className = "btn btn-success btn-sm";

    tr.querySelectorAll(".mid,.material,.bin,.net").forEach(td => {
      td.dataset.old = td.innerText;
      if (td.classList.contains("bin")) {
        td.innerHTML = `
        <select class="form-select form-select-sm">
          <option ${td.dataset.old==="A"?"selected":""}>A</option>
          <option ${td.dataset.old==="B"?"selected":""}>B</option>
          <option ${td.dataset.old==="C"?"selected":""}>C</option>
        </select>`;
      } else {
        td.innerHTML = `<input class="form-control form-control-sm" value="${td.dataset.old}">`;
      }
    });

    btn.insertAdjacentHTML("afterend",
      `<button class="btn btn-secondary btn-sm ms-1" onclick="cancelEdit(this)">Batal</button>`
    );
  } else {
    update(ref(db, "materials/" + id), {
      mid: tr.querySelector(".mid input").value,
      material: tr.querySelector(".material input").value,
      bin: tr.querySelector(".bin select").value,
      net: tr.querySelector(".net input").value
    });
  }
};

window.cancelEdit = btn => {
  const tr = btn.closest("tr");
  tr.querySelectorAll(".mid,.material,.bin,.net").forEach(td => {
    td.innerText = td.dataset.old;
  });
  const eBtn = tr.querySelector(".btn-success");
  eBtn.innerText = "Edit";
  eBtn.className = "btn btn-warning btn-sm";
  btn.remove();
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
checkAll.onclick = () => {
  document.querySelectorAll(".pilih").forEach(c => c.checked = checkAll.checked);
};
