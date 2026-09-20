import React from 'react';
import { Plus, Webhook, MoreVertical, ExternalLink } from 'lucide-react';

const MOCK_WEBHOOKS = [
  {
    id: "wh_123456",
    url: "https://api.devboard.io/webhooks/github",
    events: ["pull_request", "push"],
    status: "active",
    lastDelivery: "5 minutes ago"
  }
];

export default function WebhooksPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  return (
    <div className="max-w-[850px] mx-auto">

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-bold text-slate-900 tracking-tight mb-2">Connected Webhooks</h3>
              <p className="text-[14px] text-slate-500">
                Webhooks allow DevBoard to automatically track architectural decisions from your pull requests as soon as they are merged.
              </p>
            </div>

            <button className="h-[36px] px-4 bg-slate-900 hover:bg-slate-800 shadow-sm rounded-lg flex items-center gap-2 transition-all group shrink-0">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-[13px] font-semibold text-white">Add Webhook</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col divide-y divide-slate-100">
            {MOCK_WEBHOOKS.map((webhook) => (
              <div key={webhook.id} className="p-6 flex items-start justify-between group hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-[32px] h-[32px] bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                      <Webhook className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="text-[14px] font-bold text-slate-900 font-mono">{webhook.url}</h4>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{webhook.status}</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-500 mb-3">
                      Triggered on: <span className="font-semibold text-slate-700">{webhook.events.join(", ")}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-slate-400">
                      <span>Last delivery: {webhook.lastDelivery}</span>
                      <span>&bull;</span>
                      <button className="text-accent-blue hover:underline font-medium flex items-center gap-1">
                        View deliveries <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
  );
}
