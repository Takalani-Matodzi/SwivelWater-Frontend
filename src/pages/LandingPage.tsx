import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getProducts, type Product } from "../services/api";

function LandingPage() {
  const navigate = useNavigate();

  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Hi! I'm Nono, the Swivel Water assistant. I can help you with products, ordering, delivery, collection, and general Swivel Water questions.",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);
  async function sendToNono(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || aiLoading) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setChatInput("");
    setAiLoading(true);

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api";

      const response = await fetch(`${apiBaseUrl}/Ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : (data?.message ?? "Nono could not respond."),
        );
      }

      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data.message ??
            "I'm sorry, I couldn't generate a response right now.",
        },
      ]);
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? `Sorry, I'm having trouble connecting right now. ${error.message}`
              : "Sorry, I'm having trouble connecting to Nono right now.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }
  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactSent(true);
  }

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            background: #03141f;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          button,
          input,
          textarea {
            font: inherit;
          }

          @keyframes splashLogo {
            0% {
              opacity: 0;
              transform: scale(0.82);
              filter: blur(8px)
                drop-shadow(
                  0 0 0 rgba(41, 199, 201, 0)
                );
            }

            45% {
              opacity: 1;
              transform: scale(1.04);
              filter: blur(0)
                drop-shadow(
                  0 20px 45px rgba(41, 199, 201, 0.28)
                );
            }

            100% {
              opacity: 1;
              transform: scale(1);
              filter: blur(0)
                drop-shadow(
                  0 20px 45px rgba(41, 199, 201, 0.22)
                );
            }
          }

          @keyframes splashGlow {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }

            100% {
              opacity: 0.8;
              transform: scale(1.15);
            }
          }

          @keyframes splashText {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }

            60% {
              opacity: 0;
              transform: translateY(15px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pageFadeIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes floatBottle {
            0% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-12px);
            }

            100% {
              transform: translateY(0);
            }
          }

          .swivel-splash {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            background:
              radial-gradient(
                circle at center,
                rgba(41, 199, 201, 0.12),
                transparent 42%
              ),
              linear-gradient(
                135deg,
                #03141f 0%,
                #053f50 48%,
                #118a8c 100%
              );

            transition:
              opacity 0.65s ease,
              visibility 0.65s ease;
          }

          .swivel-splash-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .swivel-splash-glow {
            position: absolute;
            width: 430px;
            height: 430px;
            border-radius: 50%;
            background: rgba(41, 199, 201, 0.15);
            filter: blur(45px);
            animation:
              splashGlow 2.1s ease-in-out forwards;
          }

          .swivel-splash-content {
            position: relative;
            z-index: 2;
            text-align: center;
            padding: 30px;
          }

          .swivel-splash-logo {
            width: min(500px, 82vw);
            height: auto;
            animation:
              splashLogo 1.8s ease-out forwards;
          }

          .swivel-splash-tagline {
            margin-top: 24px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.95rem;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            animation:
              splashText 1.8s ease-out forwards;
          }

          .swivel-page {
            min-height: 100vh;
            color: white;
            background:
              radial-gradient(
                circle at 15% 20%,
                rgba(41, 199, 201, 0.1),
                transparent 30%
              ),
              radial-gradient(
                circle at 85% 65%,
                rgba(0, 119, 190, 0.1),
                transparent 30%
              ),
              #03141f;

            animation:
              pageFadeIn 0.8s ease-out;
          }

          .swivel-container {
            width: min(
              1180px,
              calc(100% - 40px)
            );
            margin: 0 auto;
          }

          .swivel-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            border-bottom:
              1px solid rgba(255, 255, 255, 0.08);
            background:
              rgba(3, 20, 31, 0.78);
            backdrop-filter: blur(18px);
          }

          .swivel-nav-inner {
            min-height: 78px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .swivel-nav-logo {
            width: 145px;
            height: auto;
          }

          .swivel-nav-links {
            display: flex;
            align-items: center;
            gap: 26px;
          }

          .swivel-nav-links a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.92rem;
            transition: color 0.2s ease;
          }

          .swivel-nav-links a:hover {
            color: #29c7c9;
          }

          .swivel-nav-actions {
            display: flex;
            gap: 10px;
          }

          .swivel-btn {
            border: none;
            border-radius: 999px;
            padding: 12px 22px;
            cursor: pointer;
            font-weight: 700;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .swivel-btn:hover {
            transform: translateY(-2px);
          }

          .swivel-btn-primary {
            color: #03141f;
            background: #29c7c9;
            box-shadow:
              0 12px 30px rgba(41, 199, 201, 0.2);
          }

          .swivel-btn-secondary {
            color: white;
            background: rgba(255, 255, 255, 0.08);
            border:
              1px solid rgba(255, 255, 255, 0.2);
          }

          .swivel-hero {
            min-height: 100vh;
            padding-top: 150px;
            padding-bottom: 90px;
            display: flex;
            align-items: center;
          }

          .swivel-hero-grid {
            display: grid;
            grid-template-columns:
              1.05fr 0.95fr;
            align-items: center;
            gap: 70px;
          }

          .swivel-eyebrow {
            margin: 0 0 16px;
            color: #8deff0;
            font-size: 0.88rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .swivel-hero h1 {
            margin: 0;
            max-width: 720px;
            font-size:
              clamp(3rem, 7vw, 6rem);
            line-height: 0.98;
            letter-spacing: -0.05em;
          }

          .swivel-hero h1 span {
            color: #29c7c9;
          }

          .swivel-hero-text {
            margin-top: 24px;
            max-width: 650px;
            color: rgba(255, 255, 255, 0.76);
            font-size: 1.2rem;
            line-height: 1.8;
          }

          .swivel-hero-buttons {
            margin-top: 32px;
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
          }

          .swivel-hero-card {
            padding: 28px;
            border-radius: 34px;
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.1),
                rgba(255, 255, 255, 0.035)
              );
            border:
              1px solid rgba(255, 255, 255, 0.12);
            box-shadow:
              0 35px 90px rgba(0, 0, 0, 0.28);
            backdrop-filter: blur(18px);
            animation:
              floatBottle 5s ease-in-out infinite;
          }

          .swivel-hero-card img {
            width: 100%;
            max-height: 600px;
            object-fit: contain;
            display: block;
          }

          .swivel-hero-card-bottom {
            margin-top: 22px;
            padding-top: 18px;
            border-top:
              1px solid rgba(255, 255, 255, 0.1);
          }

          .swivel-small-label {
            color: #8deff0;
            font-size: 0.78rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            font-weight: 800;
          }

          .swivel-small-text {
            margin: 8px 0 0;
            color: rgba(255, 255, 255, 0.72);
            line-height: 1.6;
          }

          .swivel-highlight-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 18px;
            margin-top: 40px;
          }

          .swivel-highlight {
            padding: 20px;
            border-radius: 20px;
            background:
              rgba(255, 255, 255, 0.04);
            border:
              1px solid rgba(255, 255, 255, 0.09);
          }
