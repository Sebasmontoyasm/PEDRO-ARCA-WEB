import jwt from "jsonwebtoken";

export function generateJWT(payload: object) {
  const secret = process.env.JWT_SECRET || "secret_key_dev";
  return jwt.sign(payload, secret, { expiresIn: "2h" });
}

export function verifyJWT(token: string) {
  const secret = process.env.JWT_SECRET || "secret_key_dev";
  try {
    const decoded = jwt.verify(token, secret) as any;
    console.log('Token verificado correctamente:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}
