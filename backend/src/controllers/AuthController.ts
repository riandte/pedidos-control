import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, cpf, senha, endereco, telefone, tipo } = req.body;

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { cpf }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashSenha = await bcrypt.hash(senha, 8);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        cpf,
        senha: hashSenha,
        endereco,
        telefone,
        tipo: tipo || 'CLIENTE' // Default to CLIENTE
      }
    });

    // Remove password from response
    const { senha: _, ...userReturn } = user;

    return res.json(userReturn);
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign({ id: user.id, role: user.tipo }, process.env.JWT_SECRET || 'default', {
      expiresIn: '1d',
    });

    // Remove password from response
    const { senha: _, ...userReturn } = user;

    return res.json({
      user: userReturn,
      token,
    });
  }

  async checkPhone(req: Request, res: Response) {
    const { telefone } = req.body;
    if (!telefone) return res.status(400).json({ error: 'Telefone é obrigatório' });

    const user = await prisma.user.findFirst({ where: { telefone } });
    if (user) {
      return res.json({ 
        exists: true, 
        user: { 
          nome: user.nome, 
          endereco: user.endereco,
          id: user.id 
        } 
      });
    }
    return res.json({ exists: false });
  }

  async phoneAuth(req: Request, res: Response) {
    const { telefone, nome, endereco } = req.body;

    if (!telefone) return res.status(400).json({ error: 'Telefone é obrigatório' });

    let user = await prisma.user.findFirst({ where: { telefone } });

    if (!user) {
      // Create new user
      // Password dummy since it's phone auth
      const hashSenha = await bcrypt.hash('phone-auth-secret-' + Date.now(), 8);
      
      user = await prisma.user.create({
        data: {
          telefone,
          nome: nome || 'Cliente',
          endereco: endereco || '',
          senha: hashSenha,
          tipo: 'CLIENTE'
        }
      });
    } else {
      // Update existing user info if provided
      if (nome || endereco) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            nome: nome || user.nome,
            endereco: endereco || user.endereco
          }
        });
      }
    }

    const token = jwt.sign({ id: user.id, role: user.tipo }, process.env.JWT_SECRET || 'default', {
      expiresIn: '30d',
    });

    const { senha: _, ...userReturn } = user;

    return res.json({
      user: userReturn,
      token,
    });
  }
}
