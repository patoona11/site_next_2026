"use client";

import { useEffect, useState } from "react";
import { Cloud, Thermometer, Wind } from "lucide-react";

export default function WeatherWidget() {
  const [data, setData] = useState<{
    temp: number;
    pm25: number;
    aqi: number;
  } | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=17.3947&longitude=104.7709&current=temperature_2m");
        const weatherData = await weatherRes.json();
        
        const airRes = await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=17.3947&longitude=104.7709&current=pm2_5,us_aqi");
        const airData = await airRes.json();

        setData({
          temp: weatherData.current.temperature_2m,
          pm25: airData.current.pm2_5,
          aqi: airData.current.us_aqi
        });
      } catch (error) {
        console.error("Failed to fetch weather data", error);
      }
    }
    fetchWeather();
  }, []);

  if (!data) return <div className="h-20 animate-pulse bg-white/5 rounded-xl w-full mt-6"></div>;

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-3 px-5 flex items-center gap-6 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--color-tech-indigo)]/20 rounded-lg text-[var(--color-tech-indigo-light)]">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400">อุณหภูมิ (Nakhon Phanom)</p>
          <p className="text-base font-bold text-white">{data.temp}°C</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><Wind className="w-3 h-3"/> PM 2.5</p>
        <p className={`text-base font-bold ${getAqiColor(data.aqi)}`}>
          {data.pm25} <span className="text-xs font-normal text-gray-500">µg/m³</span>
        </p>
      </div>
    </div>
  );
}
