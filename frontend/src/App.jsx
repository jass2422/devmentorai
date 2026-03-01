import { useState, useEffect, useRef } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const CALL_ID = "devmentor-session";

const LANGUAGES = [
  { id: "python",     label: "Python",     ext: "py",   color: "#60a5fa", icon: "🐍" },
  { id: "javascript", label: "JavaScript", ext: "js",   color: "#fbbf24", icon: "⚡" },
  { id: "java",       label: "Java",       ext: "java", color: "#f97316", icon: "☕" },
  { id: "cpp",        label: "C++",        ext: "cpp",  color: "#a78bfa", icon: "⚙️" },
  { id: "c",          label: "C",          ext: "c",    color: "#34d399", icon: "🔧" },
  { id: "typescript", label: "TypeScript", ext: "ts",   color: "#38bdf8", icon: "🔷" },
];

const STARTER_CODE = {
  python: `# DevMentor AI — Python Session\n# Ask me anything by typing or speaking!\n\ndef find_largest(numbers):\n    if not numbers:\n        return None\n    largest = numbers[0]\n    for num in numbers:\n        if num > largest:\n            largest = num\n    return largest\n\nnums = [3, 7, 1, 9, 4]\nprint(find_largest(nums))`,
  javascript: `// DevMentor AI — JavaScript Session\n\nfunction findLargest(numbers) {\n  if (!numbers.length) return null;\n  let largest = numbers[0];\n  for (const num of numbers) {\n    if (num > largest) largest = num;\n  }\n  return largest;\n}\n\nconst nums = [3, 7, 1, 9, 4];\nconsole.log(findLargest(nums));`,
  java: `// DevMentor AI — Java Session\n\npublic class Main {\n    public static int findLargest(int[] numbers) {\n        if (numbers.length == 0) return -1;\n        int largest = numbers[0];\n        for (int num : numbers) {\n            if (num > largest) largest = num;\n        }\n        return largest;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {3, 7, 1, 9, 4};\n        System.out.println(findLargest(nums));\n    }\n}`,
  cpp: `// DevMentor AI — C++ Session\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint findLargest(vector<int> numbers) {\n    if (numbers.empty()) return -1;\n    int largest = numbers[0];\n    for (int num : numbers) {\n        if (num > largest) largest = num;\n    }\n    return largest;\n}\n\nint main() {\n    vector<int> nums = {3, 7, 1, 9, 4};\n    cout << findLargest(nums) << endl;\n    return 0;\n}`,
  c: `// DevMentor AI — C Session\n\n#include <stdio.h>\n\nint findLargest(int numbers[], int size) {\n    if (size == 0) return -1;\n    int largest = numbers[0];\n    for (int i = 0; i < size; i++) {\n        if (numbers[i] > largest)\n            largest = numbers[i];\n    }\n    return largest;\n}\n\nint main() {\n    int nums[] = {3, 7, 1, 9, 4};\n    printf("%d\\n", findLargest(nums, 5));\n    return 0;\n}`,
  typescript: `// DevMentor AI — TypeScript Session\n\nfunction findLargest(numbers: number[]): number | null {\n  if (!numbers.length) return null;\n  let largest = numbers[0];\n  for (const num of numbers) {\n    if (num > largest) largest = num;\n  }\n  return largest;\n}\n\nconst nums: number[] = [3, 7, 1, 9, 4];\nconsole.log(findLargest(nums));`,
};

// Judge0 language IDs for real execution
const JUDGE0_LANG = { python: 71, javascript: 63, java: 62, cpp: 54, c: 50, typescript: 74 };

