declare global {
  namespace Express {
    interface Request {
      adminId?: number;
    }
  }
}
export {};