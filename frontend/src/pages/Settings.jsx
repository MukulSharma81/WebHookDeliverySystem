// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  RefreshCw, 
  ShieldCheck, 
  Monitor, 
  Trash2, 
  Save, 
  AlertCircle,
  Database
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const Settings = () => {
  const [settings, setSettings] = useState({
    maxRetries: 3,
    pollIntervalMs: 10000,
    signingSecret: "",
    appName: "WebhookDeliverySystem",
    autoPurgeDays: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err) {
      setError("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axios.patch(`${API_BASE}/settings`, settings);
      if (response.data.success) {
        setSuccessMsg("Settings updated successfully! Changes applied to worker.");
        // Clear success message after 3s
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError("Error updating settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm("Are you sure you want to clear all successful webhook logs? This cannot be undone.")) return;
    
    try {
      const response = await axios.post(`${API_BASE}/settings/purge`);
      if (response.data.success) {
        alert(response.data.message);
      }
    } catch (err) {
      alert("Purge failed.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 animate-pulse">
      <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-400">Loading Configuration...</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Settings</h1>
          <p className="text-gray-400 text-sm">Fine-tune your Delivery Guarantee Engine</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="btn-emerald flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        
        {/* Delivery Rules Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-gray-100">Delivery & Retries</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Max Retry Attempts</label>
              <input 
                type="number" 
                value={settings.maxRetries}
                onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
                className="input-dark"
                min="0" max="100"
              />
              <p className="text-gray-500 text-[10px] mt-1.5">Total attempts before marking as 'Permanently Failed'</p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Polling Interval (ms)</label>
              <input 
                type="number" 
                value={settings.pollIntervalMs}
                onChange={(e) => setSettings({...settings, pollIntervalMs: parseInt(e.target.value)})}
                className="input-dark"
                step="1000" min="1000"
              />
              <p className="text-gray-500 text-[10px] mt-1.5">Time between worker cycles (1000ms = 1s)</p>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-gray-100">Webhook Security</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Global Signing Secret</label>
              <input 
                type="text" 
                value={settings.signingSecret}
                onChange={(e) => setSettings({...settings, signingSecret: e.target.value})}
                className="input-dark font-mono text-xs"
                placeholder="whsec_..."
              />
              <p className="text-gray-500 text-[10px] mt-1.5">Sent in X-Webhook-Signature header for payload verification</p>
            </div>

            <div className="pt-2">
               <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    "Webhooks sent from this engine will include a SHA-256 signature generated using this secret."
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Application General Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-gray-100">Application & Branding</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">System Display Name</label>
              <input 
                type="text" 
                value={settings.appName}
                onChange={(e) => setSettings({...settings, appName: e.target.value})}
                className="input-dark"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Auto-Purge (Days)</label>
              <input 
                type="number" 
                value={settings.autoPurgeDays}
                onChange={(e) => setSettings({...settings, autoPurgeDays: parseInt(e.target.value)})}
                className="input-dark"
                min="1"
              />
              <p className="text-gray-500 text-[10px] mt-1.5">Logs older than this will be auto-archived/cleaned.</p>
            </div>
          </div>
        </div>

        {/* Advanced / Maintenance Card */}
        <div className="glass-card p-6 border-red-500/10">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-gray-100">Maintenance & Database</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
              <div>
                <p className="text-sm font-bold text-red-200">Clear Successful Logs</p>
                <p className="text-[10px] text-gray-500">Remove all webhooks marked as 'Success'</p>
              </div>
              <button 
                type="button"
                onClick={handlePurge}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
               <AlertCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-gray-500 italic leading-relaxed">
                 Settings are stored in MongoDB and broadcasted to the background worker at the start of every cycle.
               </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
