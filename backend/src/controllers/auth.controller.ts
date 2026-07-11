import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response) {
  try {
    const { email, username, password, displayName } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'Email, username and password are required' });
      return;
    }

    const user = await authService.register({
      email,
      username,
      password,
      displayName,
    });

    // Auto-login after register — create a token
    const { token } = await authService.login({ email, password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: 'Account created successfully', user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

  async login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { user, token } = await authService.login({ email, password });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Also send token in body for Safari fallback
    res.json({ message: 'Logged in successfully', user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  }

  async me(req: Request, res: Response) {
    // req.user is set by auth middleware (we'll build that next)
    res.json({ user: (req as any).user });
  }
}

export const authController = new AuthController();