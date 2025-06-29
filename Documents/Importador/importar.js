const fs = require('fs');
const axios = require('axios');
const xml2js = require('xml2js');
const admin = require('firebase-admin');

// 🔐 Cargar credenciales de Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const XML_URL = "https://try.com.ar/wp-content/uploads/woo-feed/google/xml/hardgamers.xml";

// 🔎 Palabras clave por categoría
const categoriaKeywords = {
  procesador: ["procesadores"],
  motherboard: ["motherboards"],
  ssd: ["discos sólidos ssd"],
  hdd: ["discos rígidos hdd"],
  memoria_ram: ["memorias ram", "memorias pc"],
  placa_video: ["placas de video"],
  gabinete: ["gabinetes"],
  monitor: ["monitores"],
  teclado: ["teclados"],
  mouse: ["mouse"],
  fuente: ["fuentes", "fuente de poder", "fuente de alimentación", "psu"]
};

// 🧠 Normaliza categoría + marca
function normalizarCategoria(pt, titulo) {
  pt = pt.toLowerCase();
  const lowerTitulo = titulo.toLowerCase();

  if (pt.includes('motherboards') || pt.includes('mothers')) {
    if (pt.includes('amd')) return 'motherboard_amd';
    if (pt.includes('intel')) return 'motherboard_intel';
    return 'motherboard';
  }

  if (pt.includes('procesadores')) {
    if (lowerTitulo.includes('amd')) return 'procesador_amd';
    if (lowerTitulo.includes('intel')) return 'procesador_intel';
    return 'procesador';
  }

  for (const [categoria, keywords] of Object.entries(categoriaKeywords)) {
    if (keywords.some(k => pt.includes(k))) return categoria;
  }

  return null;
}

// 🚀 Importador principal
async function importarProductos() {
  try {
    const res = await axios.get(XML_URL);
    const xml = res.data;

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const items = result.rss.channel.item;
    let nuevos = 0;
    let actualizados = 0;

    for (const item of items) {
      const id = item["g:id"];
      const titulo = item["g:title"];
      const link = item["link"];
      const imagen = item["g:image_link"] || "";
      const pt = item["g:product_type"] || "";

      if (!id || !titulo || !link || !pt) continue;

      const categoria = normalizarCategoria(pt, titulo);
      if (!categoria) continue;

      // 🟢 Lógica de precios: sale_price > price
      let precioStr = item["g:sale_price"] || item["g:price"];
      if (!precioStr || precioStr.trim() === "") continue;

      const precio = parseInt(parseFloat(precioStr));

      const docRef = db.collection("productos_try").doc(categoria).collection("items").doc(id);
      const snapshot = await docRef.get();

      const data = {
        titulo: titulo.trim(),
        titulo_lower: titulo.trim().toLowerCase(),
        precio,
        enlace: link.trim(),
        imagen: imagen.trim(),
        categoria,
        tienda: "try",
        actualizado: new Date()
      };

      if (snapshot.exists) {
        await docRef.update(data);
        actualizados++;
      } else {
        await docRef.set(data);
        nuevos++;
      }

      if (categoria.includes("motherboard") || categoria.includes("procesador")) {
        console.log(`🟢 ${categoria.toUpperCase()} → $${precio} → ${titulo}`);
      }
    }

    console.log(`✅ Finalizado. Nuevos: ${nuevos}, Actualizados: ${actualizados}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

importarProductos();
