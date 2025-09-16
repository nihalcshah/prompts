"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/toast";
import dynamic from "next/dynamic";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  promptId?: string;
  className?: string;
}

export default function ShareButton({
  title,
  description,
  url,
  promptId,
  className = "",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Generate the share URL
  const shareUrl = url || (typeof window !== 'undefined' ? `${window.location.origin}/prompt/${promptId}` : `/prompt/${promptId}`);
  const shareText = description || title;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!", "success");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showToast("Failed to copy link", "error");
    }
  };

  const shareViaWebAPI = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${title} - ${shareText}`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank");
    setIsOpen(false);
  };

  const shareViaLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(linkedInUrl, "_blank");
    setIsOpen(false);
  };

  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(facebookUrl, "_blank");
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
    window.open(emailUrl);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30 rounded-lg transition-all duration-200"
        title="Share this prompt"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-neutral-950 border border-neutral-700 rounded-lg shadow-xl z-[9999]">
          <div className="py-2">
            {/* Native Share API (if available) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <>
                <button
                  onClick={shareViaWebAPI}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share via System
                </button>
                <hr className="border-neutral-700 my-2" />
              </>
            )}

            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </button>

            <hr className="border-neutral-700 my-2" />

            {/* Social Media Options */}
            <button
              onClick={shareViaTwitter}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X (Twitter)
            </button>

            <button
              onClick={shareViaLinkedIn}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </button>

            <button
              onClick={shareViaFacebook}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Share via Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}