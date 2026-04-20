
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
 apiKey: "AIzaSyBKc-SQsKpkLsrIdqQFIqqQwLI0j7KTCmc",
    authDomain: "mwh-akun.firebaseapp.com",
    projectId: "mwh-akun",
    storageBucket: "mwh-akun.firebasestorage.app",
    messagingSenderId: "805938654734",
    appId: "1:805938654734:web:1f59bd54c93970ac04965f"
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

