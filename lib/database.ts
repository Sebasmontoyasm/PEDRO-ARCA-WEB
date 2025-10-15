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
  timezone: "+00:00",
  charset: "utf8mb4",
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
    const [censoTableData] = (await executeQuery(censoTableQuery)) as any[]

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
export async function censoProcess(AIND: string) {
  try {
    const censoProcessTableQuery = `
      CALL SP_ARCA_CENSO_PROCESS();
    `
    const [censoProcessData] = (await executeQuery(censoProcessTableQuery)) as any[]

    return {
      censoProcess: censoProcessData || []
    }
  } catch (error) {
    console.error("Error obteniendo datos de gráficos:", error)
    return {
      censoProcess: [],
    }
  }
}

export default pool
