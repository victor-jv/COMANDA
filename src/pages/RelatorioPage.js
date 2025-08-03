import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RelatorioPage.css';
import FaturamentoChart from '../components/FaturamentoChart';

function RelatorioPage() {
  const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [comandasFechadas, setComandasFechadas] = useState([]);
  const [comandasFiltradas, setComandasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayDefault = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDateToYYYYMMDD(todayDefault));
  const [selectedMonth, setSelectedMonth] = useState(String(todayDefault.getUTCMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(todayDefault.getUTCFullYear()));
  const [reportPeriod, setReportPeriod] = useState('weekly');

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/comandas');
        const fechadas = response.data.filter(c => c.status === 'fechada' && (c.dataAbertura || c.createdAt));
        setComandasFechadas(fechadas);
      } catch (err) {
        console.error("Erro ao buscar comandas:", err);
        setError("Erro ao carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  useEffect(() => {
    if (comandasFechadas.length > 0) {
      calculateRevenueAndFilterComandas();
    }
  }, [comandasFechadas, selectedDate, selectedMonth, selectedYear, reportPeriod]);

  const calculateRevenueAndFilterComandas = () => {
    let revenue = 0;
    let startDate, endDate;

    const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);

    if (reportPeriod === 'daily') {
      startDate = new Date(Date.UTC(sYear, sMonth - 1, sDay));
      endDate = new Date(Date.UTC(sYear, sMonth - 1, sDay, 23, 59, 59, 999));
    } else if (reportPeriod === 'weekly') {
      const selected = new Date(Date.UTC(sYear, sMonth - 1, sDay));
      const dayOfWeek = selected.getUTCDay();
      startDate = new Date(selected);
      startDate.setUTCDate(selected.getUTCDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 6);
      endDate.setUTCHours(23, 59, 59, 999);
    } else if (reportPeriod === 'monthly') {
      startDate = new Date(Date.UTC(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1));
      endDate = new Date(Date.UTC(parseInt(selectedYear), parseInt(selectedMonth), 0, 23, 59, 59, 999));
    } else if (reportPeriod === 'yearly') {
      startDate = new Date(Date.UTC(parseInt(selectedYear), 0, 1));
      endDate = new Date(Date.UTC(parseInt(selectedYear), 11, 31, 23, 59, 59, 999));
    }

    const filtered = comandasFechadas.filter(comanda => {
      const comandaDate = new Date(comanda.dataAbertura || comanda.createdAt);
      return comandaDate >= startDate && comandaDate <= endDate;
    });

    revenue = filtered.reduce((acc, comanda) => acc + parseFloat(comanda.total || 0), 0);

    setFaturamentoTotal(revenue);
    setComandasFiltradas(filtered);
  };

  const getFaturamentoCardTitle = () => {
    const dateForTitle = new Date(selectedDate + 'T00:00:00Z');
    if (reportPeriod === 'daily') {
      return `Faturamento do Dia (${dateForTitle.toLocaleDateString('pt-BR', { timeZone: 'UTC' })})`;
    }
    if (reportPeriod === 'weekly') {
      const start = new Date(dateForTitle);
      start.setUTCDate(start.getUTCDate() - start.getUTCDay());
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 6);
      return `Faturamento da Semana (${start.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - ${end.toLocaleDateString('pt-BR', { timeZone: 'UTC' })})`;
    }
    if (reportPeriod === 'monthly') {
      return `Faturamento de ${new Date(Date.UTC(selectedYear, selectedMonth - 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
    }
    if (reportPeriod === 'yearly') {
      return `Faturamento de ${selectedYear}`;
    }
  };

  const currentYear = new Date().getUTCFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="relatorio-container">
      <h2 className="relatorio-title">Relatório de Faturamento</h2>

      <div className="report-controls">
        <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="period-selector">
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
        </select>

        {(reportPeriod === 'daily' || reportPeriod === 'weekly') && (
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-input" />
        )}

        {(reportPeriod === 'monthly' || reportPeriod === 'yearly') && (
          <div className="month-year-selectors">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-selector"
              disabled={reportPeriod === 'yearly'}
            >
              <option value="01">Jan</option>
              <option value="02">Fev</option>
              <option value="03">Mar</option>
              <option value="04">Abr</option>
              <option value="05">Mai</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Ago</option>
              <option value="09">Set</option>
              <option value="10">Out</option>
              <option value="11">Nov</option>
              <option value="12">Dez</option>
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="year-selector">
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p className="loading-message">Carregando dados...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="relatorio-card">
            <h3>{getFaturamentoCardTitle()}</h3>
            <p className="faturamento-valor">R$ {faturamentoTotal.toFixed(2)}</p>
          </div>

          <FaturamentoChart
            comandas={comandasFechadas}
            period={reportPeriod}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />

          <h3 className="comandas-fechadas-title">Comandas Detalhadas do Período</h3>
          {comandasFiltradas.length > 0 ? (
            <ul className="comandas-list">
              {comandasFiltradas
                .sort((a, b) => new Date(b.dataAbertura || b.createdAt) - new Date(a.dataAbertura || a.createdAt))
                .map(comanda => (
                  <li key={comanda.numero} className="comanda-item">
                    <span className="comanda-item-info">
                      {comanda.nome || 'Cliente'} - {new Date(comanda.dataAbertura || comanda.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="comanda-item-valor">R$ {parseFloat(comanda.total || 0).toFixed(2)}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="no-data-message">Nenhuma comanda finalizada no período selecionado.</p>
          )}
        </>
      )}
    </div>
  );
}

export default RelatorioPage;
