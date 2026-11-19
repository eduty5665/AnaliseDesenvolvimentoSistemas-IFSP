import {
  useEffect,
  useRef,
  type ReactNode,
  type VideoHTMLAttributes,
} from "react";
import "./HeaderVideo.css";

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
  imgSrc?: string;
  imgAlt?: string;
  title?: string;
  icon?: ReactNode;
  playbackRate?: number;
}

export function HeaderVideo({
  src,
  imgSrc,
  imgAlt = "",
  title,
  icon,
  playbackRate = 0.7,
  ...props
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, src, imgSrc]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const resumePlayback = () => {
      if (video.paused) {
        void video.play().catch(() => undefined);
      }
    };

    video.addEventListener("canplay", resumePlayback);
    video.addEventListener("stalled", resumePlayback);

    return () => {
      video.removeEventListener("canplay", resumePlayback);
      video.removeEventListener("stalled", resumePlayback);
    };
  }, [src, imgSrc]);

  const firstSpace = title?.indexOf(" ") ?? -1;
  const firstPart =
    firstSpace === -1 ? title : title?.slice(0, firstSpace);
  const secondPart =
    firstSpace === -1 ? "" : title?.slice(firstSpace + 1);

  return (
    <div className="headerVideo">
      {imgSrc ? (
        <img
          className="headerVideoMedia"
          src={imgSrc}
          alt={imgAlt}
        />
      ) : src ? (
        <video
          {...props}
          className={`headerVideoMedia ${props.className ?? ""}`}
          ref={videoRef}
          src={src}
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : null}

      {title && (
        <h1 className="splitTextContainer">
          <span className="textPart left">{firstPart}</span>

          <span className="textPart right">
            {icon}
            {secondPart}
          </span>
        </h1>
      )}
    </div>
  );
}