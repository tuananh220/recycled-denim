'use client';
import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface Props {
  src?: string;
  poster?: string;
  caption?: string;
  autoplay?: boolean;
}

export function TvcVideo({
  src = '/videos/tvc.mp4',
  poster = '/videos/tvc-poster.jpg',
  caption,
  autoplay = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(true);

  function toggle() {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }
  function toggleMute() {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }
  function fullscreen() {
    const v = videoRef.current as any; if (!v) return;
    (v.requestFullscreen || v.webkitEnterFullscreen)?.call(v);
  }

  return (
    <figure className="relative group bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={autoplay}
        preload="metadata"
        className="w-full aspect-video object-cover cursor-pointer"
        onClick={toggle}
      />

      {/* Center play button (visible when paused) */}
      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center bg-black/30 hover:bg-black/40 transition"
        >
          <span className="h-20 w-20 rounded-full bg-white/95 text-indigo-900 grid place-items-center group-hover:scale-110 transition">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Play/Pause" className="text-white hover:text-denim-rust transition">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={toggleMute} aria-label="Mute" className="text-white hover:text-denim-rust transition">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        <button onClick={fullscreen} aria-label="Fullscreen" className="text-white hover:text-denim-rust transition">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {caption && (
        <figcaption className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-white/80 bg-black/40 backdrop-blur px-2 py-1">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
