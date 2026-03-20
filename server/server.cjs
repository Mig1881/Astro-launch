const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");

const server = jsonServer.create();
const router = jsonServer.router("./server/db.json"); 

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "123456789";
const expiresIn = "1h";

//Funciones JWT
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err,
  );
}

//Funciones Base de Datos

function getUsers() {
  const db = JSON.parse(fs.readFileSync("./server/db.json", "UTF-8"));
  return db.users || []; 
}

function saveUsers(updatedUsers) {
  const db = JSON.parse(fs.readFileSync("./server/db.json", "UTF-8"));
  db.users = updatedUsers;
  fs.writeFileSync("./server/db.json", JSON.stringify(db, null, 2));
}

function findUser(email, password) {
  return getUsers().find(
    (user) => user.email === email && user.password === password,
  );
}

//Endpoints de Autenticación

server.post("/auth/register", (req, res) => {
  const { email, password, role } = req.body;
  const users = getUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(401).json({ status: 401, message: "Email already exists" });
  }

  const last_item_id = users.length ? users[users.length - 1].id : 0;
  const newUser = {
    id: last_item_id + 1,
    email: email,
    password: password,
    role: role || "user",
  };

  users.push(newUser);
  saveUsers(users); 

  const access_token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  res.status(200).json({ access_token });
});

server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email, password);

  if (!user) {
    return res.status(401).json({ status: 401, message: "Incorrect email or password" });
  }

  const access_token = createToken({ id: user.id, email: user.email, role: user.role });
  res.status(200).json({ access_token });
});

server.get("/me", (req, res) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    return res.status(401).json({ status: 401, message: "Error in authorization format" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ id: decoded.id, email: decoded.email, role: decoded.role });
  } catch (err) {
    res.status(401).json({ status: 401, message: "Invalid or expired token" });
  }
});

//Protección de Rutas

server.use(/^(?!\/auth).*$/, (req, res, next) => {
  // Dejamos pasar peticiones OPTIONS (CORS del navegador) y /me
  if (req.method === "OPTIONS") return next();
  if (req.path === "/me") return next();
  
  
  //TODOS los endpoints de datos requieren token.

  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    return res.status(401).json({ status: 401, message: "Error in authorization format" });
  }

  try {
    const verifyTokenResult = verifyToken(req.headers.authorization.split(" ")[1]);
    if (verifyTokenResult instanceof Error) {
      return res.status(401).json({ status: 401, message: "Access token not valid" });
    }
    next();
  } catch (err) {
    res.status(401).json({ status: 401, message: "Error access_token is revoked" });
  }
});


//ENDPOINTS PARA EL PANEL DE ADMIN


server.get("/users", (req, res) => {
  const users = getUsers();
  // Mapeamos para NO enviar las contraseñas al frontend
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role
  }));
  res.status(200).json(safeUsers);
});

server.delete("/users/:id", (req, res) => {
  let users = getUsers();
  const idToDelete = parseInt(req.params.id);

  const userExists = users.find(u => u.id === idToDelete);
  if (!userExists) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  users = users.filter(u => u.id !== idToDelete);
  saveUsers(users);
  
  res.status(200).json({ message: "Usuario borrado correctamente" });
});

// ==========================================

server.use(router);

server.listen(3000, () => {
  console.log("🚀 AstroLaunch Auth API Server running on port 3000");
});