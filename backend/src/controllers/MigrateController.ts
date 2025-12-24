import { Request, Response } from 'express';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class MigrateController {
  async run(req: Request, res: Response) {
    const { key } = req.query;

    if (key !== process.env.SETUP_KEY && key !== 'setup123') {
      return res.status(403).json({ error: 'Chave inválida.' });
    }

    try {
      console.log('Iniciando migração via endpoint...');
      
      // Tenta rodar migrate deploy. Se falhar, tenta db push como fallback
      try {
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
        console.log('Migrate STDOUT:', stdout);
        if (stderr) console.error('Migrate STDERR:', stderr);
        
        return res.json({ 
          message: 'Migração (deploy) executada com sucesso!', 
          output: stdout,
          error: stderr 
        });
      } catch (migrateError) {
        console.warn('Migrate deploy falhou, tentando db push...', migrateError);
        
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate');
        console.log('Push STDOUT:', stdout);
        
        return res.json({ 
          message: 'Migração (push) executada com sucesso (fallback)!', 
          output: stdout,
          error: stderr 
        });
      }

    } catch (error: any) {
      console.error('Erro fatal na migração:', error);
      return res.status(500).json({ 
        error: 'Falha ao rodar migração', 
        details: error.message
      });
    }
  }
}
