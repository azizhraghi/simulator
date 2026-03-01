import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const API_URL = "/api/mistral/v1/chat/completions";
const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MODEL = "mistral-small-latest";

// Role suggestions shown as placeholder hints
const ROLE_EXAMPLES = [
  "Junior Frontend Developer", "Junior Product Manager", "Junior Data Analyst",
  "Junior Full Stack Developer", "Junior UI/UX Designer", "Junior Growth Marketer",
  "Junior DevOps Engineer", "Junior QA Tester", "Junior Mobile Developer",
  "Junior AI/ML Engineer", "Junior Cloud Architect", "Junior Technical Writer",
];

const DURATIONS = [
  { label: "Quick Demo", minutes: 15, desc: "5 tasks · 2 agents · light pressure" },
  { label: "Real Sprint", minutes: 30, desc: "8 tasks · 3 agents · real deadlines" },
  { label: "Full Week", minutes: 60, desc: "12 tasks · 4 agents · full chaos" },
];

const AGENTS = {
  manager: { name: "Sara K.", title: "Engineering Manager", avatar: "👩‍💼", color: "#7c3aed", channel: "direct" },
  techlead: { name: "Marcus T.", title: "Tech Lead", avatar: "👨‍💻", color: "#0ea5e9", channel: "engineering" },
  client: { name: "Nadia R.", title: "Client · Product Owner", avatar: "👩‍🔧", color: "#f59e0b", channel: "product" },
  intern: { name: "Leo B.", title: "Senior Intern", avatar: "🧑‍💼", color: "#10b981", channel: "general" },
};

const CHANNELS = ["# general", "# engineering", "# product", "@ Sara K.", "@ Marcus T."];

// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  const mistralMessages = [
    { role: "system", content: system },
    ...messages,
  ];
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1000, messages: mistralMessages }),
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0f;font-family:'IBM Plex Sans',sans-serif;color:#e2e8f0}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#2d2d3d;border-radius:2px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2);opacity:0}}
@keyframes notif{0%{transform:translateX(120%)}15%{transform:translateX(0)}85%{transform:translateX(0)}100%{transform:translateX(120%)}}
.fadeUp{animation:fadeUp .35s ease both}
.slideIn{animation:slideIn .3s ease both}
textarea,input{font-family:'IBM Plex Sans',sans-serif}
`;

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = "#7c3aed" }) => (
  <div style={{ width: size, height: size, border: `2px solid #2d2d3d`, borderTopColor: color, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
);

const Badge = ({ text, color = "#7c3aed" }) => (
  <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, fontFamily: "'IBM Plex Mono',monospace", fontSize: ".65rem", padding: "2px 8px", borderRadius: 4, letterSpacing: ".5px" }}>
    {text}
  </span>
);

