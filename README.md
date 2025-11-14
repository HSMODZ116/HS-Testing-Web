# 🤖 HS Modz Ofc - AI Image Transformation Tool

Yeh ek simple web tool hai jo aapki images ko AI prompts ki madad se transform karta hai. Ek image upload karein, batayen ke aap kya chahte hain (jaise "is image ko cyberpunk style mein banao"), aur AI baqi kaam karega.

Yeh project HTML, Tailwind CSS, aur JavaScript ka istemal karta hai.

## ✨ Features (Khusoosiyat)

* **Image Upload:** Apne device se koi bhi image file select karein.
* **Image Preview:** Upload karne se pehle apni select ki hui image ka preview dekhein.
* **Text Prompt:** AI ko hidayat dene ke liye apni marzi ka prompt likhein.
* **Side-by-Side View:** Apni asal image aur AI se transform shuda image ko barabar mein dekhein.
* **Download Button:** Tayyar shuda (transformed) image ko aasani se download karein.
* **Error Handling:** Agar ImgBB ya AI API kaam na kare toh wazeh error messages dikhata hai.

---

## 🚀 Istemal Ka Tareeqa (How to Use)

Is tool ko chalaana bohat aasan hai:

1.  Is repository se teeno files (`index.html`, `style.css`, `script.js`) download karein.
2.  Teeno files ko ek hi folder mein rakhein.
3.  Sirf `index.html` file ko apne web browser (jaise Chrome ya Firefox) mein open karein.

---

## 🛠️ Configuration (Setup)

Is tool ko chalne ke liye 2 external APIs ki zaroorat hai, jo `script.js` file ke andar set ki gayi hain:

1.  **`IMGBB_API_KEY`:**
    * Yeh API user ki image ko internet par upload karne ke liye istemal hoti hai taake AI API usse access kar sake.
    * Code mein filhaal ek public key mojood hai. Aap [ImgBB](https://api.imgbb.com/) par register kar ke apni free key haasil kar sakte hain.

2.  **`TRANSFORM_API_ENDPOINT`:**
    * Yeh asal AI API ka link hai jo image ko transform karti hai.
    * **ZAROORI:** Agar yeh API endpoint (link) dead, offline, ya error de (jaise 504 Gateway Timeout), toh tool kaam nahi karega. Aapko is link ko kisi naye, *working* image-to-image AI API ke link se tabdeel (replace) karna hoga.

---

## 🧑‍💻 Developer

* Developed by: **Haseeb Sahil**
* Powered by: **HS Modz Ofc**
* Join our Telegram: [https://t.me/hsmodzofc2](https://t.me/hsmodzofc2)