.swivel-chat-messages {
  margin-top: 18px;
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  gap: 10px;
  padding-right: 3px;
}

.swivel-chat-message-user {
  color: #03141f;
  background: #29c7c9;
  margin-left: 28px;
}

.swivel-chat-input-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.swivel-chat-input-row input {
  flex: 1;
  min-width: 0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 13px;
  padding: 12px 13px;
  color: white;
  background: rgba(255,255,255,0.06);
  outline: none;
}

.swivel-chat-input-row input:focus {
  border-color: #29c7c9;
  box-shadow:
    0 0 0 3px rgba(41,199,201,0.1);
}

.swivel-chat-input-row button {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: none;
  border-radius: 13px;
  color: #03141f;
  background: #29c7c9;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
}

.swivel-chat-input-row button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.swivel-chat-suggestions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
          .swivel-highlight strong {
            display: block;
            color: #29c7c9;
            font-size: 1rem;
          }

          .swivel-highlight span {
            display: block;
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.82rem;
            line-height: 1.5;
          }

          .swivel-section {
            padding: 110px 0;
          }

          .swivel-section-heading {
            max-width: 780px;
            margin-bottom: 48px;
          }

          .swivel-section-heading p {
            margin: 0 0 10px;
            color: #8deff0;
            font-weight: 800;
            font-size: 0.8rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }

          .swivel-section-heading h2 {
            margin: 0;
            font-size:
              clamp(2.2rem, 5vw, 4rem);
            letter-spacing: -0.04em;
          }

          .swivel-section-heading div {
            margin-top: 16px;
            color: rgba(255, 255, 255, 0.68);
            line-height: 1.8;
            font-size: 1.05rem;
          }

          .swivel-services-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 18px;
          }

          .swivel-service-card {
            padding: 30px;
            border-radius: 26px;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            background:
              rgba(255, 255, 255, 0.045);
          }

          .swivel-service-card h3 {
            margin: 18px 0 10px;
          }

          .swivel-service-card p {
            margin: 0;
            color: rgba(255, 255, 255, 0.63);
            line-height: 1.75;
          }

          .swivel-service-icon {
            width: 56px;
            height: 56px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            color: #29c7c9;
            background:
              rgba(41, 199, 201, 0.12);
            font-size: 1.35rem;
          }

          .swivel-products-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 20px;
          }

          .swivel-product-card {
            overflow: hidden;
            border-radius: 28px;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            background:
              rgba(255, 255, 255, 0.045);
          }

          .swivel-product-visual {
            min-height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
              radial-gradient(
                circle at center,
                rgba(41, 199, 201, 0.12),
                transparent 68%
              );
          }

          .swivel-product-visual img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 18px;
          }

          .swivel-product-placeholder {
            width: 110px;
            height: 165px;
            border-radius: 24px;
            display: grid;
            place-items: center;
            background:
              linear-gradient(
                180deg,
                #ffffff,
                #d9f7f8
              );
            color: #053f50;
            font-weight: 900;
          }

          .swivel-product-info {
            padding: 24px;
          }

          .swivel-product-info h3 {
            margin: 0;
            font-size: 1.2rem;
          }

          .swivel-product-info p {
            margin: 10px 0 0;
            color: rgba(255, 255, 255, 0.62);
            line-height: 1.6;
          }

          .swivel-product-bottom {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
          }

          .swivel-product-price {
            color: #8deff0;
            font-size: 1.25rem;
            font-weight: 800;
          }

          .swivel-about-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 50px;
            align-items: center;
          }

          .swivel-about-image {
            overflow: hidden;
            border-radius: 32px;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            box-shadow:
              0 30px 80px rgba(0, 0, 0, 0.25);
          }

          .swivel-about-image img {
            width: 100%;
            display: block;
            height: 520px;
            object-fit: cover;
          }

          .swivel-about-panel {
            padding: 36px;
            border-radius: 30px;
            background:
              linear-gradient(
                145deg,
                rgba(41, 199, 201, 0.1),
                rgba(255, 255, 255, 0.035)
              );
            border:
              1px solid rgba(255, 255, 255, 0.1);
          }

          .swivel-about-panel h3 {
            margin: 0;
            font-size: 1.8rem;
          }

          .swivel-about-panel p {
            color: rgba(255, 255, 255, 0.66);
            line-height: 1.8;
          }

          .swivel-about-list {
            display: grid;
            gap: 12px;
            margin-top: 25px;
          }

          .swivel-about-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            color: rgba(255, 255, 255, 0.8);
          }

          .swivel-about-item strong {
            color: #29c7c9;
          }

          .swivel-gallery {
            display: grid;
            grid-template-columns:
              1.2fr 0.8fr;
            gap: 18px;
          }

          .swivel-gallery-main {
            min-height: 500px;
            overflow: hidden;
            border-radius: 30px;
          }

          .swivel-gallery-side {
            display: grid;
            gap: 18px;
          }

          .swivel-gallery-side div {
            min-height: 241px;
            overflow: hidden;
            border-radius: 24px;
          }

          .swivel-gallery img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          .swivel-gallery div:hover img {
            transform: scale(1.04);
          }

          .swivel-steps {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 18px;
          }

          .swivel-step {
            padding: 30px;
            border-radius: 26px;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            background:
              rgba(255, 255, 255, 0.04);
          }

          .swivel-step-number {
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background: #29c7c9;
            color: #03141f;
            font-weight: 900;
          }

          .swivel-step h3 {
            margin: 20px 0 10px;
          }

          .swivel-step p {
            margin: 0;
            color: rgba(255, 255, 255, 0.62);
            line-height: 1.7;
          }

          .swivel-contact {
            display: grid;
            grid-template-columns:
              0.9fr 1.1fr;
            gap: 28px;
          }

          .swivel-contact-copy,
          .swivel-contact-form {
            padding: 34px;
            border-radius: 28px;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            background:
              rgba(255, 255, 255, 0.04);
          }

          .swivel-contact-copy h3 {
            margin: 0;
            font-size: 2rem;
          }

          .swivel-contact-copy > p {
            color: rgba(255, 255, 255, 0.65);
            line-height: 1.8;
          }

          .swivel-contact-details {
            display: grid;
            gap: 14px;
            margin-top: 25px;
          }

          .swivel-contact-detail {
            padding: 16px;
            border-radius: 16px;
            background:
              rgba(255, 255, 255, 0.04);
          }

          .swivel-contact-detail small {
            display: block;
            color: #8deff0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.72rem;
            font-weight: 800;
          }

          .swivel-contact-detail a,
          .swivel-contact-detail span {
            display: block;
            margin-top: 5px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            line-height: 1.5;
          }

          .swivel-form-grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 14px;
          }

          .swivel-field {
            display: grid;
            gap: 8px;
          }

          .swivel-field-full {
            grid-column: 1 / -1;
          }

          .swivel-field label {
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.88rem;
            font-weight: 600;
          }

          .swivel-field input,
          .swivel-field textarea {
            width: 100%;
            border:
              1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            padding: 13px 14px;
            color: white;
            background:
              rgba(255, 255, 255, 0.05);
            outline: none;
          }

          .swivel-field textarea {
            min-height: 130px;
            resize: vertical;
          }

          .swivel-field input:focus,
          .swivel-field textarea:focus {
            border-color: #29c7c9;
            box-shadow:
              0 0 0 3px rgba(41, 199, 201, 0.1);
          }

          .swivel-success {
            margin-top: 18px;
            padding: 13px 15px;
            border-radius: 14px;
            background:
              rgba(41, 199, 201, 0.1);
            color: #8deff0;
          }

          .swivel-chat-button {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 1500;

            width: 62px;
            height: 62px;
            border-radius: 50%;
            border: none;

            display: grid;
            place-items: center;

            background:
              linear-gradient(
                145deg,
                #29c7c9,
                #118a8c
              );

            color: #03141f;
            font-size: 1.45rem;
            font-weight: 900;
            cursor: pointer;

            box-shadow:
              0 18px 45px rgba(0, 0, 0, 0.3);
          }

          .swivel-chat-panel {
            position: fixed;
            right: 24px;
            bottom: 100px;
            z-index: 1499;

            width: min(
              380px,
              calc(100vw - 32px)
            );

            padding: 22px;
            border-radius: 24px;

            border:
              1px solid rgba(255, 255, 255, 0.12);

            background:
              rgba(3, 20, 31, 0.95);

            backdrop-filter: blur(20px);

            box-shadow:
              0 30px 80px rgba(0, 0, 0, 0.4);
          }

          .swivel-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .swivel-chat-header strong {
            font-size: 1.05rem;
          }

          .swivel-chat-header span {
            color: #29c7c9;
            font-size: 0.75rem;
            font-weight: 700;
          }

          .swivel-chat-message {
            margin-top: 18px;
            padding: 15px;
            border-radius: 16px;
            background:
              rgba(41, 199, 201, 0.08);
            color: rgba(255, 255, 255, 0.76);
            line-height: 1.65;
          }

          .swivel-chat-suggestions {
            margin-top: 15px;
            display: grid;
            gap: 9px;
          }

          .swivel-chat-suggestions button {
            width: 100%;
            text-align: left;
            border:
              1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 11px 13px;
            color: rgba(255, 255, 255, 0.76);
            background:
              rgba(255, 255, 255, 0.04);
            cursor: pointer;
          }

          .swivel-chat-suggestions button:hover {
            border-color: #29c7c9;
          }

          .swivel-chat-note {
            margin-top: 15px;
            color: rgba(255, 255, 255, 0.42);
            font-size: 0.75rem;
            line-height: 1.5;
          }

          .swivel-footer {
            margin-top: 50px;
            border-top:
              1px solid rgba(255, 255, 255, 0.08);
          }

          .swivel-footer-inner {
            min-height: 110px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .swivel-footer img {
            width: 135px;
          }

          .swivel-footer p {
            margin: 0;
            color: rgba(255, 255, 255, 0.45);
            font-size: 0.82rem;
          }

          @media (max-width: 900px) {
            .swivel-nav-links {
              display: none;
            }

            .swivel-hero-grid,
            .swivel-about-grid,
            .swivel-contact {
              grid-template-columns: 1fr;
            }

            .swivel-services-grid,
            .swivel-products-grid,
            .swivel-steps {
              grid-template-columns: 1fr 1fr;
            }

            .swivel-highlight-grid {
              grid-template-columns: 1fr 1fr 1fr;
            }
          }

          @media (max-width: 600px) {
            .swivel-container {
              width: min(
                100% - 28px,
                1180px
              );
            }

            .swivel-nav-actions {
              display: none;
            }

            .swivel-hero {
              padding-top: 120px;
            }

            .swivel-services-grid,
            .swivel-products-grid,
            .swivel-steps,
            .swivel-form-grid,
            .swivel-highlight-grid {
              grid-template-columns: 1fr;
            }

            .swivel-field-full {
              grid-column: auto;
            }

            .swivel-gallery {
              grid-template-columns: 1fr;
            }

            .swivel-gallery-main {
              min-height: 320px;
            }

            .swivel-gallery-side {
              grid-template-columns: 1fr 1fr;
            }

            .swivel-gallery-side div {
              min-height: 180px;
            }

            .swivel-section {
              padding: 80px 0;
            }

            .swivel-contact-form,
            .swivel-contact-copy,
            .swivel-about-panel {
              padding: 24px;
            }

            .swivel-footer-inner {
              flex-direction: column;
              justify-content: center;
              padding: 25px 0;
              text-align: center;
            }
          }
        `}
      </style>

      {/* =====================================================
          PREMIUM SPLASH
      ====================================================== */}

      <div
        className={`swivel-splash ${showSplash ? "" : "swivel-splash-hidden"}`}
      >
        <div className="swivel-splash-glow" />

        <div className="swivel-splash-content">
          <img
            src="/swivel-water-logo.png"
            alt="Swivel Water"
            className="swivel-splash-logo"
          />

          <p className="swivel-splash-tagline">
            PURIFIED THROUGH REVERSE OSMOSIS
          </p>
        </div>
      </div>

      <main className="swivel-page">
        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="swivel-nav">
          <div className="swivel-container swivel-nav-inner">
            <a href="#home">
              <img
                src="/swivel-water-logo.png"
                alt="Swivel Water"
                className="swivel-nav-logo"
              />
            </a>

            <div className="swivel-nav-links">
              <a href="#home">Home</a>
              <a href="#products">Products</a>
              <a href="#services">Services</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="swivel-nav-actions">
              <button
                className="swivel-btn swivel-btn-secondary"
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                className="swivel-btn swivel-btn-primary"
                type="button"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* =================================================
            HERO
        ================================================== */}

        <section id="home" className="swivel-hero">
          <div className="swivel-container">
            <div className="swivel-hero-grid">
              <div>
                <p className="swivel-eyebrow">
                  Purified through reverse osmosis
                </p>

                <h1>
                  Pure water.
                  <br />
                  <span>Delivered your way.</span>
                </h1>

                <p className="swivel-hero-text">
                  Swivel Water supplies purified water for homes, restaurants,
                  and businesses, with bottles, refills, water dispensers,
                  custom labels, and delivery available.
                </p>

                <div className="swivel-hero-buttons">
                  <button
                    className="swivel-btn swivel-btn-primary"
                    type="button"
                    onClick={() => navigate("/register")}
                  >
                    Order Water
                  </button>

                  <button
                    className="swivel-btn swivel-btn-secondary"
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    Customer Login
                  </button>
                </div>

                <div className="swivel-highlight-grid">
                  <div className="swivel-highlight">
                    <strong>Home</strong>

                    <span>Water for your everyday needs.</span>
                  </div>

                  <div className="swivel-highlight">
                    <strong>Restaurant</strong>

                    <span>Water supply for hospitality businesses.</span>
                  </div>

                  <div className="swivel-highlight">
                    <strong>Business</strong>

                    <span>Reliable water solutions for workplaces.</span>
                  </div>
                </div>
              </div>

              <div className="swivel-hero-card">
                <img
                  src="/images/swivel-premium-bottle.jpg"
                  alt="Swivel Water purified water bottle"
                />

                <div className="swivel-hero-card-bottom">
                  <div className="swivel-small-label">Swivel Water</div>

                  <p className="swivel-small-text">
                    Still purified water — bottled for everyday refreshment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SERVICES
        ================================================== */}

        <section id="services" className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-section-heading">
              <p>What We Offer</p>

              <h2>Water solutions for every need.</h2>

              <div>
                Discover the Swivel Water range, from everyday bottled water to
                convenient dispensers and refills.
              </div>
            </div>

            <div className="swivel-services-grid">
              <div className="swivel-service-card">
                <div className="swivel-service-icon">💧</div>

                <h3>Water Bottles</h3>

                <p>
                  Branded Swivel Water bottles in a range of sizes for homes,
                  businesses, restaurants, and events.
                </p>
              </div>

              <div className="swivel-service-card">
                <div className="swivel-service-icon">🚰</div>

                <h3>Water Dispensers</h3>

                <p>
                  Convenient water cooler and dispenser solutions for easy
                  access to drinking water.
                </p>
              </div>

              <div className="swivel-service-card">
                <div className="swivel-service-icon">♻️</div>

                <h3>Refills</h3>

                <p>
                  Convenient refill options to keep your household or business
                  supplied with purified water.
                </p>
              </div>

              <div className="swivel-service-card">
                <div className="swivel-service-icon">🏷️</div>

                <h3>Custom Labels</h3>

                <p>
                  Branded water solutions with custom labels for businesses,
                  events, and special occasions.
                </p>
              </div>

              <div className="swivel-service-card">
                <div className="swivel-service-icon">🚚</div>

                <h3>Delivery</h3>

                <p>
                  Delivery is available, making it easier to keep your home or
                  business hydrated.
                </p>
              </div>

              <div className="swivel-service-card">
                <div className="swivel-service-icon">🏢</div>

                <h3>Business Supply</h3>

                <p>
                  Water supply solutions designed for workplaces, restaurants,
                  and other businesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <section id="products" className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-section-heading">
              <p>Products</p>

              <h2>Browse our available water.</h2>

              <div>
                Products shown here are loaded directly from the Swivel Water
                application.
              </div>
            </div>

            {productsLoading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <div className="swivel-service-card">
                <h3>Products coming soon</h3>

                <p>Our online product catalogue is being prepared.</p>
              </div>
            ) : (
              <div className="swivel-products-grid">
                {products.map((product) => (
                  <div className="swivel-product-card" key={product.productId}>
                    <div className="swivel-product-visual">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} />
                      ) : (
                        <img
                          src="/images/swivel-bottles.jpg"
                          alt="Swivel Water products"
                        />
                      )}
                    </div>

                    <div className="swivel-product-info">
                      <h3>{product.productName}</h3>

                      <p>
                        {product.description ??
                          "Purified drinking water from Swivel Water."}
                      </p>

                      <div className="swivel-product-bottom">
                        <span className="swivel-product-price">
                          R {product.price.toFixed(2)}
                        </span>

                        <button
                          className="swivel-btn swivel-btn-primary"
                          type="button"
                          onClick={() => navigate("/register")}
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            ABOUT US
        ================================================== */}

        <section id="about" className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-about-grid">
              <div className="swivel-about-image">
                <img
                  src="/images/swivel-store.jpeg"
                  alt="Swivel Water storefront"
                />
              </div>

              <div>
                <div className="swivel-section-heading">
                  <p>About Swivel Water</p>

                  <h2>
                    Purified water with
                    <br />a local touch.
                  </h2>

                  <div>
                    Swivel Water is based in Southernwood, East London,
                    supplying purified water for homes, restaurants, and
                    businesses.
                  </div>
                </div>

                <div className="swivel-about-panel">
                  <h3>Purified through reverse osmosis.</h3>

                  <p>
                    Swivel Water's customer-facing materials describe its water
                    as purified through reverse osmosis, with a range covering
                    bottled water, dispensers, refills, custom labels, and
                    delivery.
                  </p>

                  <div className="swivel-about-list">
                    <div className="swivel-about-item">
                      <strong>01</strong>

                      <span>Water bottles of different sizes.</span>
                    </div>

                    <div className="swivel-about-item">
                      <strong>02</strong>

                      <span>Water dispenser solutions.</span>
                    </div>

                    <div className="swivel-about-item">
                      <strong>03</strong>

                      <span>Refill services and delivery.</span>
                    </div>

                    <div className="swivel-about-item">
                      <strong>04</strong>

                      <span>Custom-branded water labels.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REAL PRODUCT GALLERY
        ================================================== */}

        <section className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-section-heading">
              <p>From Swivel Water</p>

              <h2>See the Swivel Water range.</h2>

              <div>
                A look at the real Swivel Water products and bottled-water
                range.
              </div>
            </div>

            <div className="swivel-gallery">
              <div className="swivel-gallery-main">
                <img
                  src="/images/swivel-products.jpg"
                  alt="Swivel Water product range"
                />
              </div>

              <div className="swivel-gallery-side">
                <div>
                  <img
                    src="/images/swivel-bottles.jpg"
                    alt="Packaged Swivel Water bottles"
                  />
                </div>

                <div>
                  <img
                    src="/images/swivel-premium-bottle.jpg"
                    alt="Swivel Water bottled water"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================== */}

        <section className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-section-heading">
              <p>How It Works</p>

              <h2>Getting your water is simple.</h2>

              <div>
                Create an account, choose your water, and let Swivel Water
                handle the rest.
              </div>
            </div>

            <div className="swivel-steps">
              <div className="swivel-step">
                <div className="swivel-step-number">1</div>

                <h3>Create your account</h3>

                <p>
                  Register for a Swivel Water account and access your customer
                  dashboard.
                </p>
              </div>

              <div className="swivel-step">
                <div className="swivel-step-number">2</div>

                <h3>Choose your water</h3>

                <p>
                  Select your product and quantity, then choose delivery or
                  collection.
                </p>
              </div>

              <div className="swivel-step">
                <div className="swivel-step-number">3</div>

                <h3>Receive your order</h3>

                <p>
                  Complete your payment and receive your water through the
                  selected option.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTACT
        ================================================== */}

        <section id="contact" className="swivel-section">
          <div className="swivel-container">
            <div className="swivel-section-heading">
              <p>Get In Touch</p>

              <h2>Visit, call, or email us.</h2>

              <div>
                Come visit Swivel Water in Southernwood, East London, or contact
                the team directly.
              </div>
            </div>

            <div className="swivel-contact">
              <div className="swivel-contact-copy">
                <h3>Swivel Water</h3>

                <p>
                  We are located at 9 Garden Street, Southernwood, East London.
                </p>

                <div className="swivel-contact-details">
                  <div className="swivel-contact-detail">
                    <small>Address</small>

                    <span>
                      9 Garden Street,
                      <br />
                      Southernwood,
                      <br />
                      East London
                    </span>
                  </div>

                  <div className="swivel-contact-detail">
                    <small>Phone / WhatsApp</small>

                    <a href="tel:0662422241">066 24 222 41</a>
                  </div>

                  <div className="swivel-contact-detail">
                    <small>Email</small>

                    <a href="mailto:water@swivelec.co.za">
                      water@swivelec.co.za
                    </a>
                  </div>

                  <div className="swivel-contact-detail">
                    <small>Business Hours</small>

                    <span>
                      Monday – Friday: 08:00 – 17:00
                      <br />
                      Saturday: 08:00 – 13:00
                    </span>
                  </div>
                </div>
              </div>

              <form
                className="swivel-contact-form"
                onSubmit={handleContactSubmit}
              >
                <div className="swivel-form-grid">
                  <div className="swivel-field">
                    <label htmlFor="contactName">Name</label>

                    <input
                      id="contactName"
                      name="name"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="swivel-field">
                    <label htmlFor="contactEmail">Email</label>

                    <input
                      id="contactEmail"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="swivel-field swivel-field-full">
                    <label htmlFor="contactMessage">Message</label>

                    <textarea
                      id="contactMessage"
                      name="message"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="swivel-field-full">
                    <button
                      type="submit"
                      className="swivel-btn swivel-btn-primary"
                    >
                      Send Message
                    </button>
                  </div>
                </div>

                {contactSent && (
                  <div className="swivel-success">
                    Your message is ready to be connected to the Swivel Water
                    email service.
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer className="swivel-footer">
          <div className="swivel-container swivel-footer-inner">
            <img src="/swivel-water-logo.png" alt="Swivel Water" />

            <p>
              © {new Date().getFullYear()} Swivel Water. Pure Water. A Brighter
              Tomorrow.
            </p>

            <p>9 Garden Street, Southernwood, East London</p>
          </div>
        </footer>
      </main>

      {/* ===================================================
          AI ASSISTANT UI
      ==================================================== */}

      {chatOpen && (
        <div className="swivel-chat-panel">
          <div className="swivel-chat-header">
            <div>
              <strong>Nono</strong>

              <div
                style={{
                  marginTop: "3px",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                }}
              >
                Swivel Water AI Assistant
              </div>
            </div>

            <span>AI ASSISTANT</span>
          </div>

          <div className="swivel-chat-messages">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "swivel-chat-message swivel-chat-message-user"
                    : "swivel-chat-message"
                }
              >
                {message.text}
              </div>
            ))}

            {aiLoading && (
              <div className="swivel-chat-message">Nono is thinking...</div>
            )}
          </div>

          <div className="swivel-chat-suggestions">
            <button
              type="button"
              onClick={() => sendToNono("What products are available?")}
              disabled={aiLoading}
            >
              What products are available?
            </button>

            <button
              type="button"
              onClick={() => sendToNono("Where can I find Swivel Water?")}
              disabled={aiLoading}
            >
              Where can I find Swivel Water?
            </button>

            <button
              type="button"
              onClick={() => sendToNono("What are your business hours?")}
              disabled={aiLoading}
            >
              What are your business hours?
            </button>

            <button
              type="button"
              onClick={() => sendToNono("How do I place an order?")}
              disabled={aiLoading}
            >
              How do I place an order?
            </button>
          </div>
          <form
            className="swivel-chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendToNono(chatInput);
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask Nono something..."
              maxLength={2000}
              disabled={aiLoading}
            />

            <button
              type="submit"
              disabled={aiLoading || !chatInput.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="swivel-chat-button"
        onClick={() => setChatOpen((current) => !current)}
        aria-label="Open Swivel Water AI Assistant"
        title="Ask Nono"
      >
        {chatOpen ? "×" : "✦"}
      </button>
    </>
  );
}

export default LandingPage;
