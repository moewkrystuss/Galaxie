"use client"

import React, { useEffect, useState, useRef } from "react"
import styles from "./minihra.module.css"

function hexToRgb(hex: string) {
  const cleaned = hex.replace(/^#/, "")
  const bigint = parseInt(cleaned, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  )
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h = h * 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export default function MinihraPage() {
  const [phase, setPhase] = useState<"show" | "mix" | "result">("show")
  const [target, setTarget] = useState<string>("#A64B8C")
  const [guess, setGuess] = useState<string>("#808080")
  const [score, setScore] = useState<number | null>(null)
  const [msLeft, setMsLeft] = useState<number>(500)
  const timerRef = useRef<number | null>(null)

  // HSL state for mixing UI
  const [h, setH] = useState<number>(0)
  const [s, setS] = useState<number>(55)
  const [l, setL] = useState<number>(50)

  // show duration in ms (user requested ~500ms)
  const SHOW_MS = 500

  useEffect(() => {
    startRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase === "show") {
      setMsLeft(SHOW_MS)
      const start = Date.now()
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - start
        const left = Math.max(0, SHOW_MS - elapsed)
        setMsLeft(left)
        if (left <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current)
        }
      }, 16)
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [phase])

  function randColor() {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return rgbToHex(r, g, b)
  }

  function startRound() {
    const c = randColor()
    setTarget(c)
    setGuess("#808080")
    setScore(null)
    const hsl = hexToHsl(c)
    setH(hsl.h)
    setS(hsl.s)
    setL(hsl.l)
    setPhase("show")
    setTimeout(() => setPhase("mix"), SHOW_MS)
  }

  function hslToHex(h: number, s: number, l: number) {
    const tmp = document.createElement("div")
    tmp.style.color = `hsl(${h} ${s}% ${l}%)`
    document.body.appendChild(tmp)
    const computed = getComputedStyle(tmp).color
    document.body.removeChild(tmp)
    const m = computed.match(/(\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return "#808080"
    return rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]))
  }

  function submitGuess() {
    const a = hexToRgb(target)
    // compute guess from HSL for more accurate mixing
    const guessedHex = hslToHex(h, s, l)
    setGuess(guessedHex)
    const b = hexToRgb(guessedHex)
    const dist = colorDistance(a, b)
    const maxDist = Math.sqrt(255 * 255 * 3)
    // produce score in 0-10 range like screenshots
    const similarity10 = Math.max(0, (1 - dist / maxDist) * 10)
    setScore(Math.round(similarity10 * 100) / 100)
    setPhase("result")
  }

  return (
    <div className={styles.page}>
      {phase === "show" && (
        <div className={`${styles.card} ${styles.cardShow}`}>
          <div className={styles.step}>1/5</div>
          <div className={styles.count}>{Math.ceil(msLeft)}</div>
          <div className={styles.countLabel}>Seconds to remember</div>
          <div className={styles.surface} style={{ background: target }} />
        </div>
      )}

      {phase === "mix" && (
        <div className={styles.mixCard}>
          <div className={styles.step}>1/5</div>
          <div className={styles.mixBody}>
            <div className={styles.colorRail} />
            <div className={styles.valueRail} />
            <div className={styles.hueKnob} />
            <div className={styles.valueKnob} />
            <div className={styles.mixLabel}>SATURATION</div>
            <button className={styles.mixIcon} onClick={submitGuess}>◎</button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className={styles.resultCard}>
          <div className={styles.step}>1/5</div>
          <div className={styles.resultValue}>{score ?? "-"}</div>
          <div className={styles.resultMetaTop}>
            <div>Your selection</div>
            <div className={styles.resultHex}>{guess}</div>
          </div>
          <div className={styles.resultMetaBottom}>
            <div>Original</div>
            <div className={styles.resultHex}>{target}</div>
          </div>
          <button className={styles.next} onClick={startRound}>→</button>
        </div>
      )}
    </div>
  )
}
