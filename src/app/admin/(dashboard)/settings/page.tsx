import { Settings2, Shield, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettings() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase">Clan Settings</h1>
        <p className="text-panther-text mt-1">Configure attendance rules, discipline thresholds, and clan info.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 bg-panther-gold/10 text-panther-gold border border-panther-gold/30 rounded-lg font-bold flex items-center gap-3 transition-colors">
            <AlertTriangle className="w-5 h-5" /> Attendance Rules
          </button>
          <button className="w-full text-left px-4 py-3 text-panther-text hover:bg-panther-dark border border-transparent hover:border-panther-border rounded-lg flex items-center gap-3 transition-colors">
            <Shield className="w-5 h-5" /> Clan Profile
          </button>
          <button className="w-full text-left px-4 py-3 text-panther-text hover:bg-panther-dark border border-transparent hover:border-panther-border rounded-lg flex items-center gap-3 transition-colors">
            <Users className="w-5 h-5" /> Roles & Permissions
          </button>
        </div>

        {/* Main Settings Panel */}
        <div className="md:col-span-2 bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-panther-border flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-panther-gold" /> Attendance & Discipline Rules
          </h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Warning Threshold</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={3} className="w-20 bg-panther-dark border border-panther-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-panther-gold text-center" />
                  <span className="text-panther-text text-sm">no-shows</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Suspension Threshold</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={5} className="w-20 bg-panther-dark border border-panther-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-panther-gold text-center" />
                  <span className="text-panther-text text-sm">no-shows</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Removal Review Threshold</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={7} className="w-20 bg-panther-dark border border-panther-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-panther-gold text-center" />
                  <span className="text-panther-text text-sm">no-shows</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Suspension Duration</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={7} className="w-20 bg-panther-dark border border-panther-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-panther-gold text-center" />
                  <span className="text-panther-text text-sm">days</span>
                </div>
              </div>
            </div>

            <div className="border-t border-panther-border pt-6 mt-6 space-y-4">
              <label className="flex items-center justify-between p-4 bg-panther-dark border border-panther-border rounded-lg cursor-pointer hover:border-panther-gold/50 transition-colors">
                <div>
                  <h4 className="text-white font-bold text-sm">Count "Declined" as No-Show?</h4>
                  <p className="text-panther-text text-xs mt-1">If a player declines before the tournament, does it count against them?</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-panther-border" />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-panther-border cursor-pointer"></label>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-panther-dark border border-panther-border rounded-lg cursor-pointer hover:border-panther-gold/50 transition-colors">
                <div>
                  <h4 className="text-white font-bold text-sm">Require Explanation for Declining?</h4>
                  <p className="text-panther-text text-xs mt-1">Ask players to provide a reason (Work, School, etc.) when they decline.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-panther-gold border-4 appearance-none cursor-pointer border-panther-gold" />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-panther-gold/30 cursor-pointer"></label>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-panther-dark border border-panther-border rounded-lg cursor-pointer hover:border-panther-gold/50 transition-colors">
                <div>
                  <h4 className="text-white font-bold text-sm">Automatic Suspension?</h4>
                  <p className="text-panther-text text-xs mt-1">Automatically suspend players when they hit the threshold (otherwise requires Admin approval).</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-panther-border" />
                  <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-6 rounded-full bg-panther-border cursor-pointer"></label>
                </div>
              </label>
            </div>

            <div className="pt-6 text-right">
              <button type="button" className="px-6 py-3 bg-panther-gold text-panther-dark font-bold rounded-lg hover:bg-panther-gold-hover transition-colors">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
