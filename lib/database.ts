import mysql from "mysql2/promise"

// Configuración de la conexión a MariaDB
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

export async function getMetricIA() {
  try {
    const SQL = `SELECT * FROM MetricIA;`
    const [ia] = (await executeQuery(SQL)) as any[]
    return ia || []

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
    const censoTableQuery = `
      CALL SP_ARCA_METRICS_CENSO();
    `
    const [censoTableData] = await executeQuery(censoTableQuery) as any;

    return {
      censo: censoTableData || []
    }
  } catch (error) {
    console.error("Error obteniendo datos de gráficos:", error)
    return {
      censo: [],
    }
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
      SELECT DATE_FORMAT(MAX(fechainsert), '%d-%m-%Y %r') AS fechainsert
      FROM Monitoreo_rpa;

    `
    const [timeAnaExtraccion] = await executeQuery(timeAnaExtraccionQuery) as any;

    return {
      timeAnaExtraccion: timeAnaExtraccion || []
    }
  } catch (error) {
    console.error("Error obteniendo datos de gráficos:", error)
    return {
      timeAnaExtraccion: [],
    }
  }
}

export async function reprocesarIngreso(ainid: number) {
  try {
    const userID = 1; // ID de usuario fijo para este ejemplo
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
    console.error("Error obteniendo métricas:", error)
    return []
  }
}

export async function getUsersRoles() {
  try {
    const SQL = `SELECT * FROM role;`
    const role = (await executeQuery(SQL)) as any[]
    return role || []

  } catch (error) {
    console.error("Error obteniendo métricas:", error)
    return []
  }
}


export default pool
