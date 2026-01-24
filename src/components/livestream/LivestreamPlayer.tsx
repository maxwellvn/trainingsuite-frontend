"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Video, ExternalLink, AlertCircle, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dynamically import ReactPlayer to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white/50" />
    </div>
  ),
}) as any;

export type StreamType = 
  | "youtube" 
  | "vimeo" 
  | "hls" 
  | "dash" 
  | "direct" 
  | "rtmp" 
  | "unknown";

interface LivestreamPlayerProps {
  url: string;
  title?: string;
  isLive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onReady?: () => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  className?: string;
  light?: boolean | string; // true for thumbnail, string for custom thumbnail URL
  pip?: boolean;
  playbackRate?: number;
}

/**
 * Detects the type of stream from the URL
 */
export function detectStreamType(url: string): StreamType {
  if (!url) return "unknown";
  
  const normalizedUrl = url.toLowerCase();
  
  // YouTube
  if (
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be") ||
    normalizedUrl.includes("youtube-nocookie.com")
  ) {
    return "youtube";
  }
  
  // Vimeo
  if (normalizedUrl.includes("vimeo.com")) {
    return "vimeo";
  }
  
  // HLS streams (.m3u8)
  if (normalizedUrl.includes(".m3u8") || normalizedUrl.includes("m3u8")) {
    return "hls";
  }
  
  // DASH streams (.mpd)
  if (normalizedUrl.includes(".mpd")) {
    return "dash";
  }
  
  // RTMP streams
  if (normalizedUrl.startsWith("rtmp://") || normalizedUrl.startsWith("rtmps://")) {
    return "rtmp";
  }
  
  // Direct video files
  if (
    normalizedUrl.endsWith(".mp4") ||
    normalizedUrl.endsWith(".webm") ||
    normalizedUrl.endsWith(".ogg") ||
    normalizedUrl.endsWith(".mov") ||
    normalizedUrl.includes(".mp4?") ||
    normalizedUrl.includes(".webm?")
  ) {
    return "direct";
  }
  
  // Check if it might be an HLS URL without extension (common for CDN URLs)
  if (normalizedUrl.includes("/hls/") || normalizedUrl.includes("/live/")) {
    return "hls";
  }
  
  // For any http/https URL that doesn't match above patterns, treat as direct
  // This handles PHP scripts, CDN URLs, and other dynamic video endpoints
  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
    return "direct";
  }
  
  return "unknown";
}

/**
 * Extracts video ID from YouTube URLs
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Extracts video ID from Vimeo URLs
 */
export function extractVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Universal Livestream Player Component
 * Supports YouTube, Vimeo, HLS (m3u8), DASH (mpd), and direct video URLs
 */
