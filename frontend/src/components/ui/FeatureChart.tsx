import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FeatureChartProps {
  data: { Feature: string; Value: number }[];
}

const FeatureChart: React.FC<FeatureChartProps> = ({ data }) => {
  return (
    <div className="w-full p-4 bg-white/50 dark:bg-gray-800/50 shadow rounded-lg text-green-600 dark:text-green-400 ">
      <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Linear regression</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="Feature" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="Value" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureChart;