// ─── LANDING / SETUP ──────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [roleText, setRoleText] = useState("");
  const [companyText, setCompanyText] = useState("");
  const [duration, setDuration] = useState(null);
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);

  const canStart = roleText.trim() && duration && name.trim() && !starting;

  const handleStart = async () => {
    setStarting(true);
    const role = {
      id: "custom",
      label: roleText.trim(),
      company: companyText.trim() || "Syntern Inc.",
      icon: "🚀",
      stack: "",
    };
    onStart({ name: name.trim(), role, duration });
  };

  // Rotate placeholder hints
  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHintIdx(i => (i + 1) % ROLE_EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "auto" }}>
      <style>{G}</style>
      {/* bg glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(124,58,237,.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 760 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }} className="fadeUp">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.25)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite", display: "inline-block" }} />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#a78bfa", letterSpacing: 1 }}>MULTI-AGENT SIMULATION</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(2.8rem,6vw,4.5rem)", letterSpacing: "-2px", lineHeight: 1, marginBottom: 16 }}>
            Syn<span style={{ color: "#7c3aed" }}>tern</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.7 }}>
            Your first job — before your first job.<br />
            <span style={{ color: "#94a3b8" }}>Real internship simulation powered by AI agents.</span>
          </p>
        </div>

        {/* Step 1: Name */}
        <div className="fadeUp" style={{ marginBottom: 24 }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2d", borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#7c3aed", letterSpacing: 2, marginBottom: 12 }}>YOUR NAME</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What should your team call you?"
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2d2d3d", borderRadius: 10, color: "#e2e8f0", fontSize: ".95rem", padding: "12px 16px", outline: "none" }}
            />
          </div>
        </div>

        {/* Step 2: Role (free text) */}
        <div className="fadeUp" style={{ marginBottom: 24 }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2d", borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#7c3aed", letterSpacing: 2, marginBottom: 12 }}>WHAT ROLE ARE YOU APPLYING FOR?</div>
            <input
              value={roleText}
              onChange={e => setRoleText(e.target.value)}
              placeholder={`e.g. ${ROLE_EXAMPLES[hintIdx]}`}
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2d2d3d", borderRadius: 10, color: "#e2e8f0", fontSize: ".95rem", padding: "12px 16px", outline: "none", marginBottom: 12 }}
            />
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#7c3aed", letterSpacing: 2, marginBottom: 12 }}>COMPANY NAME <span style={{ color: "#2d2d3d" }}>(OPTIONAL)</span></div>
            <input
              value={companyText}
              onChange={e => setCompanyText(e.target.value)}
              placeholder="Leave empty for a fictional startup"
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2d2d3d", borderRadius: 10, color: "#e2e8f0", fontSize: ".95rem", padding: "12px 16px", outline: "none" }}
            />
            {/* Quick suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {ROLE_EXAMPLES.slice(0, 6).map(r => (
                <button key={r} onClick={() => setRoleText(r)}
                  style={{ background: roleText === r ? "rgba(124,58,237,.2)" : "#0d0d14", border: `1px solid ${roleText === r ? "#7c3aed" : "#2d2d3d"}`, borderRadius: 100, color: roleText === r ? "#a78bfa" : "#475569", fontFamily: "'IBM Plex Mono',monospace", fontSize: ".65rem", padding: "5px 12px", cursor: "pointer", transition: "all .15s" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Duration */}
        <div className="fadeUp" style={{ marginBottom: 32 }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2d", borderRadius: 16, padding: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#7c3aed", letterSpacing: 2, marginBottom: 16 }}>SESSION LENGTH</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {DURATIONS.map(d => (
                <div key={d.label} onClick={() => setDuration(d)}
                  style={{ background: duration?.label === d.label ? "rgba(0,255,136,.08)" : "#0d0d14", border: `1px solid ${duration?.label === d.label ? "#00ff88" : "#2d2d3d"}`, borderRadius: 12, padding: 16, cursor: "pointer", transition: "all .2s", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: duration?.label === d.label ? "#00ff88" : "#e2e8f0", marginBottom: 4 }}>{d.minutes} min</div>
                  <div style={{ fontWeight: 600, fontSize: ".82rem", marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: ".72rem", color: "#475569" }}>{d.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start */}
        <div style={{ textAlign: "center" }}>
          <button
            disabled={!canStart}
            onClick={handleStart}
            style={{
              background: canStart ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#1e1e2d",
              border: "none", borderRadius: 14, color: canStart ? "#fff" : "#475569",
              fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: "1rem",
              padding: "16px 48px", cursor: canStart ? "pointer" : "not-allowed",
              transition: "all .2s", boxShadow: canStart ? "0 8px 32px rgba(124,58,237,.35)" : "none",
            }}>
            {starting ? "⏳ Preparing your workspace..." : "🚀 Start Your Internship"}
          </button>
          {canStart && !starting && (
            <div style={{ marginTop: 12, fontSize: ".8rem", color: "#475569" }}>
              You're joining <span style={{ color: "#a78bfa" }}>{companyText.trim() || "Syntern Inc."}</span> as a <span style={{ color: "#a78bfa" }}>{roleText.trim()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION TOAST ───────────────────────────────────────────────────────
function NotifToast({ notif }) {
  if (!notif) return null;
  const agent = AGENTS[notif.agent];
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: "#111118", border: `1px solid ${agent.color}55`,
      borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12,
      maxWidth: 320, boxShadow: `0 8px 32px rgba(0,0,0,.6)`,
      animation: "notif 4s ease forwards",
    }}>
      <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{agent.avatar}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: ".82rem", color: agent.color }}>{agent.name}</div>
        <div style={{ fontSize: ".8rem", color: "#94a3b8", marginTop: 2, lineHeight: 1.5 }}>{notif.preview}</div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: agent.color, flexShrink: 0, marginTop: 4, animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

// ─── MEETING POPUP ────────────────────────────────────────────────────────────
function MeetingPopup({ meeting, onJoin, onDecline }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div className="fadeUp" style={{ background: "#111118", border: "1px solid #2d2d3d", borderRadius: 20, padding: 36, maxWidth: 400, width: "90%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "rgba(239,68,68,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", margin: "0 auto 16px" }}>📅</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#ef4444", letterSpacing: 2, marginBottom: 8 }}>INCOMING MEETING</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>{meeting.title}</div>
        <div style={{ color: "#64748b", fontSize: ".85rem", marginBottom: 24 }}>Starting in 30 seconds · {meeting.duration} min · with {meeting.host}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onJoin} style={{ background: "#22c55e", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, padding: "11px 28px", cursor: "pointer" }}>Join Now</button>
          <button onClick={onDecline} style={{ background: "#1e1e2d", border: "1px solid #2d2d3d", borderRadius: 10, color: "#94a3b8", padding: "11px 28px", cursor: "pointer" }}>Decline</button>
        </div>
      </div>
    </div>
  );
}

// ─── GITHUB REPO HELPERS ─────────────────────────────────────────────────────────
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchGitHubRepo(repoUrl) {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  // Fetch repo info
  const repoRes = await fetch(apiBase);
  if (!repoRes.ok) throw new Error("Repo not found or is private");
  const repoInfo = await repoRes.json();

  // Fetch file tree (only default branch, first level + key files)
  const treeRes = await fetch(`${apiBase}/git/trees/${repoInfo.default_branch}?recursive=1`);
  const treeData = await treeRes.json();
  const files = (treeData.tree || []).filter(f => f.type === "blob").map(f => f.path);

  // Pick the most important files to review (max ~8 files, prioritize key ones)
  const priorityFiles = [
    "README.md", "readme.md", "package.json", "requirements.txt",
    "index.html", "index.js", "index.ts", "main.py", "app.py",
    "App.jsx", "App.tsx", "App.js",
  ];
  const srcFiles = files.filter(f => !f.includes("node_modules") && !f.includes(".lock") && !f.includes("dist/"));
  const toFetch = [
    ...srcFiles.filter(f => priorityFiles.some(p => f.endsWith(p))),
    ...srcFiles.filter(f => /\.(js|jsx|ts|tsx|py|html|css|java|go|rs|rb)$/.test(f) && !priorityFiles.some(p => f.endsWith(p))),
  ].slice(0, 8);

  // Fetch file contents
  const fileContents = {};
  for (const filePath of toFetch) {
    try {
      const fRes = await fetch(`${apiBase}/contents/${filePath}`);
      const fData = await fRes.json();
      if (fData.encoding === "base64" && fData.size < 50000) {
        fileContents[filePath] = atob(fData.content);
      }
    } catch { /* skip unreadable files */ }
  }

  return {
    name: repoInfo.name,
    description: repoInfo.description || "No description",
    language: repoInfo.language || "Unknown",
    stars: repoInfo.stargazers_count,
    fileTree: srcFiles.slice(0, 40),
    fileContents,
  };
}

async function reviewRepoCode(repoData, taskTitle, roleName) {
  const filesSummary = Object.entries(repoData.fileContents)
    .map(([path, content]) => `--- ${path} ---\n${content.slice(0, 3000)}`)
    .join("\n\n");

  const review = await callClaude(
    [{
      role: "user", content: `Review this intern's code submission for the task: "${taskTitle}"

Repo: ${repoData.name}
Language: ${repoData.language}
Description: ${repoData.description}

File tree:
${repoData.fileTree.join("\n")}

Key files:
${filesSummary}

Provide a Slack-style code review (keep it concise, 4-8 lines):
1. What they did well (1-2 points)
2. What needs improvement (1-3 specific issues with file names and line suggestions)
3. Verdict: "Approved ✅" or "Changes Requested 🔄"

Be specific, mention file names, be constructive. Act like a real tech lead doing a PR review.` }],
    `You are Marcus T., a direct and slightly terse Tech Lead reviewing an intern's (${roleName}) code submission. Keep it short, Slack-style. Be honest but constructive. Reference specific files and patterns you see.`
  );

  return review;
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, colColor, cols, colMeta, onUpdate, onSubmitRepo }) {
  const [expanded, setExpanded] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRepo = async (e) => {
    e.stopPropagation();
    if (!repoUrl.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitRepo(task, repoUrl.trim());
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: "#111118", border: `1px solid ${submitted ? "#0ea5e922" : "#1e1e2d"}`, borderRadius: 10, padding: 12, marginBottom: 8, cursor: "pointer", transition: "border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = colColor}
      onMouseLeave={e => e.currentTarget.style.borderColor = submitted ? "#0ea5e922" : "#1e1e2d"}
      onClick={() => setExpanded(!expanded)}>
      <div style={{ fontSize: ".8rem", fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Badge text={task.priority} color={task.priority === "HIGH" ? "#ef4444" : task.priority === "MED" ? "#f59e0b" : "#22c55e"} />
        {task.deadline && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#475569" }}>⏰ {task.deadline}</span>}
        {submitted && <Badge text="SUBMITTED" color="#0ea5e9" />}
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".58rem", color: "#2d2d3d", marginLeft: "auto" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && task.description && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d14", border: "1px solid #1e1e2d", borderRadius: 8 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#7c3aed", letterSpacing: 1.5, marginBottom: 6 }}>DETAILS</div>
          <pre style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".72rem", color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{task.description}</pre>
        </div>
      )}
      {/* Work submission — only for technical and non-technical, not action */}
      {expanded && task.status !== "done" && task.type !== "action" && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 10, padding: "10px 12px", background: "#0d0d14", border: "1px solid #1e1e2d", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: ".9rem" }}>🔗</span>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#0ea5e9", letterSpacing: 1.5 }}>
              {task.type === "non-technical" ? "SUBMIT WORK LINK" : "SUBMIT GITHUB REPO"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder={task.type === "non-technical" ? "https://docs.google.com/..." : "https://github.com/user/repo"}
              disabled={submitting || submitted}
              style={{ flex: 1, background: "#111118", border: "1px solid #2d2d3d", borderRadius: 6, color: "#e2e8f0", fontFamily: "'IBM Plex Mono',monospace", fontSize: ".72rem", padding: "6px 10px", outline: "none" }}
            />
            <button
              onClick={handleSubmitRepo}
              disabled={!repoUrl.trim() || submitting || submitted}
              style={{
                background: submitted ? "#0ea5e922" : submitting ? "#1e1e2d" : "#0ea5e9",
                border: submitted ? "1px solid #0ea5e955" : "none", borderRadius: 6,
                color: submitted ? "#0ea5e9" : "#fff", fontFamily: "'IBM Plex Mono',monospace",
                fontSize: ".65rem", padding: "6px 12px", cursor: submitting || submitted ? "default" : "pointer",
                letterSpacing: .5, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
              }}>
              {submitted ? "✅ Reviewed" : submitting ? <><Spinner size={10} color="#0ea5e9" /> Reviewing...</> : "🚀 Submit"}
            </button>
          </div>
          {submitted && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".62rem", color: "#475569", marginTop: 6 }}>
            {task.type === "non-technical" ? "Check #general for Sara's review" : "Check #engineering for Marcus's review"}
          </div>}
        </div>
      )}
      {task.status !== "done" && (
        <select
          value={task.status}
          onClick={e => e.stopPropagation()}
          onChange={e => onUpdate(task.id, e.target.value)}
          style={{ marginTop: 10, width: "100%", background: "#0d0d14", border: "1px solid #2d2d3d", borderRadius: 6, color: "#94a3b8", fontSize: ".7rem", padding: "4px 8px", cursor: "pointer", outline: "none" }}>
          {cols.map(c => <option key={c} value={c} style={{ background: "#111118" }}>{colMeta[c].label}</option>)}
        </select>
      )}
    </div>
  );
}

