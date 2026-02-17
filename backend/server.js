//Constantes que puedo cambiar
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pool = require("./db");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// TEST DB
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


// PRODUCTOS: listado
// GET /productos
app.get("/productos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM productos ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// (Multer) carpeta uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadsDir));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, mensaje: "No file" });

  res.json({
    ok: true,
    archivo: {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    }
  });
});

app.get("/", (req, res) => res.send("Backend OK"));




//----------------
//CRUD DE CLIENTES
//----------------

//READ(LIST + SEARCH)
// GET /clientes?search=avril
app.get("/clientes", async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    let sql = "SELECT * FROM clientes";
    let params = [];

    if (search.length > 0) {
      sql += `
        WHERE LOWER(nombre) LIKE ?
           OR LOWER(apellido1) LIKE ?
           OR LOWER(apellido2) LIKE ?
           OR LOWER(email) LIKE ?
           OR LOWER(codigo_postal) LIKE ?
           OR (activo = 1 AND ? = 'true')
           OR (activo = 0 AND ? = 'false')
      `;
      const like = `%${search}%`;
      //si escribes "true" o "false" también filtra por activo
      params = [like, like, like, like, like, search, search];
    }
    sql += " ORDER BY nombre ASC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// READ (ONE)
// GET /clientes/5
app.get("/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Cliente no encontrado" });
    }

    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// CREATE
// POST /clientes
//body: {nombre, apellido1, apellido2, email, codigo_postal, activo}
app.post("/clientes", async (req, res) =>{

  try{
    const {nombre, apellido1, apellido2, email, codigo_postal, activo} = req.body;

    //validaciones mínimas
    if(!nombre || !apellido1 || !apellido2 || !email || !codigo_postal){
      return res.status(400).json({ ok: false, error: "TODOS LOS CAMPOS SON OBLIGATORIOS"})
    }

    const activoBool= (activo == undefined) ? true : Boolean(activo);

    const[result] = await pool.query(
      `INSERT INTO clientes (nombre, apellido1, apellido2, email, codigo_postal, activo) 
      VALUES (?,?,?,?,?,?)`,
      [nombre, apellido1, apellido2, email, codigo_postal, activoBool]
    );
    
    // devolver el cliente creado:
    const idNuevo = result.insertId;
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id_cliente = ?", [idNuevo]);

    res.status(201).json({ ok: true, cliente: rows[0]});

  }catch(e){
    //email UNIQUE el error típico
    if(e.code=== "ER_DUP_ENTRY"){
      return res.status(409).json({
        ok: false, error: "El email ya existe"
      });
    }
    res.status(500).json({ ok: false, error: e.message});
  }
});

// UPDATE
// PUT /clientes/:id

app.put("/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: "ID inválido" });

    const { nombre, apellido1, apellido2, email, codigo_postal, activo } = req.body;

    if (!nombre || !apellido1 || !apellido2 || !email || !codigo_postal) {
      return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
    }

    const activoBool = Boolean(activo);

    const [result] = await pool.query(
      `UPDATE clientes
       SET nombre = ?, apellido1 = ?, apellido2 = ?, email = ?, codigo_postal = ?, activo = ?
       WHERE id_cliente = ?`,
      [nombre, apellido1, apellido2, email, codigo_postal, activoBool, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Cliente no encontrado" });
    }

    const [rows] = await pool.query("SELECT * FROM clientes WHERE id_cliente = ?", [id]);
    res.json({ ok: true, cliente: rows[0] });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ ok: false, error: "El email ya existe" });
    }
    res.status(500).json({ ok: false, error: e.message });
  }
});

//DELETE 
// DELETE /cleintes/:id

app.delete("/clientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: "ID inválido" });

    const [result] = await pool.query("DELETE FROM clientes WHERE id_cliente = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Cliente no encontrado" });
    }

    res.json({ ok: true, mensaje: "Cliente eliminado" });
  } catch (e) {
    // si algún día hay pedidos vinculados y el FK no deja borrar
    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ ok: false, error: "No se puede borrar: tiene pedidos asociados" });
    }
    res.status(500).json({ ok: false, error: e.message });
  }
});


//LISTENER
app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));
