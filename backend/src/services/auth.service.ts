import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash the password - the 12 is the "cost factor"
    // Higher = slower to hash = harder to brute force
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        displayName: input.displayName ?? input.username,
      },
    });

    // Never return the password hash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async login(input: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      // Important: same error message whether email or password is wrong
      // This prevents attackers from knowing which one failed
      throw new Error('Invalid email or password');
    }

    // Compare provided password with stored hash
    const isValidPassword = await bcrypt.compare(
      input.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email } as object,
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }
}

export const authService = new AuthService();