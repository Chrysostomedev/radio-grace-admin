"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

interface ChartLineProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  lines?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  height?: number;
  showArea?: boolean;
  title?: string;
}

export default function ChartLine({
  data,
  lines = [{ key: "value", name: "Valeur", color: "#F0A93E" }],
  height = 300,
  showArea = false,
  title,
}: ChartLineProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg bg-[#FFFBF0] p-6 text-center">
        <p className="text-[#163A2C]/50">Aucune donnée disponible</p>
      </div>
    );
  }

  const chartComponent = showArea ? (
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        {lines.map((line) => (
          <linearGradient id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1" key={line.key}>
            <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={line.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#163A2C/10" />
      <XAxis 
        dataKey="name" 
        stroke="#163A2C/50"
        style={{ fontSize: "12px" }}
      />
      <YAxis 
        stroke="#163A2C/50"
        style={{ fontSize: "12px" }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "#0E241C",
          border: "1px solid #F0A93E",
          borderRadius: "8px",
          padding: "12px",
        }}
        labelStyle={{ color: "#F0A93E", fontWeight: "bold" }}
        itemStyle={{ color: "#FFF" }}
      />
      <Legend 
        wrapperStyle={{ paddingTop: "20px" }}
        iconType="line"
      />
      {lines.map((line) => (
        <Area
          key={line.key}
          type="monotone"
          dataKey={line.key}
          name={line.name}
          stroke={line.color}
          fill={`url(#gradient-${line.key})`}
          strokeWidth={2}
          dot={{ fill: line.color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </AreaChart>
  ) : (
    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#163A2C/10" />
      <XAxis 
        dataKey="name" 
        stroke="#163A2C/50"
        style={{ fontSize: "12px" }}
      />
      <YAxis 
        stroke="#163A2C/50"
        style={{ fontSize: "12px" }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "#0E241C",
          border: "1px solid #F0A93E",
          borderRadius: "8px",
          padding: "12px",
        }}
        labelStyle={{ color: "#F0A93E", fontWeight: "bold" }}
        itemStyle={{ color: "#FFF" }}
      />
      <Legend 
        wrapperStyle={{ paddingTop: "20px" }}
        iconType="line"
      />
      {lines.map((line) => (
        <Line
          key={line.key}
          type="monotone"
          dataKey={line.key}
          name={line.name}
          stroke={line.color}
          strokeWidth={3}
          dot={{ fill: line.color, r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      ))}
    </LineChart>
  );

  return (
    <div className="w-full rounded-lg bg-[#FFFBF0] p-6 shadow-sm">
      {title && (
        <h3 className="mb-6 text-lg font-bold text-[#0E241C]">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {chartComponent}
      </ResponsiveContainer>
    </div>
  );
}
