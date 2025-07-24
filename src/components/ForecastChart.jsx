import React from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';

function ForecastChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No forecast data available</p>
      </div>
    );
  }

  const option = {
    title: {
      text: '7-Day Weather Forecast',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      data: ['Temperature', 'Precipitation', 'Wind Speed'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Temperature (°F)',
        position: 'left',
        axisLabel: {
          color: '#6b7280'
        }
      },
      {
        type: 'value',
        name: 'Precipitation (%)',
        position: 'right',
        axisLabel: {
          color: '#6b7280'
        }
      }
    ],
    series: [
      {
        name: 'Temperature',
        type: 'line',
        data: data.map(d => d.temperature),
        smooth: true,
        lineStyle: {
          color: '#3b82f6'
        },
        itemStyle: {
          color: '#3b82f6'
        }
      },
      {
        name: 'Precipitation',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(d => d.precipitation),
        itemStyle: {
          color: '#06b6d4'
        }
      },
      {
        name: 'Wind Speed',
        type: 'line',
        data: data.map(d => d.windSpeed),
        smooth: true,
        lineStyle: {
          color: '#10b981'
        },
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  };

  return (
    <motion.div 
      className="bg-white rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ReactECharts 
        option={option} 
        style={{ height: '400px' }}
        opts={{ renderer: 'svg' }}
      />
    </motion.div>
  );
}

export default ForecastChart;