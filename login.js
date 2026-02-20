
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8CF5ruXc7AxoGPOx3kmqSSI_1FFWMkrk",
  authDomain: "mwkikkfg.firebaseapp.com",
  databaseURL: "https://mwkikkfg-default-rtdb.firebaseio.com",
  projectId: "mwkikkfg",
  storageBucket: "mwkikkfg.firebasestorage.app",
  messagingSenderId: "181739820908",
  appId: "1:181739820908:web:fdc9c25ce49430053dc549"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("loginBtn").onclick = async () => {
  const sap = document.getElementById("sap").value.trim();
  const password = document.getElementById("password").value.trim();
  const loading = document.getElementById("loading");

  if (!sap || !password) {
    alert("No SAP dan Password wajib diisi");
    return;
  }

  loading.style.display = "block";

  try {
    const snap = await get(ref(db, `users/${sap}`));
    loading.style.display = "none";

    if (!snap.exists()) {
      alert("No SAP tidak terdaftar");
      return;
    }

    const data = snap.val();

    if (data.password === password) {
      // ✅ SIMPAN DATA LOGIN
      localStorage.setItem("login", "true");
      localStorage.setItem("nama", data.nama);
      localStorage.setItem("sap", sap);

      window.location.href = "home.html";
    } else {
      alert("Password salah");
    }

  } catch (err) {
    loading.style.display = "none";
    alert("Gagal login");
    console.error(err);
  }
};

