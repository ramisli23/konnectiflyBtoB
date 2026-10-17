import { useEffect, useRef, useState } from "react"

/* =========================================================
   prefers-reduced-motion
   Lecture à chaque appel : l'utilisateur peut changer le
   réglage système sans recharger la page.
   ========================================================= */

let reducedMotionQuery = null

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false

  if (!reducedMotionQuery) {
    reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  }

  return reducedMotionQuery.matches
}


/* =========================================================
   useReveal
   Ajoute la classe `is-visible` sur les éléments marqués
   `data-reveal` dès qu'ils entrent dans le viewport.

   - delay : en ms (via inline style --kf-reveal-delay)
   - Variantes CSS : data-reveal="left" | "right" | "zoom"
   - Une seule intersection suffit, l'observateur est coupé ensuite.
   - Les éléments déjà visibles au chargement apparaissent dans
     un requestAnimationFrame pour que la transition se joue
     (sinon le navigateur saute l'animation).
   ========================================================= */

export function useReveal() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const targets = root.querySelectorAll("[data-reveal]")

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"))
      return
    }

    let frame = 0
    const pending = new Set()

    // Regroupe les ajouts de classe dans un seul frame : moins de reflows
    const flush = () => {
      frame = 0
      pending.forEach((el) => el.classList.add("is-visible"))
      pending.clear()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          pending.add(entry.target)
          observer.unobserve(entry.target)
        })

        if (pending.size && !frame) frame = requestAnimationFrame(flush)
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    )

    targets.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return rootRef
}


/* =========================================================
   useCountUp
   Anime un nombre de 0 à `end` quand `start` devient true.
   Respecte prefers-reduced-motion.

   - easeOutQuart : démarrage vif, arrivée très douce
   - Ne redémarre pas de zéro si `end` change : repart de la
     valeur affichée, sans saut visuel.
   - setState seulement si la valeur affichée a réellement changé.
   ========================================================= */

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

export function useCountUp(end, duration = 1600, start = true) {
  const [value, setValue] = useState(0)
  const valueRef = useRef(0)

  useEffect(() => {
    if (!start) return

    if (prefersReducedMotion()) {
      valueRef.current = end
      setValue(end)
      return
    }

    const from = valueRef.current
    const delta = end - from

    if (delta === 0) return

    let frame = 0
    let startedAt = null

    const tick = (now) => {
      if (startedAt === null) startedAt = now

      const progress = Math.min((now - startedAt) / duration, 1)
      const next = progress === 1 ? end : from + delta * easeOutQuart(progress)

      // Évite les re-renders inutiles (centième près)
      if (Math.abs(next - valueRef.current) >= 0.01 || progress === 1) {
        valueRef.current = next
        setValue(next)
      }

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [end, duration, start])

  return value
}


/* =========================================================
   useScrollState
   true dès que la page dépasse `offset` pixels.
   Utilisé pour l'effet "navbar flottante" et le back-to-top.

   Synchronisé sur requestAnimationFrame : un seul calcul par
   frame, même si le navigateur envoie plusieurs événements.
   ========================================================= */

export function useScrollState(offset = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      setScrolled(window.scrollY > offset)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [offset])

  return scrolled
}