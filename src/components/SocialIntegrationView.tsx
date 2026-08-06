import React, { useState } from 'react';
import { Share2, MessageCircle, Send, Copy, Check, ExternalLink, Code2, Bot, Sparkles, Smartphone, QrCode } from 'lucide-react';
import { Language } from '../types';

interface SocialIntegrationViewProps {
  language: Language;
}

export const SocialIntegrationView: React.FC<SocialIntegrationViewProps> = ({ language }) => {
  const [simPlatform, setSimPlatform] = useState<'whatsapp' | 'messenger'>('whatsapp');
  const [userQuery, setUserQuery] = useState<string>('What is the latest price of Yamaha R15 V4 and MT-15 in BD?');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'bot'; text: string; quickReplies?: string[] }>>([
    {
      sender: 'bot',
      text: '*Yamaha BD Official WhatsApp Bot*\n\nHello! Welcome to Yamaha Motorbike Bangladesh (+8801787687254).\n\nHow can we help you today? You can type bike names for price lists or ask for nearby showrooms.',
      quickReplies: ['🏍️ R15 V4 Price', '📍 Dhaka Showrooms', '📅 Book Service']
    }
  ]);
  const [isSimLoading, setIsSimLoading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [waStatus, setWaStatus] = useState<any>({ status: 'initializing', qrDataUrl: null, autoSendEnabled: false });

  const fetchWaLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp-dispatch-logs');
      const data = await res.json();
      if (data.logs) setWaLogs(data.logs);
    } catch (e) {
      console.warn('Failed to fetch WA logs:', e);
    }
  };

  const fetchWaStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp-status');
      const data = await res.json();
      setWaStatus(data);
    } catch (e) {
      console.warn('Failed to fetch WA status:', e);
    }
  };

  React.useEffect(() => {
    fetchWaLogs();
    fetchWaStatus();
    const interval = setInterval(() => { fetchWaLogs(); fetchWaStatus(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimSend = async (customText?: string) => {
    const q = (customText || userQuery).trim();
    if (!q || isSimLoading) return;

    setChatLog(prev => [...prev, { sender: 'user', text: q }]);
    if (!customText) setUserQuery('');
    setIsSimLoading(true);

    try {
      const endpoint = simPlatform === 'whatsapp' ? '/api/whatsapp-webhook-sim' : '/api/messenger-webhook-sim';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, senderPhone: '+8801711223344' })
      });

      const data = await res.json();
      setChatLog(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.replyMessage || 'Automated Bot Response',
          quickReplies: data.quickReplies
        }
      ]);
    } catch (err) {
      console.error('Webhook sim error:', err);
    } finally {
      setIsSimLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const embedScriptCode = `<script>
  window.YamahaBdChatConfig = {
    appletId: "yamaha-bd-ai-v1",
    whatsappPhone: "+8801787687254",
    messengerPage: "yamaha.bd.official",
    language: "bn",
    themeColor: "#0020A1"
  };
</script>
<script src="${window.location.origin}/chat-widget.js" async></script>`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <Share2 className="w-4 h-4 text-[#004791]" />
          <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ ও ফেসবুক মেসেঞ্জার ইন্টিগ্রেশন' : 'Seamless Multi-Channel Customer Connect'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'হোয়াটসঅ্যাপ এবং ফেসবুক মেসেঞ্জার বট সিমুলেটর' : 'WhatsApp & Facebook Messenger Integration Hub'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'লাইভ মেসেজিং বটের রেসপন্স টেস্ট করুন এবং ডিলার ওয়েবসাইটের জন্য উইজেট কোড নিন।'
            : 'Simulate live automated responses for WhatsApp & Facebook Messenger or embed the chat widget on any Yamaha dealer website.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE PLATFORM CHAT SIMULATOR */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-base">
                {language === 'bn' ? 'লাইভ বট সিমুলেটর' : 'Live Social Bot Simulator'}
              </h2>
            </div>

            {/* Platform Toggle */}
            <div className="flex items-center bg-[#111111] p-1 rounded-xl border border-gray-800 text-xs">
              <button
                onClick={() => setSimPlatform('whatsapp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  simPlatform === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => setSimPlatform('messenger')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  simPlatform === 'messenger'
                    ? 'bg-[#004791] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>FB Messenger</span>
              </button>
            </div>
          </div>

          {/* Simulated Chat Phone Frame */}
          <div className="bg-[#111111] rounded-2xl border border-gray-800 p-4 h-[440px] flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Header inside Phone */}
            <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold text-white ${
              simPlatform === 'whatsapp' ? 'bg-emerald-900/40 border border-emerald-500/30' : 'bg-[#004791]/30 border border-[#004791]/50'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                <span>{simPlatform === 'whatsapp' ? 'Yamaha BD WhatsApp (+8801787687254)' : 'Yamaha Motorbike Bangladesh Page'}</span>
              </div>
              <span className="text-[10px] text-gray-400">Verified Bot</span>
            </div>

            {/* Message Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs scrollbar-thin">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? simPlatform === 'whatsapp' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#004791] text-white rounded-tr-none'
                      : 'bg-[#0a0a0a] border border-gray-800 text-gray-200 rounded-tl-none font-mono text-[11px]'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSimSend(qr)}
                          className="bg-[#0a0a0a] hover:bg-[#181818] text-blue-300 border border-gray-800 text-[10px] px-2.5 py-1 rounded-full transition"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSimLoading && (
                <div className="text-gray-400 text-xs italic animate-pulse">
                  Yamaha Bot is typing automated response...
                </div>
              )}
            </div>

            {/* Send Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimSend();
              }}
              className="flex items-center gap-2 pt-2 border-t border-gray-800"
            >
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={simPlatform === 'whatsapp' ? 'Type WhatsApp message...' : 'Type Messenger message...'}
                className="flex-1 bg-[#0a0a0a] border border-gray-800 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSimLoading || !userQuery.trim()}
                className={`p-2.5 rounded-xl text-white font-bold transition ${
                  simPlatform === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#004791] hover:bg-blue-700'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: INTEGRATION LINKS & CODE GENERATOR */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real WhatsApp Connection Status */}
          <div className={`bg-[#0a0a0a] border rounded-3xl p-6 shadow-2xl space-y-3 ${
            waStatus.autoSendEnabled ? 'border-emerald-500/60' : 'border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'রিয়েল WhatsApp সংযোগ স্ট্যাটাস' : 'Real WhatsApp Connection Status'}</span>
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
                waStatus.autoSendEnabled
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-950 text-amber-400 border-amber-500/40'
              }`}>
                {waStatus.status?.toUpperCase()}
              </span>
            </div>

            {waStatus.autoSendEnabled ? (
              <p className="text-xs text-emerald-300">
                ✅ {language === 'bn'
                  ? `WhatsApp সংযুক্ত (নম্বর: +${waStatus.connectedNumber}) — সব লিড এখন সত্যিকারের অটো-সেন্ড হচ্ছে +8801787687254 নম্বরে।`
                  : `WhatsApp connected (number: +${waStatus.connectedNumber}) — all leads now genuinely auto-send to +8801787687254.`}
              </p>
            ) : waStatus.qrDataUrl ? (
              <div className="text-center space-y-2">
                <p className="text-xs text-amber-300">
                  {language === 'bn'
                    ? 'নিচের QR কোডটি সেন্ডার ফোনের WhatsApp > Linked Devices থেকে স্ক্যান করুন — এরপর সব মেসেজ অটো-সেন্ড হবে:'
                    : 'Scan this QR from the sender phone (WhatsApp > Linked Devices) — after that every lead auto-sends:'}
                </p>
                <img src={waStatus.qrDataUrl} alt="WhatsApp QR" className="mx-auto w-52 h-52 rounded-xl border-4 border-white bg-white" />
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                {language === 'bn'
                  ? `WhatsApp ক্লায়েন্ট ${waStatus.status === 'initializing' ? 'চালু হচ্ছে... QR কোড আসছে।' : 'সংযুক্ত নয় — লিডগুলো আপাতত ক্লিক-টু-সেন্ড লিংক হিসেবে তৈরি হচ্ছে।'}`
                  : `WhatsApp client is ${waStatus.status === 'initializing' ? 'starting up... QR code incoming.' : 'not connected — leads currently fall back to honest click-to-send links.'}`}
                {waStatus.lastError && <span className="block mt-1 text-[10px] text-red-400 font-mono">{waStatus.lastError}</span>}
              </p>
            )}
          </div>

          {/* Direct WhatsApp & Messenger Links */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#004791]" />
              <span>Direct Customer Connect Links</span>
            </h3>

            {/* WhatsApp Direct Link */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Official WhatsApp Direct Link</span>
                <button
                  onClick={() => copyToClipboard('https://wa.me/8801787687254?text=Hello%20Yamaha%20BD', 'wa')}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedLink === 'wa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink === 'wa' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-[11px] text-gray-400 break-all block font-mono bg-[#0a0a0a] p-2 rounded border border-gray-800/60">
                https://wa.me/8801787687254?text=Hello%20Yamaha%20BD
              </code>
              <a
                href="https://wa.me/8801787687254?text=Hello%20Yamaha%20BD"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:underline"
              >
                <span>Test Open WhatsApp App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Messenger Direct Link */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400">Official Facebook Messenger Link</span>
                <button
                  onClick={() => copyToClipboard('https://m.me/yamaha.bd.official', 'fb')}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copiedLink === 'fb' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink === 'fb' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <code className="text-[11px] text-gray-400 break-all block font-mono bg-[#0a0a0a] p-2 rounded border border-gray-800/60">
                https://m.me/yamaha.bd.official
              </code>
            </div>
          </div>

          {/* Embed Snippet Generator */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Embed Chat Widget on Dealer Website</span>
              </h3>
              <button
                onClick={() => copyToClipboard(embedScriptCode, 'code')}
                className="text-xs bg-[#004791] hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              >
                {copiedLink === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'code' ? 'Copied Snippet' : 'Copy HTML'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Paste this HTML snippet into any Yamaha dealer website template to enable the floating YamBot chat widget.
            </p>

            <pre className="bg-[#111111] text-blue-300 text-[10px] p-3 rounded-xl border border-gray-800 font-mono overflow-x-auto whitespace-pre-wrap">
              {embedScriptCode}
            </pre>
          </div>

          {/* Automated Server WhatsApp Dispatch Live Logs */}
          <div className="bg-[#0a0a0a] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-white text-sm">Server Auto-Dispatched WhatsApp Leads</h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                {waLogs.length} Dispatches
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Real-time log of Email & WhatsApp dispatches to <strong className="text-white">Md. Mahadi Hassan (+8801787687254 / Mahadi.Nayem@aci-bd.com)</strong>, with honest delivery status per channel.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {waLogs.map((log: any) => (
                <div key={log.id} className="bg-[#111111] p-3 rounded-xl border border-gray-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400">{log.refCode} ({log.type})</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                        log.channel === 'EMAIL' ? 'bg-blue-950 text-blue-300 border-blue-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      }`}>{log.channel}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                        log.delivered ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-amber-950 text-amber-400 border-amber-500/40'
                      }`}>{log.delivered ? 'DELIVERED' : 'PENDING/LINK'}</span>
                      <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="text-gray-300 text-[11px]">
                    Customer: <strong className="text-white">{log.customerName}</strong> ({log.customerPhone}) → <span className="text-amber-300 font-mono">{log.target}</span>
                  </div>
                  <pre className="text-[10px] text-gray-400 font-mono bg-[#070707] p-2 rounded border border-gray-800 whitespace-pre-wrap leading-tight mt-1">
                    {log.messageText}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
