// src/pages/Settings.jsx
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
    <p className="text-gray-400 text-sm mb-8">Configure your Webhook Delivery System</p>
    <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))", border: "1px solid rgba(16,185,129,0.2)" }}>
        <SettingsIcon className="w-6 h-6 text-emerald-400" />
      </div>
      <p className="text-gray-300 font-medium">Settings coming soon</p>
      <p className="text-gray-500 text-sm mt-1">Configuration options will appear here</p>
    </div>
  </div>
);

export default Settings;