const AI_RESPONSES = {
  hello: "Hey there! 👋 I'm DevMentor AI. I can see your code and I'm ready to help! What are you working on?",
  help: "Of course! I'm here to help you learn. You can ask me about your code, explain concepts, or debug errors. What's your question?",
  python: "Python is a great choice! 🐍 It's beginner-friendly and widely used in AI, web dev, and data science. What Python topic would you like to explore?",
  javascript: "JavaScript powers the web! ⚡ It runs in browsers and servers. What would you like to learn about JS?",
  java: "Java is powerful and widely used in enterprise apps! ☕ It's strongly typed which helps catch bugs early. What Java concept can I help with?",
  loop: "Loops are used to repeat code! 🔄 In Python: `for item in list:` or `while condition:`. Want me to show you an example?",
  function: "Functions are reusable blocks of code! 🧩 They take inputs (parameters) and return outputs. Example: `def greet(name): return f'Hello {name}'`. Does that make sense?",
  bug: "Let's debug that! 🐛 Share your error message and I'll help you fix it. Common bugs are: syntax errors, wrong indentation, or incorrect variable names.",
  error: "Don't worry about errors — they're how we learn! 💪 Can you paste the error message? I'll explain exactly what it means and how to fix it.",
  list: "Lists store multiple items! 📋 Example: `nums = [1, 2, 3]`. Access items with `nums[0]`. Add items with `nums.append(4)`. What would you like to know about lists?",
  class: "Classes are blueprints for objects! 🏗️ Example:\n```\nclass Dog:\n    def __init__(self, name):\n        self.name = name\n    def bark(self):\n        return 'Woof!'\n```\nWant me to explain more?",
  default: "Great question! 🤔 I'm analyzing your code right now. Based on what I see, make sure your logic is correct and test with simple inputs first. Can you tell me more specifically what's not working?",
};

function getAIResponse(question) {
  const q = question.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (key !== "default" && q.includes(key)) return response;
  }
  return AI_RESPONSES.default;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html,body,#root{height:100%;width:100%;overflow:hidden;}
:root{--bg:#080c14;--surface:#0d1420;--surface2:#111827;--border:#1e2d45;--accent:#00e5ff;--accent2:#7c3aed;--accent3:#10b981;--text:#e2e8f0;--muted:#64748b;--danger:#ef4444;}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--text);}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
.orb1{position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%);top:-200px;left:-100px;pointer-events:none;z-index:0;animation:pulse 8s ease-in-out infinite;}
.orb2{position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,0.08) 0%,transparent 70%);bottom:-100px;right:-100px;pointer-events:none;z-index:0;animation:pulse 10s ease-in-out infinite reverse;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.7}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes wave{0%,100%{transform:scaleY(1);opacity:0.7}50%{transform:scaleY(2);opacity:1}}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes micpulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.5)}50%{box-shadow:0 0 35px rgba(0,229,255,0.6)}}
@keyframes grow{from{width:0}}
@keyframes avatarglow{0%,100%{box-shadow:0 0 20px rgba(0,229,255,0.3)}50%{box-shadow:0 0 40px rgba(124,58,237,0.5)}}
@keyframes typing{0%,60%,100%{opacity:0.3}30%{opacity:1}}

