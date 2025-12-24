import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CategoriaController } from '../controllers/CategoriaController';
import { ProdutoController } from '../controllers/ProdutoController';
import { PedidoController } from '../controllers/PedidoController';
import { AdminPedidoController } from '../controllers/AdminPedidoController';
import { KDSController } from '../controllers/KDSController';
import { CarrinhoController } from '../controllers/CarrinhoController';
import { PagamentoController } from '../controllers/PagamentoController';
import { IngredienteController } from '../controllers/IngredienteController';
import { GrupoAdicionalController } from '../controllers/GrupoAdicionalController';
import { ConfiguracaoController } from '../controllers/ConfiguracaoController';
import { SetupController } from '../controllers/SetupController';
import { MigrateController } from '../controllers/MigrateController';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';

const router = Router();

const authController = new AuthController();
const categoriaController = new CategoriaController();
const produtoController = new ProdutoController();
const pedidoController = new PedidoController();
const adminPedidoController = new AdminPedidoController();
const kdsController = new KDSController();
const carrinhoController = new CarrinhoController();
const pagamentoController = new PagamentoController();
const ingredienteController = new IngredienteController();
const grupoAdicionalController = new GrupoAdicionalController();
const configuracaoController = new ConfiguracaoController();
const setupController = new SetupController();
const migrateController = new MigrateController();

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Setup (Executar Seed em Produção)
router.get('/setup', setupController.run);
// Migração de Emergência
router.get('/migrate', migrateController.run);

// Configurações (Público + Admin)
router.get('/configuracoes', configuracaoController.show);
router.get('/admin/configuracoes', authMiddleware, configuracaoController.show);
router.put('/admin/configuracoes', authMiddleware, configuracaoController.update);

// Categorias
router.get('/categorias', categoriaController.index);
router.post('/admin/categorias', authMiddleware, categoriaController.create);

// Ingredientes
router.get('/admin/ingredientes', authMiddleware, ingredienteController.index);
router.post('/admin/ingredientes', authMiddleware, ingredienteController.create);
router.put('/admin/ingredientes/:id', authMiddleware, ingredienteController.update);
router.delete('/admin/ingredientes/:id', authMiddleware, ingredienteController.delete);

// Grupos de Adicionais
router.get('/admin/grupos-adicionais', authMiddleware, grupoAdicionalController.index);
router.get('/admin/grupos-adicionais/:id', authMiddleware, grupoAdicionalController.show);
router.post('/admin/grupos-adicionais', authMiddleware, grupoAdicionalController.create);
router.put('/admin/grupos-adicionais/:id', authMiddleware, grupoAdicionalController.update);
router.delete('/admin/grupos-adicionais/:id', authMiddleware, grupoAdicionalController.delete);

// Produtos (Antigo Itens)
router.get('/produtos', produtoController.index);
router.get('/produtos/:id', produtoController.show);
router.get('/admin/produtos', authMiddleware, produtoController.indexAdmin);
router.post('/admin/produtos', authMiddleware, produtoController.create);
router.put('/admin/produtos/:id', authMiddleware, produtoController.update);

// Carrinho (Simulação)
router.post('/carrinho/simular', carrinhoController.simular);

// Pedidos (Cliente)
router.post('/pedidos', optionalAuthMiddleware, pedidoController.create);

// Pagamentos (Mock)
router.post('/pagamentos/iniciar', pagamentoController.iniciar);
router.post('/pagamentos/webhook-mock', pagamentoController.webhookMock);

// ADMIN: Gestão de Pedidos
router.get('/admin/pedidos', authMiddleware, adminPedidoController.index);
router.get('/admin/pedidos/:id', authMiddleware, adminPedidoController.show);
router.patch('/admin/pedidos/:id/status', authMiddleware, adminPedidoController.update);

// KDS (Cozinha)
router.get('/kds/fila', authMiddleware, kdsController.index);
router.patch('/kds/pedidos/:id/pronto', authMiddleware, kdsController.marcarPronto);

export default router;
