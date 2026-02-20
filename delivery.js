import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

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
   ELEMENT
============================= */
const listData = document.getElementById("listData");
const btnReturn = document.getElementById("returnData");
const tglReturn = document.getElementById("tglReturn");
const checkAll = document.getElementById("checkAll");

/* =============================
   LOADING ELEMENT DI TENGAH
============================= */
let loading = document.createElement("tr");
loading.id = "loadingRow";
loading.innerHTML = `<td colspan="9" class="text-center py-5">
  <div class="spinner-border text-primary"></div>
  <p class="mt-2 mb-0">Memuat data...</p>
</td>`;
listData.appendChild(loading);

/* =============================
   LOAD DELIVERY DENGAN LOADING
============================= */
listData.style.display = "table-row-group";

onValue(dataRef, snap => {
  listData.innerHTML = ""; // bersihkan dulu
  let ada = false;

  snap.forEach(c => {
    const d = c.val();
    if (d.status === "delivery") {
      ada = true;
      listData.innerHTML += `
        <tr data-key="${c.key}">
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
    }
  });

  if (!ada) {
    listData.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted py-5">
          Tidak ada data delivery
        </td>
      </tr>`;
  }
});
  
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

    // 🔥 REVISI: simpan tanggal return dan tetap tampilkan tanggal delivery
    update(ref(db, "materials/" + key), {
      status: "stock",
      tanggalReturn: tglReturn.value,       // tambah field tanggalReturn
      tanggalDelivery: tglReturn.value      // update tanggalDelivery agar terlihat di home
    });
  });

  tglReturn.value = "";
  checkAll.checked = false;
};