// ─── TASK BOARD ───────────────────────────────────────────────────────────────
function TaskBoard({ tasks, onUpdate, onSubmitRepo, onRequestMore, generatingMore }) {
  const cols = ["todo", "in_progress", "review", "done"];
  const colMeta = {
    todo: { label: "To Do", color: "#475569" },
    in_progress: { label: "In Progress", color: "#f59e0b" },
    review: { label: "In Review", color: "#7c3aed" },
    done: { label: "Done", color: "#22c55e" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: 16, height: "100%", overflowY: "auto" }}>
      {cols.map(col => (
        <div key={col}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colMeta[col].color }} />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#64748b", letterSpacing: 1 }}>{colMeta[col].label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#2d2d3d", marginLeft: "auto" }}>{tasks.filter(t => t.status === col).length}</span>
          </div>
          {tasks.filter(t => t.status === col).map(task => (
            <TaskCard key={task.id} task={task} colColor={colMeta[col].color} cols={cols} colMeta={colMeta} onUpdate={onUpdate} onSubmitRepo={onSubmitRepo} />
          ))}
        </div>
      ))}

      {/* Request More Tasks Button (shows when all tasks are done) */}
      {tasks.length > 0 && tasks.every(t => t.status === "done") && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: 24, padding: 24, background: "rgba(0,255,136,.05)", border: "1px dashed rgba(0,255,136,.2)", borderRadius: 12 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Board Cleared!</div>
          <div style={{ color: "#94a3b8", fontSize: ".85rem", marginBottom: 16 }}>You finished all your tasks. Ready for the next challenge?</div>
          <button
            onClick={onRequestMore}
            disabled={generatingMore}
            style={{
              background: generatingMore ? "#1e1e2d" : "linear-gradient(135deg, #00ff88, #0ea5e9)",
              border: "none", borderRadius: 8, color: generatingMore ? "#94a3b8" : "#0a0a0f",
              fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: ".9rem",
              padding: "10px 24px", cursor: generatingMore ? "default" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 8
            }}>
            {generatingMore ? <><Spinner size={14} color="#0ea5e9" /> Generating tasks...</> : "🚀 Request More Tasks"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DOCS PANEL ───────────────────────────────────────────────────────────────
function DocsPanel({ docs: dynamicDocs, loadingDocs }) {
  const docs = dynamicDocs && dynamicDocs.length > 0 ? dynamicDocs : [
    { title: "⏳ Loading...", content: "Your team documentation is being prepared by the AI agents..." },
  ];

  const [active, setActive] = useState(0);

  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      <div style={{ width: 160, borderRight: "1px solid #1e1e2d", padding: 12, overflowY: "auto", flexShrink: 0 }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".63rem", color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>DOCS</div>
        {docs.map((d, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: ".78rem", color: active === i ? "#e2e8f0" : "#64748b", background: active === i ? "#1e1e2d" : "transparent", marginBottom: 2, transition: "all .15s" }}>
            {d.title.split(" ").slice(0, 3).join(" ")}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 16, color: "#e2e8f0" }}>{docs[active].title}</div>
        <pre style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".78rem", color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{docs[active].content}</pre>
      </div>
    </div>
  );
}

// ─── EVALUATION REPORT ────────────────────────────────────────────────────────
function EvalReport({ data, session, onRestart }) {
  const metrics = [
    { label: "Communication", key: "COMMUNICATION", color: "#7c3aed" },
    { label: "Prioritization", key: "PRIORITIZATION", color: "#00ff88" },
    { label: "Initiative", key: "INITIATIVE", color: "#f59e0b" },
    { label: "Professionalism", key: "PROFESSIONALISM", color: "#0ea5e9" },
    { label: "Delivery", key: "DELIVERY", color: "#ef4444" },
  ];

  const extract = (key) => {
    const m = data.match(new RegExp(key + ":\\s*(\\d+)"));
    return parseInt(m?.[1] ?? "60");
  };

  const overall = metrics.reduce((acc, m) => acc + extract(m.key), 0) / metrics.length;

  const getVerdict = (score) => {
    if (score >= 80) return { label: "Hire Fast", color: "#00ff88", emoji: "🚀" };
    if (score >= 65) return { label: "Strong Candidate", color: "#f59e0b", emoji: "⭐" };
    if (score >= 50) return { label: "Needs Growth", color: "#f59e0b", emoji: "📈" };
    return { label: "Not Ready Yet", color: "#ef4444", emoji: "⚠️" };
  };

  const verdict = getVerdict(overall);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto" }}>
      <div style={{ maxWidth: 700, width: "100%" }} className="fadeUp">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-1px", marginBottom: 4 }}>
            Syn<span style={{ color: "#7c3aed" }}>tern</span> · Performance Report
          </div>
          <div style={{ color: "#475569", fontSize: ".82rem" }}>{session.role?.company} · {session.role?.label} · {new Date().toLocaleDateString()}</div>
        </div>

        {/* Verdict card */}
        <div style={{ background: `${verdict.color}11`, border: `1px solid ${verdict.color}33`, borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{verdict.emoji}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "3rem", color: verdict.color, marginBottom: 8 }}>{Math.round(overall)}</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".75rem", color: verdict.color, letterSpacing: 2 }}>{verdict.label.toUpperCase()}</div>
          <div style={{ color: "#64748b", fontSize: ".82rem", marginTop: 8 }}>Simulated as: <span style={{ color: "#94a3b8" }}>{session.name}</span> @ {session.role?.company}</div>
        </div>

        {/* Metric bars */}
        <div style={{ background: "#111118", border: "1px solid #1e1e2d", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#475569", letterSpacing: 2, marginBottom: 18 }}>BEHAVIORAL SCORES</div>
          {metrics.map(m => {
            const val = extract(m.key);
            return (
              <div key={m.key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>{m.label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".78rem", color: m.color, fontWeight: 600 }}>{val}/100</span>
                </div>
                <div style={{ background: "#1e1e2d", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: m.color, width: val + "%", transition: "width 1.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Feedback */}
        <div style={{ background: "#111118", border: "1px solid #1e1e2d", borderLeft: "3px solid #7c3aed", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#7c3aed", letterSpacing: 2, marginBottom: 14 }}>MANAGER'S NOTES</div>
          <div style={{ fontSize: ".85rem", color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{data}</div>
        </div>

        {/* Badge */}
        <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 16, padding: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, background: "rgba(124,58,237,.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>🏅</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 4 }}>Badge Earned: Remote Work Simulator</div>
            <div style={{ fontSize: ".78rem", color: "#64748b" }}>Add to your CV and LinkedIn · Verified by Syntern AI</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onRestart} style={{ background: "#7c3aed", border: "none", borderRadius: 12, color: "#fff", fontWeight: 600, padding: "14px 36px", cursor: "pointer", fontSize: ".9rem" }}>
            🔄 Try Another Role
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI CONTENT GENERATION ────────────────────────────────────────────────────
async function generateTasksForRole(roleName, companyName, durationMinutes, previousTasks = []) {
  try {
    const isFollowUp = previousTasks.length > 0;
    const prevContext = isFollowUp
      ? `The intern just completed these tasks:\n${previousTasks.map(t => `- ${t.title}`).join("\n")}\n\nGenerate 4-5 NEW follow-up tasks. Make sure they are a MIX of technical tasks, communication/collaboration tasks (e.g., messaging the team, reviewing a PR, writing an update), and documentation/planning tasks.`
      : `Generate 5-7 realistic internship tasks for a first-day intern. Include reading docs, introducing themselves, and early role-specific tasks.`;

    const result = await callClaude(
      [{
        role: "user", content: `Generate internship tasks for a "${roleName}" at a company called "${companyName}". Session is ${durationMinutes} minutes.

${prevContext}

Return ONLY a valid JSON array. Each task must have:
- "title": short task title (max 8 words)
- "description": detailed multi-line description of what exactly to do (2-4 lines, use \n for newlines)
- "priority": "HIGH" or "MED" or "LOW"
- "deadline": "Today" or "EOD" or a time like "10:00 AM"
- "type": "technical" (coding tasks needing a GitHub repo), "non-technical" (writing/docs needing a Google Docs or link), or "action" (tasks like reading docs, introducing yourself, attending meetings — no submission needed)
- "status": "todo"

Respond with ONLY the JSON array, no markdown, no explanation.` }],
      "You are a task generator for an internship simulator. Output ONLY valid JSON arrays. No markdown code blocks, no explanation."
    );
    const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Assign unique IDs
    return parsed.map((t, i) => ({ ...t, type: t.type || "technical", id: Date.now() + i }));
  } catch (e) {
    console.error("Failed to generate tasks:", e);
    const fallbackId = Date.now();
    return [
      { id: fallbackId, title: "Review advanced codebase", status: "todo", type: "technical", priority: "HIGH", deadline: "Today", description: `Review the deeper architecture for your role as ${roleName} at ${companyName}.` },
      { id: fallbackId + 1, title: "Read company handbook", status: "todo", type: "action", priority: "HIGH", deadline: "Today", description: "Go to the Docs panel and read the onboarding documents carefully." },
      { id: fallbackId + 2, title: "Draft technical proposal", status: "todo", type: "non-technical", priority: "MED", deadline: "Tomorrow", description: "Write a short proposal for the next big feature we should build." },
    ];
  }
}

async function generateDocsForRole(roleName, companyName) {
  try {
    const result = await callClaude(
      [{
        role: "user", content: `Generate 4 onboarding documents for a "${roleName}" intern at "${companyName}".

Return ONLY a valid JSON array with 4 objects. Each must have:
- "title": document title with an emoji prefix (e.g. "📋 Project Brief")
- "content": the full document text (multi-line, use \n for newlines). Each doc should be 8-15 lines.

The 4 docs should be:
1. Project Brief — company context, the intern's mission, stack/tools relevant to ${roleName}, expectations
2. Product Roadmap — current sprint goals, velocity, blockers (one assigned to the intern)
3. Guidelines — role-specific professional standards, workflows, quality expectations for a ${roleName}
4. Team Norms — communication rules, meeting cadence, red flags

Make them realistic, specific to the ${roleName} role, and slightly intimidating. Respond with ONLY the JSON array.`
      }],
      "You are a document generator for an internship simulator. Output ONLY valid JSON arrays. No markdown code blocks, no explanation."
    );
    const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to generate docs:", e);
    return [
      { title: "📋 Project Brief", content: `Welcome to ${companyName}!\n\nYour role: ${roleName}\n\nExpectations:\n- Daily async standups in #general\n- Update your tasks on the board\n- Flag blockers BEFORE deadline\n\nGood luck. We're watching. 👀` },
      { title: "🗺️ Product Roadmap", content: "Current Sprint:\nSprint 14 · Ends Friday\n\nBlockers:\n- Key deliverable (assigned: YOU)\n- Review pending\n- Backlog growing" },
      { title: "📐 Guidelines", content: "Standards:\n- Quality work expected\n- Follow team processes\n- Ask questions when blocked\n\nWhen Stuck:\n1. Check docs first\n2. Ask in #engineering\n3. DM Marcus only if urgent" },
      { title: "🤝 Team Norms", content: "Communication:\n- Slack response < 2h\n- Threads for long discussions\n\nRed Flags:\n❌ Going silent for > 3 hours\n❌ Missing standup without notice" },
    ];
  }
}

// ─── MAIN WORKSPACE ───────────────────────────────────────────────────────────
function Workspace({ session, onEnd }) {
  const [activePanel, setActivePanel] = useState("slack");
  const [activeChannel, setActiveChannel] = useState("# general");
  const [messages, setMessages] = useState({}); // channelId -> [{agent, text, time}]
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [contentReady, setContentReady] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [convoHistory, setConvoHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [timeLeft, setTimeLeft] = useState(session.duration.minutes * 60);
  const [agentLoading, setAgentLoading] = useState(false);
  const [escalationCount, setEscalationCount] = useState(0);
  const [evalData, setEvalData] = useState(null);
  const chatEndRef = useRef(null);
  const lastMessageTime = useRef(Date.now());
  const sessionRef = useRef(session);

  // ── channel helper ──
  const channelKey = (ch) => ch.replace(/[#@ ]/g, "_");

  const addMessage = useCallback((channel, agentKey, text) => {
    const key = channelKey(channel);
    const agent = AGENTS[agentKey];
    const msg = { agent: agentKey, name: agent.name, avatar: agent.avatar, color: agent.color, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
    setConvoHistory(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { role: "assistant", content: `[${agent.name}]: ${text}` }],
    }));
    // Show notif if not in that channel
    setNotif({ agent: agentKey, preview: text.slice(0, 70) + (text.length > 70 ? "..." : "") });
    setTimeout(() => setNotif(null), 4200);
  }, []);

  // ── Timer ──
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleEndSession(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Generate AI content + initial agent messages ──
  useEffect(() => {
    const init = async () => {
      // Generate tasks and docs in parallel
      const [generatedTasks, generatedDocs] = await Promise.all([
        generateTasksForRole(session.role.label, session.role.company, session.duration.minutes),
        generateDocsForRole(session.role.label, session.role.company),
      ]);
      setTasks(generatedTasks);
      setDocs(generatedDocs);
      setContentReady(true);

      await new Promise(r => setTimeout(r, 800));
      addMessage("# general", "manager",
        `Hey ${session.name}! 👋 Welcome to ${session.role.company}! Super excited to have you join the team as our new ${session.role.label}. I'm Sara, your manager. Drop a quick intro here when you get a chance — the team would love to meet you!`);

      await new Promise(r => setTimeout(r, 2800));
      addMessage("# engineering", "techlead",
        `Hey ${session.name}, Marcus here. I'm the tech lead. Check the docs panel — there's a project brief and guidelines tailored to your role. Start by reading those, then ping me in this channel when you're set up. We have a standup in ~15 mins.`);

      // Schedule meeting popup
      await new Promise(r => setTimeout(r, 18000));
      setMeeting({ title: "Team Standup", duration: 5, host: "Sara K." });
    };
    init();
  }, []);

  // ── Escalation system ──
  useEffect(() => {
    const checkEscalation = setInterval(() => {
      const silence = (Date.now() - lastMessageTime.current) / 1000;
      if (silence > 90 && escalationCount < 3) {
        const agents = ["manager", "techlead", "client"];
        const escalations = [
          [agents[0], "# general", `${session.name}, haven't heard from you in a bit — everything okay? Just checking in 👀`],
          [agents[1], "# engineering", `${session.name} — are you blocked? Please update your task status on the board. Deadline is approaching.`],
          [agents[2], "# product", `Hi ${session.name}, the client is asking for an ETA on the sprint items. Can you give me a status update ASAP?`],
        ];
        const esc = escalations[escalationCount];
        addMessage(esc[1], esc[0], esc[2]);
        setEscalationCount(c => c + 1);
      }
    }, 15000);
    return () => clearInterval(checkEscalation);
  }, [escalationCount]);

  // ── Scroll to bottom ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannel]);

  // ── Send message ──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    lastMessageTime.current = Date.now();

    const key = channelKey(activeChannel);
    const userMsg = { agent: "user", name: session.name, avatar: "🧑‍💻", color: "#00ff88", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [key]: [...(prev[key] || []), userMsg] }));

    const history = convoHistory[key] || [];
    const newHistory = [...history, { role: "user", content: text }];
    setConvoHistory(prev => ({ ...prev, [key]: newHistory }));

    // Determine which agent should respond
    const agentForChannel = {
      "_#_general": "manager",
      "_#_engineering": "techlead",
      "_#_product": "client",
      "__@_Sara_K_": "manager",
      "__@_Marcus_T_": "techlead",
    };
    const respondingAgent = agentForChannel[key] || "manager";
    const agent = AGENTS[respondingAgent];

    const systemPrompts = {
      manager: `You are Sara K., Engineering Manager at ${session.role.company}. The intern's name is ${session.name}, working as a ${session.role.label}. Be professional but warm. Sometimes send unclear requirements. Occasionally change priorities. React to their professionalism, urgency, and clarity. Keep messages SHORT (1-3 sentences) like real Slack. Don't be robotic.`,
      techlead: `You are Marcus T., Tech Lead at ${session.role.company}. The intern is ${session.name}, a ${session.role.label}. Be direct, slightly terse. Say "it's in the docs" sometimes. Respond slow (hint at async culture). Short Slack-style replies only. Push them to be self-sufficient first.`,
      client: `You are Nadia R., the client / product owner. You care about business impact, not tech. You're slightly impatient. Ask for updates. Get nervous about deadlines. Keep messages businesslike, short, slightly pressured.`,
      intern: `You are Leo B., a senior intern. Friendly but sometimes passive-aggressive. Give occasional hints. Keep it very casual and short.`,
    };

    setAgentLoading(true);
    try {
      const reply = await callClaude(newHistory, systemPrompts[respondingAgent]);
      addMessage(activeChannel, respondingAgent, reply);
      setConvoHistory(prev => ({ ...prev, [key]: [...newHistory, { role: "assistant", content: `[${agent.name}]: ${reply}` }] }));
    } catch (e) {
      addMessage(activeChannel, respondingAgent, "Sorry, connection issue. Try again.");
    }
    setAgentLoading(false);
  };

  // ── Submit Work ──
  const handleSubmitWork = async (task, url) => {
    if (task.type === "non-technical") {
      try {
        addMessage("# general", "manager", "Checking your submission... give me a moment. 👀");
        setActivePanel("slack");
        setActiveChannel("# general");

        // Simulating manager review time
        await new Promise(r => setTimeout(r, 2000));

        addMessage("# general", "manager", `Looks good! Thanks for getting the **${task.title}** task done so quickly. Check your tasks board.`);
        setTasks(t => t.map(tk => tk.id === task.id ? { ...tk, status: "done" } : tk));
      } catch (err) {
        addMessage("# general", "manager", "Hmm, I couldn't access that link. Make sure the sharing settings are correct and try again!");
      }
      return;
    }

    // Technical flow
    try {
      addMessage("# engineering", "techlead", "Pulling up the repo... give me a sec 👀");
      setActivePanel("slack");
      setActiveChannel("# engineering");
      const repoData = await fetchGitHubRepo(url);
      const review = await reviewRepoCode(repoData, task.title, session.role.label);
      addMessage("# engineering", "techlead", "Code Review for: " + task.title + "\n\n" + review);
      setTasks(t => t.map(tk => tk.id === task.id ? { ...tk, status: "review" } : tk));
    } catch (err) {
      addMessage("# engineering", "techlead", "Couldn't access that repo. Make sure it's public and the URL is correct. Try again.");
    }
  };

  // ── Request more tasks ──
  const handleRequestMoreTasks = async () => {
    if (generatingMore) return;
    setGeneratingMore(true);
    addMessage("# engineering", "manager", `Nice work clearing the board, ${session.name}! Let me put together the next batch of tasks for you.`);
    setActivePanel("slack");
    setActiveChannel("# engineering");

    try {
      const newTasks = await generateTasksForRole(session.role.label, session.role.company, session.duration.minutes, tasks);
      setTasks(prev => [...prev, ...newTasks]);
      addMessage("# engineering", "manager", `Alright, the board is updated with your next priorities. Check the Tasks panel!`);
    } catch (e) {
      addMessage("# engineering", "manager", `Actually, looks like we're good for now! Take a breather.`);
    }
    setGeneratingMore(false);
  };

  // ── End session + evaluate ──
  const handleEndSession = async () => {
    setLoading(true);
    const allMsgs = Object.values(messages).flat().filter(m => m.agent === "user").map(m => m.text).join("\n");
    const completedTasks = tasks.filter(t => t.status === "done").length;

    try {
      const report = await callClaude(
        [{
          role: "user", content: `Evaluate this intern's performance during a remote internship simulation.

Intern: ${session.name} | Role: ${session.role.label} | Company: ${session.role.company}
Session Duration: ${session.duration.minutes} minutes
Tasks Completed: ${completedTasks}/${tasks.length}
Escalations Triggered: ${escalationCount}

Their messages during the simulation:
${allMsgs || "No messages sent."}

Rate on EXACT format:
COMMUNICATION: [0-100]
PRIORITIZATION: [0-100]
INITIATIVE: [0-100]
PROFESSIONALISM: [0-100]
DELIVERY: [0-100]

Then write 3-4 paragraphs of honest manager feedback:
- What they did well
- What they need to improve  
- Whether you'd recommend them for a real position
- One specific advice to take into their first real job

Be direct, constructive, and human. Not a robot.` }],
        "You are an experienced engineering manager evaluating an intern's performance. Be honest, specific, and helpful."
      );
      setEvalData(report);
    } catch (e) {
      setEvalData("COMMUNICATION: 65\nPRIORITIZATION: 60\nINITIATIVE: 55\nPROFESSIONALISM: 70\nDELIVERY: 60\n\nYou completed the simulation session. Review your behavioral patterns and keep practicing.");
    }
    setLoading(false);
  };

  if (evalData) return <EvalReport data={evalData} session={session} onRestart={onEnd} />;

  // Loading screen while AI generates content
  if (!contentReady) {
    return (
      <div style={{ height: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <style>{G}</style>
        <Spinner size={40} color="#7c3aed" />
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
          Preparing your workspace...
        </div>
        <div style={{ color: "#64748b", fontSize: ".85rem", textAlign: "center", lineHeight: 1.7 }}>
          AI agents are generating tasks and docs for your<br />
          <span style={{ color: "#a78bfa" }}>{session.role.label}</span> internship at <span style={{ color: "#a78bfa" }}>{session.role.company}</span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {Object.values(AGENTS).map(a => (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 6, background: "#111118", border: "1px solid #1e1e2d", borderRadius: 100, padding: "6px 14px" }}>
              <span>{a.avatar}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".68rem", color: "#475569" }}>{a.name.split(" ")[0]}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, animation: "pulse 1.5s infinite" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeColor = timeLeft < 120 ? "#ef4444" : timeLeft < 300 ? "#f59e0b" : "#00ff88";
  const currentMsgs = messages[channelKey(activeChannel)] || [];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0f", overflow: "hidden" }}>
      <style>{G}</style>
      {notif && <NotifToast notif={notif} />}
      {meeting && <MeetingPopup meeting={meeting} onJoin={() => { setMeeting(null); addMessage("# general", "manager", "Good to see you at standup! Quick update: sprint ends tomorrow. Please move your tasks to 'In Review' before EOD. Any blockers?"); }} onDecline={() => { setMeeting(null); addMessage("# general", "manager", "I noticed you missed standup. Please send an async update in this channel instead. It's important to keep the team in the loop."); }} />}

      {/* Top bar */}
      <div style={{ height: 44, background: "#0d0d14", borderBottom: "1px solid #1e1e2d", display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".95rem" }}>Syn<span style={{ color: "#7c3aed" }}>tern</span></div>
        <div style={{ width: 1, height: 20, background: "#1e1e2d" }} />
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".7rem", color: "#475569" }}>{session.role.company}</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".78rem", color: timeColor, background: `${timeColor}15`, border: `1px solid ${timeColor}33`, padding: "3px 10px", borderRadius: 6 }}>
            ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <button onClick={handleEndSession} disabled={loading} style={{ background: loading ? "#1e1e2d" : "#ef444422", border: "1px solid #ef444455", borderRadius: 8, color: "#ef4444", fontFamily: "'IBM Plex Mono',monospace", fontSize: ".65rem", padding: "5px 12px", cursor: "pointer", letterSpacing: 1 }}>
            {loading ? "EVALUATING..." : "END SESSION"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div style={{ width: 52, background: "#0d0d14", borderRight: "1px solid #1e1e2d", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
          {[
            { id: "slack", icon: "💬", label: "Messages" },
            { id: "tasks", icon: "📋", label: "Tasks" },
            { id: "docs", icon: "📄", label: "Docs" },
          ].map(p => (
            <button key={p.id} onClick={() => setActivePanel(p.id)} title={p.label}
              style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: activePanel === p.id ? "rgba(124,58,237,.25)" : "transparent", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}>
              {p.icon}
            </button>
          ))}
        </div>

        {/* Slack channel sidebar */}
        {activePanel === "slack" && (
          <div style={{ width: 180, background: "#0d0d14", borderRight: "1px solid #1e1e2d", padding: "12px 8px", flexShrink: 0, overflowY: "auto" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#2d2d3d", letterSpacing: 2, padding: "4px 8px", marginBottom: 6 }}>CHANNELS</div>
            {CHANNELS.map(ch => {
              const key = channelKey(ch);
              const unread = (messages[key] || []).filter(m => m.agent !== "user").length;
              return (
                <div key={ch} onClick={() => setActiveChannel(ch)}
                  style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: ".8rem", color: activeChannel === ch ? "#e2e8f0" : "#475569", background: activeChannel === ch ? "#1e1e2d" : "transparent", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .15s" }}>
                  <span>{ch}</span>
                  {unread > 0 && <span style={{ background: "#7c3aed", color: "#fff", borderRadius: 100, fontSize: ".6rem", padding: "1px 6px", fontFamily: "'IBM Plex Mono',monospace" }}>{unread}</span>}
                </div>
              );
            })}
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#2d2d3d", letterSpacing: 2, padding: "4px 8px", marginTop: 12, marginBottom: 6 }}>TEAM</div>
            {Object.values(AGENTS).map(a => (
              <div key={a.name} style={{ padding: "7px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", color: "#475569" }}>
                <span>{a.avatar}</span>
                <div>
                  <div style={{ color: "#64748b", fontSize: ".75rem" }}>{a.name.split(" ")[0]}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#2d2d3d" }}>{a.title.split(" ")[0]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Panel header */}
          <div style={{ height: 44, borderBottom: "1px solid #1e1e2d", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, flexShrink: 0 }}>
            <span style={{ fontWeight: 600, fontSize: ".88rem" }}>
              {activePanel === "slack" ? activeChannel : activePanel === "tasks" ? "📋 Task Board" : "📄 Docs"}
            </span>
            {activePanel === "slack" && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".65rem", color: "#475569" }}>{currentMsgs.length} messages</span>}
            {activePanel === "tasks" && <Badge text={`${tasks.filter(t => t.status === "done").length}/${tasks.length} done`} color="#00ff88" />}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activePanel === "slack" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                  {currentMsgs.length === 0 && (
                    <div style={{ color: "#2d2d3d", fontSize: ".82rem", fontFamily: "'IBM Plex Mono',monospace", padding: "20px 0" }}>No messages yet in {activeChannel}</div>
                  )}
                  {currentMsgs.map((m, i) => (
                    <div key={i} className="slideIn" style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-start" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: m.agent === "user" ? "rgba(0,255,136,.15)" : `${m.color}22`, border: `1px solid ${m.agent === "user" ? "rgba(0,255,136,.3)" : m.color + "44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                        {m.avatar}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: ".82rem", color: m.agent === "user" ? "#00ff88" : m.color }}>{m.name}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: ".6rem", color: "#2d2d3d" }}>{m.time}</span>
                        </div>
                        <div style={{ fontSize: ".85rem", color: "#94a3b8", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.text}</div>
                      </div>
                    </div>
                  ))}
                  {agentLoading && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1e1e2d", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#475569", animation: `pulse 1.2s ${i * .2}s infinite` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ borderTop: "1px solid #1e1e2d", padding: "12px 16px", display: "flex", gap: 10 }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Message ${activeChannel}...`}
                    style={{ flex: 1, background: "#111118", border: "1px solid #2d2d3d", borderRadius: 10, color: "#e2e8f0", fontSize: ".85rem", padding: "10px 14px", outline: "none", resize: "none", minHeight: 42, maxHeight: 120, fontFamily: "'IBM Plex Sans',sans-serif" }}
                  />
                  <button onClick={sendMessage} disabled={agentLoading}
                    style={{ background: "#7c3aed", border: "none", borderRadius: 10, color: "#fff", padding: "0 18px", cursor: "pointer", fontWeight: 600, fontSize: ".85rem", flexShrink: 0 }}>
                    {agentLoading ? <Spinner size={14} color="#fff" /> : "Send"}
                  </button>
                </div>
              </div>
            )}
            {activePanel === "tasks" && <TaskBoard tasks={tasks} onUpdate={(id, status) => setTasks(t => t.map(tk => tk.id === id ? { ...tk, status } : tk))} onSubmitRepo={handleSubmitWork} onRequestMore={handleRequestMoreTasks} generatingMore={generatingMore} />}
            {activePanel === "docs" && <DocsPanel docs={docs} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);

  if (!session) return <SetupScreen onStart={setSession} />;
  return <Workspace session={session} onEnd={() => setSession(null)} />;
}
