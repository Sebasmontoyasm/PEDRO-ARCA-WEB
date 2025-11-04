import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"


const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.DB_TIMEZONE || "-05:00",
  charset: "utf8mb4",
  connectTimeout: 10000,
}

const pool = mysql.createPool(dbConfig)




export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Error en consulta de base de datos:", error)
    throw error
  }
}




export async function getMetricDocs() {
  try {
    const SQL = `CALL SP_ARCA_METRICS_DOC();`
    const [docs] = (await executeQuery(SQL)) as any[]
    return docs || []
  } catch (error) {
    console.error("Error obteniendo métricas:", error)
    return []
  }
}

export async function getMetricGeneral() {
  try {
    const SQL = `CALL SP_ARCA_METRICS_GENERAL();`
    const [general] = (await executeQuery(SQL)) as any[]
    return general || []
  } catch (error) {
    console.error("Error obteniendo métricas:", error)
    return []
  }
}

export async function getMetricCensoxMes() {
  try {
    const SQL = `CALL SP_ARCA_METRICS_CENSOXMES();`
    const [censoxmes] = (await executeQuery(SQL)) as any[]
    return censoxmes || []
  } catch (error) {
    console.error("Error obteniendo métricas:", error)
    return []
  }
}

export async function getMetricCenso() {
  try {
    const censoTableQuery = `CALL SP_ARCA_METRICS_CENSO();`
    const [censoTableData] = (await executeQuery(censoTableQuery)) as any
    return { censo: censoTableData || [] }
  } catch (error) {
    console.error("Error obteniendo datos de gráficos:", error)
    return { censo: [] }
  }
}

export async function censoProcess(pAINID_CENSO: number) {
  try {
    const censoProcessTableQuery = `CALL SP_ARCA_CENSO_PROCESS(?);`
    const [rows] = (await executeQuery(censoProcessTableQuery, [pAINID_CENSO])) as any[]
    return { censoProcess: rows || [] }
  } catch (error) {
    console.error("Error ejecutando SP_ARCA_CENSO_PROCESS:", error)
    return { censoProcess: [] }
  }
}

export async function getTimeArcaExtraccion() {
  try {
    const timeAnaExtraccionQuery = `
      SELECT DATE_FORMAT(DATE_SUB(MAX(fechainsert), INTERVAL 1 HOUR), '%d-%m-%Y %r') AS fechainsert
      FROM Monitoreo_rpa;
    `
    const [timeAnaExtraccion] = (await executeQuery(timeAnaExtraccionQuery)) as any
    return { timeAnaExtraccion: timeAnaExtraccion || [] }
  } catch (error) {
    console.error("Error obteniendo datos de gráficos:", error)
    return { timeAnaExtraccion: [] }
  }
}

export async function reprocesarIngreso(ainid: number) {
  try {
    const userID = 1
    console.log("Reprocesando ingreso con AINID:", ainid, "por usuario:", userID)
    const censoReprocesar = `CALL SP_ARCA_REPROCESAR_WEB(?,?);`
    const [rows] = (await executeQuery(censoReprocesar, [ainid, userID])) as any[]
    return { Message: rows[0] || [] }
  } catch (error) {
    console.error("Error ejecutando SP_ARCA_REPROCESAR_WEB:", error)
    return { Message: error }
  }
}

export async function getUsers() {
  try {
    const SQL = `CALL SP_ARCA_USER();`
    const [users] = (await executeQuery(SQL)) as any[]
    return users || []
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return []
  }
}

export async function getUsersRoles() {
  try {
    const SQL = `SELECT * FROM role;`
    const role = (await executeQuery(SQL)) as any[]
    return role || []
  } catch (error) {
    console.error("Error obteniendo roles:", error)
    return []
  }
}

export async function getAllUsersAndRoles() {
  const users = await executeQuery(`CALL SP_ARCA_USER();`)
  const roles = await executeQuery(`SELECT * FROM role;`)

  const formattedUsers = (users as any[])[0].map((u: any) => ({
    ...u,
    last_login: u.last_login ? new Date(u.last_login).toISOString() : null,
    created: u.created ? new Date(u.created).toISOString() : null,
    last_activity: u.last_activity ? new Date(u.last_activity).toISOString() : null,
    expired_at: u.expired_at ? new Date(u.expired_at).toISOString() : null,
    sesion: u.sesion ? new Date(u.sesion).toISOString() : null,
  }))

  return { users: formattedUsers, roles: roles }
}
export async function createUser({ name, email, password, role }: any) {
  try {
    if (!name || !email || !password || !role) {
      throw new Error("Faltan campos obligatorios");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password + salt, 10);

    const SQL = `
      INSERT INTO user (name, email, password_hash, salt, role, created)
      VALUES (?, ?, ?, ?, ?, NOW());
    `;

    await executeQuery(SQL, [name, email, password_hash, salt, role]);

    return { success: true, message: "Usuario creado correctamente" };
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return { success: false, error: "El correo ya está registrado" };
    }
    console.error("Error al crear usuario:", error);
    return { success: false, error: "Error inesperado al crear usuario" };
  }
}

export async function updateUser({
  id,
  name,
  email,
  password,
  role,
}: {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: number;
}) {
  if (!id) throw new Error("Falta el ID del usuario");

  let SQL: string;
  let params: any[];

  if (password && password.trim() !== "") {
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password + salt, 10);

    SQL = `
      UPDATE user
      SET name = ?, email = ?, password_hash = ?, salt = ?, role = ?
      WHERE id = ?;
    `;
    params = [name, email, password_hash, salt, role, id];
  } else {
    
    SQL = `
      UPDATE user
      SET name = ?, email = ?, role = ?
      WHERE id = ?;
    `;
    params = [name, email, role, id];
  }

  await executeQuery(SQL, params);

  return { message: "Usuario actualizado correctamente" };
}


export async function deleteUser(id: number) {
  if (!id) throw new Error("Falta el ID del usuario")

  const SQL = `DELETE FROM user WHERE id = ?;`
  await executeQuery(SQL, [id])

  return { message: "Usuario eliminado correctamente" }
}

export default pool