export function LivestreamPlayer({
  url,
  title,
  isLive = false,
  autoplay = false,
  muted = false,
  controls = true,
  onReady,
  onStart,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
  onDuration,
  className,
  light = false,
  pip = false,
  playbackRate = 1,
}: LivestreamPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamType, setStreamType] = useState<StreamType>("unknown");
  
  useEffect(() => {
    const type = detectStreamType(url);
    setStreamType(type);
    setError(null);
    setIsLoading(true);
    
    // Auto-hide loading after 5 seconds as fallback
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [url]);

  const handleReady = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback((err: unknown) => {
    console.error("Livestream player error:", err);
    setIsLoading(false);
    setError("Failed to load stream. Please check the URL or try again later.");
    onError?.(err);
  }, [onError]);

  // RTMP streams cannot be played directly in the browser
  // They need to be transcoded to HLS/DASH on a media server
  if (streamType === "rtmp") {
    return (
      <div className={cn("aspect-video bg-slate-900 rounded-lg flex items-center justify-center", className)}>
        <div className="text-center text-white p-6 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-medium mb-2">RTMP Stream Detected</h3>
          <p className="text-white/70 text-sm mb-4">
            RTMP streams cannot be played directly in the browser. 
            The stream needs to be converted to HLS format using a media server 
            (like nginx-rtmp, Wowza, or a cloud service).
          </p>
          <p className="text-white/50 text-xs">
            Stream URL: {url}
          </p>
        </div>
      </div>
    );
  }

  // Unknown stream type - show external link option
  if (streamType === "unknown") {
    return (
      <div className={cn("aspect-video bg-slate-900 rounded-lg flex items-center justify-center", className)}>
        <div className="text-center text-white">
          <Video className="h-16 w-16 mx-auto mb-4 text-white/50" />
          <p className="text-white/70 mb-4">Unsupported stream format</p>
          {url && (
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("aspect-video bg-slate-900 rounded-lg flex items-center justify-center", className)}>
        <div className="text-center text-white p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-white/70 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
            >
              Try Again
            </Button>
            {url && (
              <Button variant="outline" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Externally
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Configure player based on stream type (react-player v3 config)
  const getPlayerConfig = () => {
    return {
      youtube: {
        // YouTube player parameters
        controls: controls ? 1 : 0,
        modestbranding: 1 as const,
        rel: 0 as const,
        playsinline: 1 as const,
      },
      vimeo: {
        // Vimeo player parameters
        controls: controls,
        byline: false,
        portrait: false,
        title: false,
      },
      hls: {
        // HLS.js configuration for better live streaming
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 30 : 90,
        maxBufferLength: isLive ? 30 : 60,
        maxMaxBufferLength: isLive ? 60 : 600,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        // Recovery options
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
      },
    };
  };

  // For direct video URLs, use native HTML5 video element (more reliable)
  if (streamType === "direct") {
    return (
      <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden", className)}>
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-white/70">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Live indicator */}
        {isLive && !isLoading && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
        )}

        <video
          ref={playerRef}
          className="w-full h-full"
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          playsInline
          onLoadedMetadata={() => {
            setIsLoading(false);
            onReady?.();
          }}
          onPlay={() => {
            setIsLoading(false);
            onPlay?.();
          }}
          onPause={onPause}
          onEnded={onEnded}
          onError={(e) => {
            console.error("Video error:", e);
            handleError(e);
          }}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (onProgress && video.duration) {
              onProgress({
                played: video.currentTime / video.duration,
                playedSeconds: video.currentTime,
                loaded: video.buffered.length > 0 
                  ? video.buffered.end(video.buffered.length - 1) / video.duration 
                  : 0,
                loadedSeconds: video.buffered.length > 0 
                  ? video.buffered.end(video.buffered.length - 1) 
                  : 0,
              });
            }
          }}
          onDurationChange={(e) => {
            if (onDuration) {
              onDuration(e.currentTarget.duration);
            }
          }}
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // For YouTube, Vimeo, HLS - use ReactPlayer
  return (
    <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden", className)}>
      {/* Loading overlay - pointer-events-none so player is clickable underneath */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-white/70">Loading stream...</p>
          </div>
        </div>
      )}
      
      {/* Live indicator */}
      {isLive && !isLoading && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>
      )}
      
      <ReactPlayer
        src={url}
        width="100%"
        height="100%"
        playing={autoplay}
        muted={muted}
        controls={controls}
        pip={pip}
        playbackRate={playbackRate}
        light={light}
        config={{
          youtube: {
            playerVars: {
              controls: controls ? 1 : 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            },
          },
          vimeo: {
            playerOptions: {
              controls: controls,
              byline: false,
              portrait: false,
              title: false,
            },
          },
          hls: {
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
          },
        }}
        onReady={() => {
          setIsLoading(false);
          setError(null);
          onReady?.();
        }}
        onStart={() => {
          setIsLoading(false);
          onStart?.();
        }}
        onPlay={() => {
          setIsLoading(false);
          onPlay?.();
        }}
        onPause={onPause}
        onEnded={onEnded}
        onError={handleError}
        onProgress={onProgress}
        onDuration={onDuration}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default LivestreamPlayer;
