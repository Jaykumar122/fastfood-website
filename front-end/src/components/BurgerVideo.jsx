import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

const videoSource = "/videos/burger-exploded-view.mp4";

export default function BurgerVideo({ className = "" }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  if (error) return null;

  return (
    <div className={className}>
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
}
