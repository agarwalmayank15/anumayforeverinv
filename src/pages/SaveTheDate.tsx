import { useEffect, useRef, useState, useCallback } from "react";

const EnvelopeImg = "/Envelope.jpg";
const envelopeVideoSrc = "/envelopevideo.mp4";
const logoVideoSrc = "/logovideo.mp4";

const C = {
  bride: "Anuvrinda",
  groom: "Mayank",
  hashtag: "#AnuMayForever",
  weddingDate: new Date("2026-07-06T00:00:00"),
  introLine1: "A little note from,",
  introLine2: "our hearts to yours ♥️",
  aboutLine1:
    "From one unexpected moment to a lifetime of choosing each other.",
  aboutLine2: "Now, with full hearts, we're getting ready for our forever.",
  anticipation: "The countdown begins here…",
  ringInstruction: "Drag the ring to her finger 💍",
  ringSuccess: "And that was the easiest yes. 💍",
  endLine: "See You All on 5th July ♥️",
};

/*
  SECTION INDEX:
  0 = landing
  1 = envelope video   (same blush bg, seamless)
  2 = about us
  3 = ring game
  4 = save the date
  5 = event calendar (currently disabled / commented out)
  6 = end slate (logo video here)
*/

const EVENT_SCHEDULE = [
  {
    date: "5th July 2026",
    shortLabel: "5",
    month: "July",
    venueSummary: "Royalton Hotel, Abids",
    mapLink: "https://maps.app.goo.gl/1gpUV6YcKUqC88Tu9",
    events: [
      { title: "Haldi", time: "10:30 AM" },
      { title: "Mehndi", time: "11:00 AM - 3:00 PM" },
      { title: "Bhaat", time: "12:00 PM" },
    ],
  },
  {
    date: "6th July 2026",
    shortLabel: "6",
    month: "July",
    venueSummary: "Siarra Retreat, Shamshabad",
    mapLink: "https://maps.app.goo.gl/hAfzLeserj9Ha1Hg8",
    events: [
      { title: "Baraat", time: "2:00 PM" },
      { title: "Varmala", time: "4:00 PM" },
      { title: "Pheras", time: "5:00 PM" },
      { title: "Reception", time: "8:00 PM" },
    ],
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}
const CONFETTI_COLORS = [
  "#EFDAD3",
  "#D9B8AE",
  "#C8A2A8",
  "#F5B8C4",
  "#FFD1DC",
  "#D8B36A",
  "#F7E6E6",
  "#E8C4D0",
];
function mkParticle(id: number): Particle {
  return {
    id,
    x: Math.random() * window.innerWidth,
    y: -20,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 9 + 4,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 5,
    opacity: 1,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  };
}
const randDigit = () => String(Math.floor(Math.random() * 10));

function TapCue({
  onClick,
  label = "Tap to continue",
}: {
  onClick?: () => void;
  label?: string;
}) {
  return (
    <div className="tap-cue" onClick={onClick}>
      <span className="tap-cue-text">{label}</span>
      <div className="tap-cue-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function SaveTheDate() {
  const [section, setSection] = useState(0);

  /* S1 envelope video */
  const [envVideoEnded, setEnvVideoEnded] = useState(false);
  const [envShowTap, setEnvShowTap] = useState(false);
  const handleEnvVideoEnd = useCallback(() => {
    setEnvVideoEnded(true);
    setTimeout(() => setEnvShowTap(true), 1400);
  }, []);

  /* Ring game */
  const RING_HALF = 26;
  const SNAP_RADIUS = 15;
  const getSnapOffset = () => {
    const isSmallPhone = window.innerHeight <= 740;
    return isSmallPhone ? { x: 3, y: 4 } : { x: 3, y: 1 };
  };
  const gameRef = useRef<HTMLDivElement>(null);
  const ringElemRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const ringCurrentPos = useRef({ x: 0, y: 0 });
  const snapCenter = useRef({ x: 0, y: 0 });
  const [ringInitialized, setRingInitialized] = useState(false);
  const [ringSnapped, setRingSnapped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Particle[]>([]);
  const [fingerGlow, setFingerGlow] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  /* Countdown */
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  /* Date reveal */
  const [dateDigits, setDateDigits] = useState([
    randDigit(),
    randDigit(),
    ".",
    randDigit(),
    randDigit(),
    ".",
    randDigit(),
    randDigit(),
    randDigit(),
    randDigit(),
  ]);
  const [dateRevealed, setDateRevealed] = useState(false);

  /* Events modal */
  const [openEventIdx, setOpenEventIdx] = useState<number | null>(null);

  /* Audio */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  /* Bokeh */
  const [bokeh] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 4,
      dur: 3.5 + Math.random() * 3,
    })),
  );

  /* ── Go home – full reset ── */
  const goHome = useCallback(() => {
    stopMusic();
    setMusicStarted(false);
    setSection(0);
    setEnvVideoEnded(false);
    setEnvShowTap(false);
    setRingInitialized(false);
    setRingSnapped(false);
    setShowSuccess(false);
    setFingerGlow(false);
    setConfettiParticles([]);
    setRsvpSubmitted(false);
    setDateRevealed(false);
    setDateDigits([
      randDigit(),
      randDigit(),
      ".",
      randDigit(),
      randDigit(),
      ".",
      randDigit(),
      randDigit(),
      randDigit(),
      randDigit(),
    ]);
    setOpenEventIdx(null);
  }, []);

  /* Init */
  useEffect(() => {
    audioRef.current = new Audio("/bgmusic.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0;
    const tick = () => {
      const diff = C.weddingDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  /* S1 timing reset + fallback */
  useEffect(() => {
    if (section === 1) {
      setEnvVideoEnded(false);
      setEnvShowTap(false);
      setEnvRevealText(false);

      if (envRevealTimerRef.current) {
        clearTimeout(envRevealTimerRef.current);
        envRevealTimerRef.current = null;
      }

      // Fallback: reveal text before video end
      const revealFallback = setTimeout(() => {
        setEnvRevealText(true);
      }, 7000); // show text around 2s before a 9s video

      // Fallback: if onEnded doesn't fire, finish section flow
      const endFallback = setTimeout(() => {
        setEnvVideoEnded(true);
        setTimeout(() => setEnvShowTap(true), 1400);
      }, 9000);

      return () => {
        clearTimeout(revealFallback);
        clearTimeout(endFallback);
        if (envRevealTimerRef.current) {
          clearTimeout(envRevealTimerRef.current);
          envRevealTimerRef.current = null;
        }
      };
    }
  }, [section]);

  /* Ring setup – section 3 */
  useEffect(() => {
    if (section === 3) {
      setRingInitialized(false);
      setRingSnapped(false);
      setFingerGlow(false);
      setShowSuccess(false);
      const t = setTimeout(() => {
        if (!gameRef.current) return;

        const r = gameRef.current.getBoundingClientRect();
        const isSmallPhone = window.innerHeight <= 740 || r.width <= 320;

        ringCurrentPos.current = {
          x: r.width * 0.5 - RING_HALF,
          y: r.height * 0.9 - RING_HALF,
        };

        snapCenter.current = isSmallPhone
          ? { x: r.width * 0.68, y: r.height * 0.67 }
          : { x: r.width * 0.68, y: r.height * 0.62 };

        setRingInitialized(true);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [section, RING_HALF]);

  useEffect(() => {
    if (ringInitialized && ringElemRef.current && !ringSnapped) {
      ringElemRef.current.style.left = ringCurrentPos.current.x + "px";
      ringElemRef.current.style.top = ringCurrentPos.current.y + "px";
    }
  }, [ringInitialized, ringSnapped]);

  /* Date reveal – section 4 */
  useEffect(() => {
    if (section === 4 && !dateRevealed) {
      const t = setTimeout(() => doDateReveal(), 1800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://tally.so") return;

      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (data?.event === "Tally.FormSubmitted") {
        console.log("RSVP submitted!");
        setRsvpSubmitted(true);
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  const doDateReveal = () => {
    if (dateRevealed) return;
    setDateRevealed(true);
    const FINAL = ["0", "6", ".", "0", "7", ".", "2", "0", "2", "6"];
    [0, 1, 3, 4, 6, 7, 8, 9].forEach((pos, idx) => {
      setTimeout(() => {
        let count = 0;
        const iv = setInterval(() => {
          count++;
          if (count < 14) {
            setDateDigits((p) => {
              const n = [...p];
              n[pos] = randDigit();
              return n;
            });
          } else {
            clearInterval(iv);
            setDateDigits((p) => {
              const n = [...p];
              n[pos] = FINAL[pos];
              return n;
            });
          }
        }, 55);
      }, idx * 300);
    });
  };

  /* Music */
  const startMusic = useCallback(() => {
    if (musicStarted || !audioRef.current) return;
    setMusicStarted(true);
    audioRef.current.play().catch(() => {});
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.42);
      if (audioRef.current) audioRef.current.volume = vol;
      if (vol >= 0.42) clearInterval(fade);
    }, 100);
  }, [musicStarted]);

  const stopMusic = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let vol = audio.volume;

    const fade = setInterval(() => {
      vol = Math.max(vol - 0.03, 0);
      audio.volume = vol;

      if (vol <= 0) {
        clearInterval(fade);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        setMusicStarted(false); // 🔴 CRITICAL
      }
    }, 50);
  }, []);

  /* Ring drag */
  const onRingPointerDown = (e: React.PointerEvent) => {
    if (ringSnapped || !ringElemRef.current) return;
    dragging.current = true;
    ringElemRef.current.style.animation = "none";
    ringElemRef.current.style.transition = "none";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onGamePointerMove = (e: React.PointerEvent) => {
    if (
      !dragging.current ||
      ringSnapped ||
      !gameRef.current ||
      !ringElemRef.current
    )
      return;
    const rect = gameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - RING_HALF;
    const y = e.clientY - rect.top - RING_HALF;
    ringCurrentPos.current = { x, y };
    ringElemRef.current.style.left = x + "px";
    ringElemRef.current.style.top = y + "px";
    if (
      Math.hypot(
        x + RING_HALF - snapCenter.current.x,
        y + RING_HALF - snapCenter.current.y,
      ) <= SNAP_RADIUS
    ) {
      doSnap();
    }
  };
  const onGamePointerUp = () => {
    dragging.current = false;
  };

  const doSnap = () => {
    if (ringSnapped) return;
    dragging.current = false;
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    const snapOffset = getSnapOffset();
    const sx = snapCenter.current.x - RING_HALF + snapOffset.x;
    const sy = snapCenter.current.y - RING_HALF + snapOffset.y;
    ringCurrentPos.current = { x: sx, y: sy };
    if (ringElemRef.current) {
      ringElemRef.current.style.transition =
        "left 0.22s cubic-bezier(0.34,1.56,0.64,1), top 0.22s cubic-bezier(0.34,1.56,0.64,1)";
      ringElemRef.current.style.left = sx + "px";
      ringElemRef.current.style.top = sy + "px";
    }
    setRingSnapped(true);
    setFingerGlow(true);
    setConfettiParticles(Array.from({ length: 80 }, (_, i) => mkParticle(i)));
    setTimeout(() => setConfettiParticles([]), 4200);
    setTimeout(() => setShowSuccess(true), 700);
    // No auto-advance – user taps the tap-cue instead
  };

  /* S1 early reveal */
  const [envRevealText, setEnvRevealText] = useState(false);
  const envRevealTimerRef = useRef<number | null>(null);

  const handleEnvLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;

      if (!video.duration || Number.isNaN(video.duration)) return;

      const revealAt = Math.max((video.duration - 2) * 1000, 0);

      if (envRevealTimerRef.current) {
        clearTimeout(envRevealTimerRef.current);
      }

      envRevealTimerRef.current = window.setTimeout(() => {
        setEnvRevealText(true);
      }, revealAt);
    },
    [],
  );

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="w-root">
      {section >= 2 &&
        bokeh.map((b) => (
          <div
            key={b.id}
            className="bokeh-dot"
            style={{
              left: b.x + "%",
              top: b.y + "%",
              width: b.size + "px",
              height: b.size + "px",
              animationDuration: b.dur + "s",
              animationDelay: b.delay + "s",
            }}
          />
        ))}

      {/* ════ S0 – LANDING ════ */}
      {section === 0 && (
        <div
          className="section landing-section"
          onClick={() => {
            startMusic();
            setSection(1);
          }}
        >
          <div className="landing-bg" />
          <div className="envelope-wrap fade-in-up">
            <img src={EnvelopeImg} alt="Invitation" className="envelope-img" />
          </div>
          <p className="tap-to-open">Tap to Open</p>
        </div>
      )}

      {/* ════ S1 – ENVELOPE VIDEO (seamless – same landing bg) ════ */}
      {section === 1 && (
        <div
          className="section landing-section"
          onClick={() => {
            if (envShowTap) setSection(2);
          }}
          style={{ cursor: envShowTap ? "pointer" : "default" }}
        >
          <div className="landing-bg" />

          <div
            className="envelope-wrap env-card"
            style={{
              filter:
                "drop-shadow(0 24px 60px rgba(94,62,62,0.2)) drop-shadow(0 6px 18px rgba(94,62,62,0.12))",
            }}
          >
            <video
              className={`env-card-video ${envVideoEnded ? "env-card-hidden" : ""}`}
              src={envelopeVideoSrc}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={handleEnvLoadedMetadata}
              onEnded={handleEnvVideoEnd}
            />

            {/* Text floats on top of the video – no white background */}
            <div
              className={`env-card-reveal ${
                envRevealText || envVideoEnded ? "env-card-reveal-visible" : ""
              }`}
            >
              <p className="env-reveal-line1">{C.introLine1}</p>
              <p className="env-reveal-line2">{C.introLine2}</p>
            </div>
          </div>

          {/* Tap cue pinned at bottom of the section */}
          {envShowTap && (
            <div className="section-tap-cue fade-in">
              <TapCue />
            </div>
          )}
        </div>
      )}

      {/* ════ S2 – ABOUT US ════ */}
      {section === 2 && (
        <div
          className="section about-section"
          onClick={() => setSection(3)}
          style={{ cursor: "pointer" }}
        >
          <div className="about-photo-card fade-in-up">
            <img src="/section2bg.jpg" alt="Couple" className="about-photo" />
          </div>
          <div className="about-text-block fade-in-up-d1">
            <p className="about-lines">
              {C.aboutLine1} {C.aboutLine2}
            </p>
            <p className="about-anticipation">{C.anticipation}</p>
          </div>
          {/* Pinned at bottom */}
          <div
            className="section-tap-cue fade-in-up-d2"
            style={{ animation: "fadeIn 0.7s 0.28s ease both" }}
          >
            <TapCue />
          </div>
        </div>
      )}

      {/* ════ S3 – RING GAME ════ */}
      {section === 3 && (
        <div
          className="section ring-section"
          onClick={showSuccess ? () => setSection(4) : undefined}
          style={{ cursor: showSuccess ? "pointer" : "default" }}
        >
          <div
            className={`ring-heading-wrap ${showSuccess ? "ring-heading-wrap-hidden" : ""}`}
          >
            <h2 className="ring-heading fade-in-up">
              But First, Help Mayank
              <br />
              Complete the Proposal
            </h2>
          </div>

          <div
            ref={gameRef}
            className="ring-photo-frame fade-in-up-d1"
            onPointerMove={onGamePointerMove}
            onPointerUp={onGamePointerUp}
            onPointerLeave={onGamePointerUp}
          >
            <img
              src="/proposalbg.jpg"
              alt="Proposal"
              className="ring-photo-img"
              draggable={false}
            />
            {ringInitialized && !ringSnapped && (
              <div
                className="ring-drop-target"
                style={{
                  left: snapCenter.current.x + "px",
                  top: snapCenter.current.y + "px",
                }}
              />
            )}
            {fingerGlow && (
              <div
                className="ring-finger-glow"
                style={{
                  left: snapCenter.current.x + "px",
                  top: snapCenter.current.y + "px",
                }}
              />
            )}
            {ringInitialized && (
              <div
                ref={ringElemRef}
                className={`draggable-ring ${ringSnapped ? "snapped" : "floating"}`}
                style={{
                  left: ringCurrentPos.current.x + "px",
                  top: ringCurrentPos.current.y + "px",
                }}
                onPointerDown={onRingPointerDown}
              >
                <img src="/ring.png" alt="Ring" draggable={false} />
              </div>
            )}
            <ConfettiCanvas particles={confettiParticles} />
          </div>

          {/* Stacked vertically below photo – instruction fades, success appears */}
          <div className="ring-below">
            <p
              className={`ring-instruction ${ringSnapped ? "elem-faded" : "fade-in-up-d2"}`}
            >
              {C.ringInstruction}
            </p>
            {showSuccess && (
              <p className="ring-success-text fade-in-up">{C.ringSuccess}</p>
            )}
          </div>

          {/* Bottom cue area: skip before success, tap-to-continue after success */}
          {!showSuccess ? (
            <div className="section-tap-cue fade-in">
              <button
                className="ring-skip-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSection(4);
                }}
                type="button"
              >
                Skip - I am in a hurry
              </button>
            </div>
          ) : (
            <div className="section-tap-cue fade-in">
              <TapCue label="Tap to continue" />
            </div>
          )}
        </div>
      )}

      {/* ════ S4 – SAVE THE DATE ════ */}
      {section === 4 && (
        <div
          className="section savedate-section"
          onClick={() => setSection(5)}
          style={{ cursor: "pointer" }}
        >
          <div className="savedate-inner fade-in-up">
            <div
              className="proposal-video-card"
              onClick={(e) => e.stopPropagation()}
            >
              <video autoPlay muted playsInline loop className="proposal-video">
                <source src="/proposalvideo.mov" type="video/mp4" />
              </video>
            </div>
            <h1 className="sd-names">
              {C.bride} ♥ {C.groom}
            </h1>
            <p className="sd-label">Save the Date</p>
            <div className="sd-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="sd-star">
                  ✦
                </span>
              ))}
            </div>
            <div className="sd-date-display">
              {dateDigits.map((d, i) => (
                <span key={i} className={d === "." ? "sd-dot" : "sd-digit"}>
                  {d}
                </span>
              ))}
            </div>
            <div className="sd-countdown">
              <CUnit v={timeLeft.days} l="Days" />
              <span className="cd-colon">:</span>
              <CUnit v={timeLeft.hours} l="Hrs" />
              <span className="cd-colon">:</span>
              <CUnit v={timeLeft.minutes} l="Min" />
              <span className="cd-colon">:</span>
              <CUnit v={timeLeft.seconds} l="Sec" />
            </div>
          </div>
          <div className="section-tap-cue">
            <TapCue label="Tap to Continue" />
          </div>
        </div>
      )}

      {/* ════ S5 – EVENTS ════ */}
      {section === 5 && (
        <div
          className="section events-section"
          onClick={() => {
            if (openEventIdx === null) setSection(6);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="events-inner fade-in-up">
            <p className="events-eyebrow">Save these dates</p>
            <h2 className="events-heading">
              {C.bride} & {C.groom}
            </h2>
            <p className="events-hashtag">{C.hashtag}</p>
            <div className="event-cards">
              {EVENT_SCHEDULE.map((ev, i) => (
                <button
                  key={i}
                  className="event-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenEventIdx(i);
                  }}
                >
                  <div className="event-card-date">
                    <span className="event-card-day">{ev.shortLabel}</span>
                    <span className="event-card-month">{ev.month}</span>
                  </div>
                  <div className="event-card-info">
                    <p className="event-card-venue">{ev.venueSummary}</p>
                    <p className="event-card-count">
                      {ev.events.length} events · Tap to view
                    </p>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="event-card-arrow"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Centered at bottom – no transform conflict */}
          <div
            className="section-tap-cue"
            onClick={(e) => {
              e.stopPropagation();
              setSection(6);
            }}
          >
            <TapCue label="Tap to continue" />
          </div>

          {openEventIdx !== null && (
            <EventModal
              ev={EVENT_SCHEDULE[openEventIdx]}
              onClose={() => setOpenEventIdx(null)}
            />
          )}
        </div>
      )}

      {/* ════ S6 – RSVP ════ */}
      {section === 6 && (
        <div className="section rsvp-section">

          {/* Header */}
          <div className="rsvp-header fade-in-up">
            <p className="rsvp-eyebrow">You're Invited</p>
            <h2 className="rsvp-heading">RSVP</h2>
            <p className="rsvp-subline">
              Kindly let us know you're coming & share your ID for hotel booking
            </p>
          </div>

          {/* Tally iframe embed */}
          <div className="rsvp-frame-wrap fade-in-up-d1">
            {!rsvpSubmitted ? (
              <iframe
                // ↓↓ REPLACE THIS URL with your actual Tally embed link ↓↓
                src="https://tally.so/embed/zxd821?hideTitle=1&transparentBackground=1&dynamicHeight=1"
                className="rsvp-iframe"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="RSVP Form"
                allow="camera; microphone"
              />
            ) : (
              // ── Thank-you card shown after Tally form submit ──
              <div className="rsvp-thankyou fade-in-up">
                <div className="rsvp-ty-icon">💌</div>
                <h3 className="rsvp-ty-heading">We got it!</h3>
                <p className="rsvp-ty-body">
                  Thank you for RSVPing. We can't wait to celebrate with you. ♥️
                </p>
                <button
                  className="rsvp-ty-btn"
                  onClick={() => setSection(7)}
                >
                  Final Note
                </button>
              </div>
            )}
          </div>

          {/* Bottom navigation – skip + post-submit continue */}
          <div className="section-tap-cue rsvp-bottom-cue">
            {!rsvpSubmitted ? (
              <button
                className="ring-skip-btn"
                onClick={() => setSection(7)}
                type="button"
              >
                Skip — I'll RSVP later
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* ════ S7 – END SLATE (was S6) ════ */}
      {section === 7 && (
        <div
          className="section end-section"
          onClick={goHome}
          style={{ cursor: "pointer" }}
        >
          <div className="end-inner fade-in-up">
            <div className="end-logo-wrap">
              <video
                className="end-logo-video"
                src={logoVideoSrc}
                autoPlay
                muted
                playsInline
                loop
              />
            </div>
            <h1 className="end-names">
              <span className="end-name">{C.bride}</span>
              <span className="end-amp">&</span>
              <span className="end-name">{C.groom}</span>
            </h1>
            <p className="end-date">5th - 6th July 2026</p>
            <span className="end-date">Hyderabad</span>
            <div className="end-divider">✦ &nbsp; ✦ &nbsp; ✦</div>
            <p className="end-line">{C.endLine}</p>
            <p className="end-hashtag">{C.hashtag}</p>
          </div>
          <div className="section-tap-cue">
            <TapCue label="Back to Home" />
          </div>
        </div>
      )}
    </div>
  );
}

/* Countdown unit */
function CUnit({ v, l }: { v: number; l: string }) {
  return (
    <div className="cd-unit">
      <div className="cd-num">{String(v).padStart(2, "0")}</div>
      <div className="cd-label">{l}</div>
    </div>
  );
}

/* Event modal */
function EventModal({
  ev,
  onClose,
}: {
  ev: (typeof EVENT_SCHEDULE)[0];
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-date-badge">{ev.date}</div>
        <h3 className="modal-venue">{ev.venueSummary}</h3>
        <a
          href={ev.mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="modal-map-link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
              fill="currentColor"
            />
          </svg>
          View on Maps
        </a>
        <div className="modal-events">
          {ev.events.map((e, i) => (
            <div key={i} className="modal-event-row">
              <span className="modal-event-title">{e.title}</span>
              <span className="modal-event-time">{e.time}</span>
            </div>
          ))}
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* Canvas confetti */
function ConfettiCanvas({ particles }: { particles: Particle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const parts = useRef<Particle[]>([]);
  useEffect(() => {
    parts.current = particles.map((p) => ({ ...p }));
    if (!parts.current.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.006;
      });
      parts.current = parts.current.filter((p) => p.opacity > 0);
      if (parts.current.length) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [particles]);
  if (!particles.length) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
