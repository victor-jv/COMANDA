import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FaturamentoChart = ({ comandas, period, selectedDate, selectedMonth, selectedYear }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (!comandas || comandas.length === 0) return;

    let labels = [];
    let data = [];
    let chartTitle = '';

    // Lógica para processar os dados com base no período
    if (period === 'weekly') {
      chartTitle = 'Faturamento Diário da Semana';
      labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      data = Array(7).fill(0);

      const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
      const selected = new Date(Date.UTC(sYear, sMonth - 1, sDay));
      const dayOfWeek = selected.getUTCDay();
      const weekStart = new Date(selected);
      weekStart.setUTCDate(selected.getUTCDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999);

      comandas.forEach(comanda => {
        const comandaDate = new Date(comanda.dataAbertura || comanda.createdAt);
        if (comandaDate >= weekStart && comandaDate <= weekEnd) {
          const comandaDay = comandaDate.getUTCDay();
          data[comandaDay] += parseFloat(comanda.total || 0);
        }
      });

    } else if (period === 'monthly') {
      chartTitle = 'Faturamento Semanal do Mês';
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'];
      data = Array(5).fill(0);

      comandas.forEach(comanda => {
        const comandaDate = new Date(comanda.dataAbertura || comanda.createdAt);
        const comandaMonth = comandaDate.getUTCMonth() + 1;
        const comandaYear = comandaDate.getUTCFullYear();

        if (comandaMonth === parseInt(selectedMonth) && comandaYear === parseInt(selectedYear)) {
          const weekOfMonth = Math.floor((comandaDate.getUTCDate() - 1) / 7);
          data[weekOfMonth] += parseFloat(comanda.total || 0);
        }
      });
      
    } else if (period === 'yearly') {
        chartTitle = `Faturamento Mensal de ${selectedYear}`;
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        data = Array(12).fill(0);

        comandas.forEach(comanda => {
            const comandaDate = new Date(comanda.dataAbertura || comanda.createdAt);
            if (comandaDate.getUTCFullYear() === parseInt(selectedYear)) {
                const monthOfYear = comandaDate.getUTCMonth();
                data[monthOfYear] += parseFloat(comanda.total || 0);
            }
        });
    }

    setChartData({
      labels,
      datasets: [
        {
          label: 'Faturamento R$',
          data,
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    });

    setChartOptions({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartTitle,
          font: {
              size: 18,
              weight: 'bold',
          },
          padding: {
              bottom: 20,
          }
        },
      },
       scales: {
        y: {
            beginAtZero: true
        }
    }
    });
  }, [comandas, period, selectedDate, selectedMonth, selectedYear]);

  if (period === 'daily' || !comandas || comandas.length === 0) {
      return null;
  }

  return (
    <div className="chart-container">
      <Bar options={chartOptions} data={chartData} />
    </div>
  );
};

export default FaturamentoChart;