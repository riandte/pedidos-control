import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Ingrediente {
  id: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidade: string;
}

export function AdminEstoque() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEstoque = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/estoque');
      setIngredientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstoque();
  }, []);

  return (
    <div>
      <h1>Controle de Estoque</h1>
      <button onClick={fetchEstoque} style={{ marginBottom: '1rem' }}>Atualizar</button>

      {loading && <p>Carregando...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead style={{ background: '#f8f9fa' }}>
          <tr>
            <th style={thStyle}>Ingrediente</th>
            <th style={thStyle}>Atual</th>
            <th style={thStyle}>Mínimo</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map(ing => {
            const isLow = Number(ing.estoqueAtual) <= Number(ing.estoqueMinimo);
            return (
              <tr key={ing.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{ing.nome}</td>
                <td style={tdStyle}>{Number(ing.estoqueAtual).toFixed(2)} {ing.unidade}</td>
                <td style={tdStyle}>{Number(ing.estoqueMinimo).toFixed(2)} {ing.unidade}</td>
                <td style={tdStyle}>
                  {isLow ? (
                    <span style={{ background: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>BAIXO</span>
                  ) : (
                     <span style={{ background: '#2ecc71', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>OK</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '1rem',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
} as React.CSSProperties;

const tdStyle = {
  padding: '1rem'
} as React.CSSProperties;
