//BB84Chart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const QBERChart = ({ qberRate, qberThreshold, totalSample, errors, keySecured }) => {
    const data = {
        labels: ['Quantum Bit Error Rate (QBER)'],
        datasets: [
            {
                label: 'Calculated QBER (%)',
                data: [qberRate],
                backgroundColor: qberRate > qberThreshold ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                borderColor: qberRate > qberThreshold ? 'rgba(239, 68, 68, 1)' : 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
            },
            {
                label: `Security Threshold (${qberThreshold}%)`,
                data: [qberThreshold],
                type: 'line',
                fill: false,
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHitRadius: 0,
                yAxisID: 'y',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                }
            },
            title: {
                display: true,
                text: 'QBER Analysis: Security Check',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                color: 'var(--primary-blue)',
            },
            tooltip: {
                callbacks: {
                    afterBody: (context) => {
                        return [
                            `Total Sampled: ${totalSample} bits`,
                            `Mismatches (Errors): ${errors}`,
                            `Raw Rate: ${(errors / totalSample * 100).toFixed(2)}%`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: Math.max(qberThreshold * 1.5, qberRate * 1.2, 30), // Ensures graph fits 25% error well
                title: {
                    display: true,
                    text: 'Error Rate (%)',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    };

    return (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-white shadow-lg">
            <h3 className={`text-xl font-extrabold text-center mb-4 ${keySecured ? 'text-success-green' : 'text-danger-red'}`}>
                {keySecured ? 'SECURITY CONFIRMED' : 'SECURITY ABORTED'}
            </h3>
            <Bar data={data} options={options} />
        </div>
    );
};

export default QBERChart;