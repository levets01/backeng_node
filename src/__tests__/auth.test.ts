import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('Auth Middleware', () => {
  it('debe extraer el payload de un token válido', () => {
    const payload: TokenPayload = { id: 1, email: 'test@test.com', role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('test@test.com');
    expect(decoded.role).toBe('admin');
  });

  it('debe fallar con un token inválido', () => {
    expect(() => {
      jwt.verify('token_invalido', JWT_SECRET);
    }).toThrow();
  });
});
