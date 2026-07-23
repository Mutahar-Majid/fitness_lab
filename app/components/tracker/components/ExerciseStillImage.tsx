"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface ExerciseStillImageProps {
  alt: string;
  className?: string;
  src: string;
}

const thumbnailSize = 180;

export function ExerciseStillImage({
  alt,
  className,
  src,
}: ExerciseStillImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    context?.clearRect(0, 0, thumbnailSize, thumbnailSize);

    let image: HTMLImageElement | undefined;
    let cancelled = false;

    const loadImage = () => {
      const nextImage = new Image();
      image = nextImage;
      nextImage.onload = () => {
        if (cancelled || !canvas || !context) {
          return;
        }

        const sourceSize = Math.min(
          nextImage.naturalWidth,
          nextImage.naturalHeight
        );
        const sourceX = (nextImage.naturalWidth - sourceSize) / 2;
        const sourceY = (nextImage.naturalHeight - sourceSize) / 2;

        context.clearRect(0, 0, thumbnailSize, thumbnailSize);
        context.drawImage(
          nextImage,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          thumbnailSize,
          thumbnailSize
        );
      };
      nextImage.decoding = "async";
      nextImage.src = src;
    };

    if (!canvas) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      loadImage();
      return () => {
        cancelled = true;
        if (image) {
          image.onload = null;
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        observer.disconnect();
        loadImage();
      },
      { rootMargin: "240px" }
    );
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (image) {
        image.onload = null;
      }
    };
  }, [src]);

  return (
    <canvas
      aria-label={alt}
      className={cn("h-full w-full bg-[var(--surface-rail)]", className)}
      height={thumbnailSize}
      ref={canvasRef}
      role="img"
      width={thumbnailSize}
    />
  );
}