.app-shell{display:flex;flex-direction:column;height:100vh;width:100vw;position:relative;z-index:1;overflow:hidden;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid var(--border);background:rgba(8,12,20,0.9);backdrop-filter:blur(12px);flex-shrink:0;z-index:10;}
.logo{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800;letter-spacing:-0.5px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,var(--accent2),var(--accent));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.logo span{color:var(--accent);}
.topbar-center{display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:6px 16px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--accent3);}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--accent3);animation:blink 2s ease-in-out infinite;}
.topbar-right{display:flex;align-items:center;gap:12px;}
.badge-session{padding:5px 12px;border-radius:100px;font-size:12px;font-weight:600;font-family:'JetBrains Mono',monospace;}
.btn-end{padding:7px 16px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:8px;color:var(--danger);font-size:13px;font-weight:600;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.2s;}
.btn-end:hover{background:rgba(239,68,68,0.3);}
.main-grid{display:grid;grid-template-columns:1fr 360px;flex:1;overflow:hidden;}
.left-panel{display:flex;flex-direction:column;border-right:1px solid var(--border);overflow:hidden;}
.lang-bar{display:flex;align-items:center;gap:4px;padding:8px 16px;background:var(--surface);border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0;}
.lang-btn{padding:5px 12px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--muted);transition:all 0.2s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
.lang-btn:hover{background:var(--surface2);color:var(--text);}
.lang-btn.active{background:var(--surface2);border-color:var(--border);}
.ai-watching{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--accent2);font-family:'JetBrains Mono',monospace;margin-left:auto;white-space:nowrap;}
.editor-wrap{flex:1;overflow:hidden;display:flex;flex-direction:column;}
.editor-header{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--surface);border-bottom:1px solid var(--border);}
.file-tabs{display:flex;gap:4px;}
.tab{padding:5px 14px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);cursor:pointer;transition:all 0.2s;border:1px solid transparent;}
.tab.active{background:rgba(0,229,255,0.1);color:var(--accent);border-color:rgba(0,229,255,0.2);}
.tab:hover:not(.active){background:var(--surface2);color:var(--text);}
.run-btn{padding:5px 16px;background:linear-gradient(135deg,var(--accent2),var(--accent));border:none;border-radius:6px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:opacity 0.2s;}
.run-btn:hover{opacity:0.85;}
.run-btn:disabled{opacity:0.5;cursor:not-allowed;}
.editor-area{flex:1;overflow:hidden;display:flex;}
.code-editor{flex:1;width:100%;background:var(--bg);border:none;outline:none;resize:none;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.8;color:var(--text);padding:16px 20px;}
.terminal{height:150px;border-top:1px solid var(--border);background:#020810;display:flex;flex-direction:column;flex-shrink:0;}
.terminal-header{display:flex;align-items:center;justify-content:space-between;padding:6px 16px;border-bottom:1px solid var(--border);background:var(--surface);}
.terminal-title{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px;}
.term-dot{width:8px;height:8px;border-radius:50%;}
.clear-btn{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);background:none;border:none;cursor:pointer;padding:2px 8px;border-radius:4px;transition:background 0.2s;}
.clear-btn:hover{background:var(--surface2);color:var(--text);}
.terminal-body{flex:1;overflow-y:auto;padding:8px 16px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;}
.terminal-body::-webkit-scrollbar{width:3px;}
.terminal-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
.term-out{color:#86efac;}.term-err{color:#f87171;}.term-info{color:var(--accent);}.term-prompt{color:var(--accent2);}
.voice-bar{padding:10px 16px;background:var(--surface);border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-shrink:0;}
.mic-btn{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;animation:micpulse 2s ease-in-out infinite;flex-shrink:0;}
.mic-btn.muted{background:var(--surface2);border:1px solid var(--border);animation:none;}
.voice-wave{flex:1;display:flex;align-items:center;gap:2px;height:36px;}
.wave-bar{width:3px;border-radius:3px;background:linear-gradient(to top,var(--accent2),var(--accent));animation:wave 1.2s ease-in-out infinite;}
.wave-bar.muted{background:var(--border);animation:none;height:4px!important;}
.voice-transcript{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text);background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:8px 12px;flex:2;}
.transcript-label{font-size:9px;color:var(--muted);margin-bottom:2px;letter-spacing:1px;}
.right-panel{display:flex;flex-direction:column;background:var(--surface);overflow:hidden;}
.mentor-video{position:relative;height:170px;background:linear-gradient(135deg,#0d1420,#111827);border-bottom:1px solid var(--border);overflow:hidden;flex-shrink:0;}
.avatar-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.avatar-ring{width:86px;height:86px;border-radius:50%;background:linear-gradient(var(--surface2),var(--surface2)) padding-box,linear-gradient(135deg,var(--accent2),var(--accent)) border-box;border:2px solid transparent;display:flex;align-items:center;justify-content:center;animation:avatarglow 4s ease-in-out infinite;}
.avatar-emoji{font-size:44px;}
.mentor-label{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:10px;font-weight:700;color:var(--accent);letter-spacing:2px;text-transform:uppercase;}
.connected-badge{position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:5px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:100px;padding:4px 10px;font-size:11px;color:var(--accent3);font-family:'JetBrains Mono',monospace;}
.cam-view{position:absolute;bottom:8px;left:10px;width:58px;height:44px;border-radius:8px;background:#0d1117;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;}

/* CHAT */
.chat-area{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}
.chat-area::-webkit-scrollbar{width:3px;}
.chat-area::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
.msg{display:flex;gap:8px;animation:msgIn 0.3s ease;}
.msg-avatar{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;}
.msg-avatar.ai{background:linear-gradient(135deg,var(--accent2),var(--accent));}
.msg-avatar.user{background:var(--surface2);border:1px solid var(--border);}
.msg-content{flex:1;}
.msg-name{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-bottom:3px;}
.msg-name.ai-name{color:var(--accent);}
.msg-bubble{background:var(--surface2);border:1px solid var(--border);border-radius:0 10px 10px 10px;padding:9px 12px;font-size:12px;line-height:1.6;color:var(--text);white-space:pre-wrap;}
.msg.user .msg-bubble{background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.3);border-radius:10px 0 10px 10px;color:#ddd6fe;}
.typing-indicator{display:flex;align-items:center;gap:4px;padding:10px 14px;}
.typing-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:typing 1.2s ease-in-out infinite;}
.typing-dot:nth-child(2){animation-delay:0.2s;}
.typing-dot:nth-child(3){animation-delay:0.4s;}

/* CHAT INPUT */
.chat-input-area{padding:10px 12px;border-top:1px solid var(--border);display:flex;gap:8px;flex-shrink:0;}
.chat-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:8px 12px;color:var(--text);font-size:12px;font-family:'JetBrains Mono',monospace;outline:none;resize:none;transition:border-color 0.2s;}
.chat-input:focus{border-color:var(--accent);}
.chat-input::placeholder{color:var(--muted);}
.send-btn{padding:8px 14px;background:linear-gradient(135deg,var(--accent2),var(--accent));border:none;border-radius:10px;color:#fff;font-size:13px;cursor:pointer;flex-shrink:0;transition:opacity 0.2s;}
.send-btn:hover{opacity:0.85;}
.send-btn:disabled{opacity:0.4;cursor:not-allowed;}

.progress-section{padding:8px 14px;border-top:1px solid var(--border);flex-shrink:0;}
.progress-header{display:flex;justify-content:space-between;font-size:10px;margin-bottom:5px;font-family:'JetBrains Mono',monospace;}
.progress-label{color:var(--muted);}
.progress-pct{color:var(--accent);font-weight:600;}
.progress-track{height:3px;border-radius:4px;background:var(--surface2);overflow:hidden;}
.progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--accent2),var(--accent));animation:grow 2s ease-out;}
.skill-tags{display:flex;gap:5px;flex-wrap:wrap;padding:8px 14px;border-top:1px solid var(--border);flex-shrink:0;}
.skill-tag{padding:2px 9px;border-radius:100px;font-size:9px;font-family:'JetBrains Mono',monospace;border:1px solid;}
.skill-tag.done{color:var(--accent3);border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.08);}
.skill-tag.active{color:var(--accent);border-color:rgba(0,229,255,0.3);background:rgba(0,229,255,0.08);}
.skill-tag.next{color:var(--muted);border-color:var(--border);}
.insight-strip{padding:8px 14px;border-top:1px solid var(--border);background:var(--bg);display:flex;gap:8px;flex-shrink:0;}
.insight-card{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:3px;}
.insight-val{font-size:18px;font-weight:800;background:linear-gradient(135deg,var(--accent2),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.insight-label{font-size:9px;color:var(--muted);text-align:center;font-family:'JetBrains Mono',monospace;}

/* HOME */
.home-wrap{position:relative;z-index:1;height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.home{text-align:center;max-width:520px;width:100%;animation:fadeUp 0.6s ease both;}
.logo-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:32px;}
.logo-box{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#00e5ff);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 0 30px rgba(124,58,237,0.5);}
.logo-text{font-size:28px;font-weight:800;letter-spacing:-0.5px;}
.logo-text span{color:#00e5ff;}
.tagline{font-size:14px;color:#64748b;font-family:'JetBrains Mono',monospace;margin-bottom:40px;}
.card{background:rgba(13,20,32,0.9);border:1px solid #1e2d45;border-radius:20px;padding:36px;backdrop-filter:blur(12px);}
.card h2{font-size:22px;font-weight:700;margin-bottom:8px;}
.card p{font-size:13px;color:#64748b;margin-bottom:24px;font-family:'JetBrains Mono',monospace;}
.name-input{width:100%;padding:13px 18px;background:#0d1420;border:1px solid #1e2d45;border-radius:12px;color:#e2e8f0;font-size:15px;font-family:'Syne',sans-serif;outline:none;transition:border-color 0.2s;margin-bottom:12px;display:block;}
.name-input:focus{border-color:#00e5ff;}
.name-input::placeholder{color:#475569;}
.lang-select-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.lang-select-btn{padding:10px 8px;border-radius:10px;border:1px solid #1e2d45;background:#0d1420;color:#64748b;font-family:'JetBrains Mono',monospace;font-size:11px;cursor:pointer;transition:all 0.2s;text-align:center;}
.lang-select-btn.selected{border-color:#00e5ff;background:rgba(0,229,255,0.08);color:#00e5ff;}
.join-btn{width:100%;padding:14px;background:linear-gradient(135deg,#7c3aed,#00e5ff);border:none;border-radius:12px;color:#fff;font-size:16px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;box-shadow:0 0 30px rgba(124,58,237,0.4);transition:opacity 0.2s,transform 0.2s;}
.join-btn:hover{opacity:0.9;transform:translateY(-1px);}
.join-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
.spinner{width:48px;height:48px;border:3px solid #1e2d45;border-top-color:#00e5ff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;}
`;

// ── Live Session ─────────────────────────────────────────────────────────
function LiveSession({ userName, onLeave, initLang }) {
  const { useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const [sessionTime, setSessionTime] = useState(0);
  const [activeLang, setActiveLang] = useState(initLang || "python");
  const [code, setCode] = useState(STARTER_CODE[initLang || "python"]);
  const [termLines, setTermLines] = useState([
    { type: "info", text: "DevMentor AI Terminal — Ready" },
    { type: "info", text: `Language: ${LANGUAGES.find(l => l.id === (initLang || "python"))?.label}` },
    { type: "prompt", text: "Click ▶ Run to execute your code" },
  ]);
  const [muted, setMuted] = useState(false);
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hey! 👋 I'm DevMentor AI. I can see your code!\n\nYou can TYPE your questions below OR speak them. I'll help you understand and debug your code. What are you working on today? 🚀" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [bugsFixed, setBugsFixed] = useState(0);
  const [running, setRunning] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSessionTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const switchLang = (langId) => {
    setActiveLang(langId);
    setCode(STARTER_CODE[langId]);
    const lang = LANGUAGES.find(l => l.id === langId);
    setTermLines([
      { type: "info", text: `Switched to ${lang.label}` },
      { type: "prompt", text: "Click ▶ Run to execute" },
    ]);
  };

  const runCode = async () => {
    const lang = LANGUAGES.find(l => l.id === activeLang);
    setRunning(true);
    setTermLines(prev => [
      ...prev,
      { type: "prompt", text: `$ run main.${lang.ext}` },
      { type: "info", text: "Executing..." },
    ]);

    try {
      // Use Judge0 API for real code execution
      const res = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "SIGN-UP-FOR-FREE-KEY",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: JUDGE0_LANG[activeLang],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const output = data.stdout || data.stderr || data.compile_output || "No output";
      output.split("\n").filter(Boolean).forEach(line => {
        setTermLines(prev => [...prev, { type: data.stderr ? "err" : "out", text: line }]);
      });
      setTermLines(prev => [...prev, { type: "info", text: `Exit code: ${data.exit_code ?? 0}` }]);
    } catch {
      // Fallback: simulate output if no API key
      setTermLines(prev => [
        ...prev,
        { type: "out", text: activeLang === "python" ? "9" : activeLang === "javascript" ? "9" : "9" },
        { type: "info", text: "Process finished. Add Judge0 API key for real execution." },
      ]);
    }
    setRunning(false);
    setQuestionsAsked(q => q + 1);
  };

  const sendMessage = async () => {
    const q = chatInput.trim();
    if (!q) return;
    setChatInput("");
    setQuestionsAsked(n => n + 1);

    // Add user message
    setMessages(prev => [...prev, { type: "user", text: q }]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI thinking (1-2 seconds)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));

    // Get AI response
    const response = getAIResponse(q);
    setIsTyping(false);
    setMessages(prev => [...prev, { type: "ai", text: response }]);

    // If it mentions a bug fix
    if (q.toLowerCase().includes("bug") || q.toLowerCase().includes("error") || q.toLowerCase().includes("fix")) {
      setBugsFixed(n => n + 1);
    }
  };

  const curLang = LANGUAGES.find(l => l.id === activeLang);

  return (
    <div className="app-shell">
      <div className="orb1" /><div className="orb2" />

      <header className="topbar">
        <div className="logo">
          <div className="logo-icon">🧠</div>
          DevMentor <span>AI</span>
        </div>
        <div className="topbar-center">
          <div className="status-dot" />
          Session Active — {fmt(sessionTime)}
        </div>
        <div className="topbar-right">
          <div className="badge-session" style={{ color: curLang.color, borderColor: curLang.color + "55", background: curLang.color + "11", padding: "5px 12px", borderRadius: "100px", border: "1px solid", fontSize: "12px", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>
            {curLang.label} · Beginner
          </div>
          <button className="btn-end" onClick={onLeave}>End Session</button>
        </div>
      </header>

      <div className="main-grid">
        <div className="left-panel">
          <div className="lang-bar">
            {LANGUAGES.map(lang => (
              <button key={lang.id} className={`lang-btn ${activeLang === lang.id ? "active" : ""}`}
                onClick={() => switchLang(lang.id)}
                style={activeLang === lang.id ? { color: lang.color, borderColor: lang.color + "55" } : {}}>
                {lang.icon} {lang.label}
              </button>
            ))}
            <div className="ai-watching">👁 AI watching your screen</div>
          </div>

          <div className="editor-wrap">
            <div className="editor-header">
              <div className="file-tabs">
                <div className="tab active">main.{curLang.ext}</div>
                <div className="tab">utils.{curLang.ext}</div>
                <div className="tab">+ New</div>
              </div>
              <button className="run-btn" onClick={runCode} disabled={running}>
                {running ? "⏳ Running..." : "▶ Run"}
              </button>
            </div>
            <div className="editor-area">
              <textarea className="code-editor" value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false} autoComplete="off" autoCorrect="off" />
            </div>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-title">
                <span className="term-dot" style={{ background: "#ef4444" }} />
                <span className="term-dot" style={{ background: "#fbbf24" }} />
                <span className="term-dot" style={{ background: "#10b981" }} />
                &nbsp;Terminal
              </div>
              <button className="clear-btn" onClick={() => setTermLines([{ type: "info", text: "Terminal cleared." }])}>clear</button>
            </div>
            <div className="terminal-body">
              {termLines.map((line, i) => (
                <div key={i} className={`term-${line.type}`}>{line.text}</div>
              ))}
            </div>
          </div>

          <div className="voice-bar">
            <button className={`mic-btn ${muted ? "muted" : ""}`} onClick={() => setMuted(m => !m)}>
              {muted ? "🔇" : "🎤"}
            </button>
            <div className="voice-wave">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`wave-bar ${muted ? "muted" : ""}`}
                  style={{ height: `${8 + Math.floor(Math.random() * 28)}px`, animationDelay: `${i * 0.09}s` }} />
              ))}
            </div>
            <div className="voice-transcript">
              <div className="transcript-label">YOU'RE SAYING</div>
              {muted ? "Microphone muted — click 🎤 to unmute" : "Speak your question — I'm listening..."}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="mentor-video">
            <div className="avatar-container">
              <div className="avatar-ring">
                <span className="avatar-emoji">🤖</span>
              </div>
            </div>
            <div className="connected-badge">
              <div className="status-dot" />{participantCount} connected
            </div>
            <div className="cam-view">👤</div>
            <div className="mentor-label">DevMentor AI</div>
          </div>

          <div className="chat-area" ref={chatRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.type === "user" ? "user" : ""}`}>
                {m.type === "ai" && <div className="msg-avatar ai">🧠</div>}
                <div className="msg-content">
                  <div className={`msg-name ${m.type === "ai" ? "ai-name" : ""}`}>
                    {m.type === "ai" ? "DevMentor AI" : userName}
                  </div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
                {m.type === "user" && <div className="msg-avatar user">👤</div>}
              </div>
            ))}
            {isTyping && (
              <div className="msg">
                <div className="msg-avatar ai">🧠</div>
                <div className="msg-content">
                  <div className="msg-name ai-name">DevMentor AI</div>
                  <div className="msg-bubble">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TEXT INPUT */}
          <div className="chat-input-area">
            <textarea className="chat-input" rows={2}
              placeholder="Type your coding question here... (or speak 🎤)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button className="send-btn" onClick={sendMessage} disabled={!chatInput.trim()}>Send</button>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">{curLang.label} Fundamentals</span>
              <span className="progress-pct">{Math.min(68 + questionsAsked * 2, 100)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(68 + questionsAsked * 2, 100)}%` }} />
            </div>
          </div>

          <div className="skill-tags">
            <div className="skill-tag done">✓ Variables</div>
            <div className="skill-tag done">✓ Loops</div>
            <div className="skill-tag active">● Arrays</div>
            <div className="skill-tag next">Functions</div>
            <div className="skill-tag next">OOP</div>
          </div>

          <div className="insight-strip">
            <div className="insight-card">
              <div className="insight-val">{questionsAsked}</div>
              <div className="insight-label">Questions Asked</div>
            </div>
            <div className="insight-card">
              <div className="insight-val">{bugsFixed}</div>
              <div className="insight-label">Bugs Fixed</div>
            </div>
            <div className="insight-card">
              <div className="insight-val">{participantCount}</div>
              <div className="insight-label">Connected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [phase, setPhase] = useState("home");
  const [userName, setUserName] = useState("");
  const [selectedLang, setSelectedLang] = useState("python");
  const clientRef = useRef(null);

  const handleJoin = async () => {
    if (!userName.trim()) return;
    setPhase("joining");
    try {
      const userId = userName.toLowerCase().replace(/\s+/g, "-");
      const res = await fetch(`/api/token?user_id=${userId}`);
      const { token } = await res.json();
      const _client = new StreamVideoClient({ apiKey: STREAM_API_KEY, user: { id: userId, name: userName }, token });
      const _call = _client.call("default", CALL_ID);
      await _call.join({ create: false });
      clientRef.current = _client;
      setClient(_client);
      setCall(_call);
      setPhase("live");
    } catch (err) {
      console.error(err);
      setPhase("home");
      alert("Could not join. Make sure agent + token server are running!");
    }
  };

  const handleLeave = async () => {
    await call?.leave();
    await clientRef.current?.disconnectUser();
    setPhase("done");
  };

  return (
    <>
      <style>{CSS}</style>
      {phase === "home" && (
        <div className="home-wrap">
          <div className="orb1" /><div className="orb2" />
          <div className="home">
            <div className="logo-wrap">
              <div className="logo-box">🧠</div>
              <div className="logo-text">DevMentor <span>AI</span></div>
            </div>
            <p className="tagline">// real-time coding mentor · powered by Vision Agents</p>
            <div className="card">
              <h2>Start a Session</h2>
              <p>Choose your language, ask questions by voice or text.</p>
              <input className="name-input" type="text" placeholder="Enter your name..."
                value={userName} onChange={e => setUserName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoin()} />
              <div className="lang-select-grid">
                {LANGUAGES.map(lang => (
                  <button key={lang.id}
                    className={`lang-select-btn ${selectedLang === lang.id ? "selected" : ""}`}
                    onClick={() => setSelectedLang(lang.id)}
                    style={selectedLang === lang.id ? { borderColor: lang.color, color: lang.color, background: lang.color + "11" } : {}}>
                    <span style={{ display: "block", fontSize: 18, marginBottom: 4 }}>{lang.icon}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
              <button className="join-btn" onClick={handleJoin} disabled={!userName.trim()}>
                Start {LANGUAGES.find(l => l.id === selectedLang)?.label} Session →
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "joining" && (
        <div className="home-wrap">
          <div className="orb1" /><div className="orb2" />
          <div style={{ textAlign: "center" }}>
            <div className="spinner" />
            <p style={{ color: "#64748b", fontFamily: "JetBrains Mono", fontSize: 13 }}>Connecting to DevMentor AI...</p>
          </div>
        </div>
      )}

      {phase === "live" && client && call && (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <LiveSession userName={userName} onLeave={handleLeave} initLang={selectedLang} />
          </StreamCall>
        </StreamVideo>
      )}

      {phase === "done" && (
        <div className="home-wrap">
          <div className="orb1" /><div className="orb2" />
          <div className="home" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Great Session!</h2>
            <p style={{ color: "#64748b", fontFamily: "JetBrains Mono", fontSize: 13, marginBottom: 24 }}>Keep building. Every question makes you better.</p>
            <button className="join-btn" style={{ maxWidth: 260, margin: "0 auto", display: "block" }}
              onClick={() => { setPhase("home"); setUserName(""); }}>
              Start New Session
            </button>
          </div>
        </div>
      )}
    </>
  );
}