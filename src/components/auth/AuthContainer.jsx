import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import AuthForm from "./AuthForm";
import "./auth.css";

const MODES = {
  SIGNUP: "signup",
  LOGIN: "login",
};

const FORM_PADDING_DESKTOP = 72;
const FORM_PADDING_MOBILE = 48;

export default function AuthContainer() {
  const rootRef = useRef(null);
  const shellRef = useRef(null);
  const lineRef = useRef(null);

  const signupRef = useRef(null);
  const loginRef = useRef(null);

  const timelineRef = useRef(null);
  const animatingRef = useRef(false);

  const [mode, setMode] = useState(MODES.SIGNUP);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("auth-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  const getPanel = useCallback((panelMode) => {
    if (panelMode === MODES.LOGIN) {
      return loginRef.current;
    }

    return signupRef.current;
  }, []);

  const getVerticalPadding = useCallback(() => {
    if (typeof window === "undefined") {
      return FORM_PADDING_DESKTOP;
    }

    return window.innerWidth <= 600
      ? FORM_PADDING_MOBILE
      : FORM_PADDING_DESKTOP;
  }, []);

  const getPanelHeight = useCallback(
    (panelMode) => {
      const panel = getPanel(panelMode);

      if (!panel) {
        return 600;
      }

      return panel.scrollHeight + getVerticalPadding();
    },
    [getPanel, getVerticalPadding],
  );

  const focusFirstField = useCallback(
    (panelMode) => {
      const panel = getPanel(panelMode);

      if (!panel) {
        return;
      }

      const firstInput = panel.querySelector("input");

      if (!firstInput) {
        return;
      }

      requestAnimationFrame(() => {
        firstInput.focus({
          preventScroll: true,
        });
      });
    },
    [getPanel],
  );

  const applyPanelAccessibility = useCallback((activeMode) => {
    const signup = signupRef.current;
    const login = loginRef.current;

    if (!signup || !login) {
      return;
    }

    const signupActive = activeMode === MODES.SIGNUP;

    signup.setAttribute("aria-hidden", String(!signupActive));

    login.setAttribute("aria-hidden", String(signupActive));

    signup.style.pointerEvents = signupActive ? "auto" : "none";

    login.style.pointerEvents = signupActive ? "none" : "auto";

    const signupControls = signup.querySelectorAll("input, button, a");

    const loginControls = login.querySelectorAll("input, button, a");

    signupControls.forEach((element) => {
      element.tabIndex = signupActive ? 0 : -1;
    });

    loginControls.forEach((element) => {
      element.tabIndex = signupActive ? -1 : 0;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      window.localStorage.setItem("auth-theme", nextTheme);

      return nextTheme;
    });
  }, []);

  const animateTransition = useCallback(
    (nextMode) => {
      if (animatingRef.current || nextMode === mode) {
        return;
      }

      const currentPanel = getPanel(mode);
      const nextPanel = getPanel(nextMode);

      const shell = shellRef.current;
      const line = lineRef.current;

      if (!currentPanel || !nextPanel || !shell || !line) {
        return;
      }

      animatingRef.current = true;
      setIsAnimating(true);

      timelineRef.current?.kill();

      const currentItems = currentPanel.querySelectorAll("[data-auth-item]");

      const nextItems = nextPanel.querySelectorAll("[data-auth-item]");

      const nextHeight = getPanelHeight(nextMode);

      if (reducedMotion) {
        const tl = gsap.timeline({
          onComplete: () => {
            applyPanelAccessibility(nextMode);

            animatingRef.current = false;

            setMode(nextMode);
            setIsAnimating(false);

            requestAnimationFrame(() => {
              focusFirstField(nextMode);
            });
          },
        });

        timelineRef.current = tl;

        tl.set(currentPanel, {
          autoAlpha: 0,
          visibility: "hidden",
        })
          .set(nextPanel, {
            autoAlpha: 1,
            visibility: "visible",
          })
          .set(nextItems, {
            opacity: 1,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            filter: "blur(0px)",
          })
          .set(shell, {
            height: nextHeight,
            width: "100%",
            borderRadius: 28,
          });

        return;
      }

      const tl = gsap.timeline({
        defaults: {
          overwrite: "auto",
        },

        onComplete: () => {
          applyPanelAccessibility(nextMode);

          animatingRef.current = false;

          setMode(nextMode);
          setIsAnimating(false);

          requestAnimationFrame(() => {
            focusFirstField(nextMode);
          });
        },
      });

      timelineRef.current = tl;

      tl.set(nextPanel, {
        visibility: "visible",
        autoAlpha: 1,
      });

      tl.set(nextItems, {
        opacity: 0,
        y: 18,
        scaleY: 0.82,
        scaleX: 0.96,
        filter: "blur(5px)",
        transformOrigin: "50% 0%",
      });

      tl.to(currentItems, {
        duration: 0.34,

        y: (index, element) => {
          const panelRect = currentPanel.getBoundingClientRect();

          const elementRect = element.getBoundingClientRect();

          const panelCenter = panelRect.top + panelRect.height / 2;

          const elementCenter = elementRect.top + elementRect.height / 2;

          return (panelCenter - elementCenter) * 0.16;
        },

        scaleY: 0.72,
        scaleX: 0.94,

        opacity: 0,

        filter: "blur(4px)",

        transformOrigin: "50% 50%",

        stagger: {
          each: 0.025,
          from: "edges",
        },

        ease: "power2.in",
      });

      tl.to(
        shell,
        {
          duration: 0.42,

          height: 4,
          width: "64%",

          borderRadius: 99,

          backgroundColor:
            theme === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(64,54,110,0.08)",

          borderColor: "rgba(255,255,255,0)",

          boxShadow: "0 0 0 rgba(0,0,0,0)",

          ease: "power3.inOut",
        },
        "-=0.19",
      );

      tl.set(currentPanel, {
        visibility: "hidden",
        autoAlpha: 0,
      });

      tl.fromTo(
        line,
        {
          autoAlpha: 0,
          scaleX: 0.18,
        },
        {
          autoAlpha: 1,
          scaleX: 1,

          duration: 0.28,

          ease: "power3.out",
        },
        "-=0.24",
      );

      tl.to(line, {
        scaleX: 1.045,
        duration: 0.13,
        ease: "sine.inOut",
      });

      tl.to(line, {
        scaleX: 1,
        duration: 0.11,
        ease: "sine.inOut",
      });

      tl.to(
        {},
        {
          duration: 0.07,
        },
      );

      tl.to(shell, {
        height: nextHeight,
        width: "100%",

        borderRadius: 28,

        backgroundColor:
          theme === "dark"
            ? "rgba(14, 16, 24, 0.78)"
            : "rgba(255,255,255,0.72)",

        borderColor:
          theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(40,34,70,0.09)",

        boxShadow:
          theme === "dark"
            ? "0 30px 90px rgba(0,0,0,0.38)"
            : "0 30px 90px rgba(68,60,100,0.12)",

        duration: 0.62,

        ease: "expo.inOut",
      });

      tl.to(
        line,
        {
          scaleX: 0.72,
          autoAlpha: 0,

          duration: 0.28,

          ease: "power2.in",
        },
        "-=0.42",
      );

      tl.to(
        nextItems,
        {
          opacity: 1,

          y: 0,

          scaleY: 1,
          scaleX: 1,

          filter: "blur(0px)",

          duration: 0.46,

          stagger: {
            each: 0.045,
            from: "center",
          },

          ease: "power3.out",
        },
        "-=0.31",
      );
    },
    [
      mode,
      theme,
      reducedMotion,
      getPanel,
      getPanelHeight,
      focusFirstField,
      applyPanelAccessibility,
    ],
  );

  const animateSignupToLogin = useCallback(() => {
    animateTransition(MODES.LOGIN);
  }, [animateTransition]);

  const animateLoginToSignup = useCallback(() => {
    animateTransition(MODES.SIGNUP);
  }, [animateTransition]);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (event) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener?.("change", handleMotionChange);

    const ctx = gsap.context(() => {
      const signup = signupRef.current;

      const login = loginRef.current;

      const shell = shellRef.current;

      const line = lineRef.current;

      if (!signup || !login || !shell || !line) {
        return;
      }

      gsap.set(signup, {
        autoAlpha: 1,
        visibility: "visible",
      });

      gsap.set(login, {
        autoAlpha: 0,
        visibility: "hidden",
      });

      gsap.set(line, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "50% 50%",
      });

      gsap.set(shell, {
        height: getPanelHeight(MODES.SIGNUP),
      });

      applyPanelAccessibility(MODES.SIGNUP);
    }, root);

    return () => {
      timelineRef.current?.kill();

      ctx.revert();

      mediaQuery.removeEventListener?.("change", handleMotionChange);
    };
  }, [getPanelHeight, applyPanelAccessibility]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (animatingRef.current) {
        return;
      }

      const shell = shellRef.current;

      if (!shell) {
        return;
      }

      gsap.set(shell, {
        height: getPanelHeight(mode),
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mode, getPanelHeight]);

  useLayoutEffect(() => {
    const shell = shellRef.current;

    if (!shell) {
      return;
    }

    if (animatingRef.current) {
      return;
    }

    gsap.set(shell, {
      backgroundColor:
        theme === "dark" ? "rgba(14, 16, 24, 0.78)" : "rgba(255,255,255,0.72)",

      borderColor:
        theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(40,34,70,0.09)",

      boxShadow:
        theme === "dark"
          ? "0 30px 90px rgba(0,0,0,0.38)"
          : "0 30px 90px rgba(68,60,100,0.12)",
    });
  }, [theme]);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pointerQuery = window.matchMedia("(pointer: fine)");

    if (motionQuery.matches || !pointerQuery.matches) {
      return undefined;
    }

    const mascots = root.querySelectorAll("[data-auth-mascot]");

    const controllers = [];

    mascots.forEach((mascot) => {
      const head = mascot.querySelector(".auth-mascot-head");

      const face = mascot.querySelector(".auth-mascot-face");

      const body = mascot.querySelector(".auth-mascot-body");

      const pupils = mascot.querySelectorAll(".auth-mascot-eye span");

      if (!head || !face) {
        return;
      }

      const headX = gsap.quickTo(head, "x", {
        duration: 0.45,
        ease: "power3.out",
      });

      const headY = gsap.quickTo(head, "y", {
        duration: 0.45,
        ease: "power3.out",
      });

      const headRotate = gsap.quickTo(head, "rotation", {
        duration: 0.5,
        ease: "power3.out",
      });

      const faceX = gsap.quickTo(face, "x", {
        duration: 0.28,
        ease: "power2.out",
      });

      const faceY = gsap.quickTo(face, "y", {
        duration: 0.28,
        ease: "power2.out",
      });

      const bodyRotate = body
        ? gsap.quickTo(body, "rotation", {
            duration: 0.65,
            ease: "power3.out",
          })
        : null;

      const pupilXs = Array.from(pupils).map((pupil) =>
        gsap.quickTo(pupil, "x", {
          duration: 0.18,
          ease: "power2.out",
        }),
      );

      const pupilYs = Array.from(pupils).map((pupil) =>
        gsap.quickTo(pupil, "y", {
          duration: 0.18,
          ease: "power2.out",
        }),
      );

      controllers.push({
        mascot,
        headX,
        headY,
        headRotate,
        faceX,
        faceY,
        bodyRotate,
        pupilXs,
        pupilYs,
      });
    });

    const handlePointerMove = (event) => {
      if (animatingRef.current) {
        return;
      }

      controllers.forEach(
        ({
          mascot,
          headX,
          headY,
          headRotate,
          faceX,
          faceY,
          bodyRotate,
          pupilXs,
          pupilYs,
        }) => {
          const panel = mascot.closest(".auth-panel");

          if (panel && panel.getAttribute("aria-hidden") === "true") {
            return;
          }

          const rect = mascot.getBoundingClientRect();

          const centerX = rect.left + rect.width / 2;

          const centerY = rect.top + rect.height / 2;

          const deltaX = event.clientX - centerX;

          const deltaY = event.clientY - centerY;

          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;

          const nx = deltaX / distance;

          const ny = deltaY / distance;

          headX(gsap.utils.clamp(-7, 7, nx * 7));

          headY(gsap.utils.clamp(-4, 5, ny * 5));

          headRotate(gsap.utils.clamp(-5, 5, nx * 5));

          faceX(gsap.utils.clamp(-4, 4, nx * 4));

          faceY(gsap.utils.clamp(-3, 3, ny * 3));

          bodyRotate?.(gsap.utils.clamp(-2.5, 2.5, nx * 2.5));

          pupilXs.forEach((move) => {
            move(gsap.utils.clamp(-3.5, 3.5, nx * 3.5));
          });

          pupilYs.forEach((move) => {
            move(gsap.utils.clamp(-2.5, 2.5, ny * 2.5));
          });
        },
      );
    };

    const resetMascots = () => {
      controllers.forEach(
        ({
          headX,
          headY,
          headRotate,
          faceX,
          faceY,
          bodyRotate,
          pupilXs,
          pupilYs,
        }) => {
          headX(0);
          headY(0);
          headRotate(0);

          faceX(0);
          faceY(0);

          bodyRotate?.(0);

          pupilXs.forEach((move) => move(0));

          pupilYs.forEach((move) => move(0));
        },
      );
    };

    window.addEventListener("pointermove", handlePointerMove);

    document.addEventListener("mouseleave", resetMascots);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      document.removeEventListener("mouseleave", resetMascots);
    };
  }, []);

  return (
    <main ref={rootRef} className='auth-page' data-theme={theme}>
      <button
        type='button'
        className='auth-theme-toggle'
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        <span className='auth-theme-toggle-track'>
          <span className='auth-theme-toggle-thumb'>
            {theme === "dark" ? (
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  d='M20.5 14.2A8.2 8.2 0 019.8 3.5 8.6 8.6 0 1010 20.6a8.5 8.5 0 0010.5-6.4Z'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <circle
                  cx='12'
                  cy='12'
                  r='4'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                />

                <path
                  d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                  strokeLinecap='round'
                />
              </svg>
            )}
          </span>
        </span>

        <span className='auth-theme-toggle-label'>
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      </button>

      <div className='auth-orb auth-orb--one' aria-hidden='true' />

      <div className='auth-orb auth-orb--two' aria-hidden='true' />

      <div className='auth-noise' aria-hidden='true' />

      <section className='auth-stage' aria-label='Authentication'>
        <div ref={shellRef} className='auth-shell' data-animating={isAnimating}>
          <div
            ref={lineRef}
            className='auth-transition-line'
            aria-hidden='true'
          />

          <div ref={signupRef} className='auth-panel'>
            <AuthForm
              mode='signup'
              disabled={isAnimating || mode !== MODES.SIGNUP}
              onSwitch={animateSignupToLogin}
            />
          </div>

          <div ref={loginRef} className='auth-panel'>
            <AuthForm
              mode='login'
              disabled={isAnimating || mode !== MODES.LOGIN}
              onSwitch={animateLoginToSignup}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
