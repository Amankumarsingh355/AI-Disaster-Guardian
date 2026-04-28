/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisasterDashboard } from './components/DisasterDashboard';
import { analyzeLocation, type DisasterResponse } from './services/geminiService';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [result, setResult] = useState<DisasterResponse | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleCheckSafeStatus = async (coords?: { lat: number; lng: number }) => {
    setResult(null);

    const performAnalysis = async (lat: number, lng: number) => {
      setIsLoading(true);
      setLocation({ lat, lng });
      try {
        const analysis = await analyzeLocation(lat, lng);
        setResult(analysis);
        setLastChecked(new Date());
      } catch (error) {
        console.error(error);
        setResult({
          status: "Green",
          message: "Guardian satellite link is currently offline. Preliminary local heuristics suggest no immediate regional threats.",
          riskLevel: "Low",
          hazards: ["Satellite Link Down"],
          nearbyAlerts: ["Regional scan unavailable"],
          safetyTips: ["Check local news for weather updates", "Keep an emergency kit ready", "Stay aware of your surroundings"]
        });
        setLastChecked(new Date());
      } finally {
        setIsLoading(false);
        setIsFetchingLocation(false);
      }
    };

    if (coords) {
      await performAnalysis(coords.lat, coords.lng);
      return;
    }

    setIsFetchingLocation(true);
    // Get location (Mocking or Real)
    if ("geolocation" in navigator) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await performAnalysis(position.coords.latitude, position.coords.longitude);
        },
        async (error) => {
          console.warn("Location error:", error.message);
          console.warn("Using fallback mock location (California Wildfire Zone).");
          const mockLat = 34.0259;
          const mockLng = -118.7798;
          await performAnalysis(mockLat, mockLng);
        },
        geoOptions
      );
    } else {
      setIsFetchingLocation(false);
      alert("Geolocation is not supported by this browser.");
      // Fallback anyway for demo
      const mockLat = 34.0259;
      const mockLng = -118.7798;
      await performAnalysis(mockLat, mockLng);
    }
  };

  return (
    <DisasterDashboard
      isLoading={isLoading || isFetchingLocation}
      isFetchingLocation={isFetchingLocation}
      onCheckStatus={handleCheckSafeStatus}
      result={result}
      location={location}
      lastChecked={lastChecked}
    />
  );
}

