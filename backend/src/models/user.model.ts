import { dbRun, dbGet } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  email: string;
  password: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserModel {
  static async create(user: Omit<User, 'id'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const result: any = await dbRun(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [user.email, hashedPassword, user.name || null]
    );

    return {
      id: result.lastID,
      email: user.email,
      password: hashedPassword,
      name: user.name
    };
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return await dbGet('SELECT * FROM users WHERE email = ?', [email]) as User;
  }

  static async findById(id: number): Promise<User | undefined> {
    return await dbGet('SELECT * FROM users WHERE id = ?', [id]) as User;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
