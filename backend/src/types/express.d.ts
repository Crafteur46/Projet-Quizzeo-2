import 'express-session';

// This file extends/augments existing types from Express and other libraries.

declare global {
  namespace Express {
    export interface Request {
      // Add the 'currentUser' property to the Express Request interface.
      // The 'currentUser' object is typically attached by authentication middleware.
      currentUser?: { id: number };
    }
  }
}

declare module 'express-session' {
  // Extend the SessionData interface from express-session
  export interface SessionData {
    // Add custom properties to the session object.
    userId: number;
    token?: string;
  }
}
