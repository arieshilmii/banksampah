(function () {
  'use strict';

  const DIGIT_PATTERNS = {
    '0': [1,1,1,1,1,1,0],
    '1': [0,1,1,0,0,0,0],
    '2': [1,1,0,1,1,0,1],
    '3': [1,1,1,1,0,0,1],
    '4': [0,1,1,0,0,1,1],
    '5': [1,0,1,1,0,1,1],
    '6': [1,0,1,1,1,1,1],
    '7': [1,1,1,0,0,0,0],
    '8': [1,1,1,1,1,1,1],
    '9': [1,1,1,1,0,1,1]
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function percentileFromHistogram(hist, total, percentile) {
    const target = total * percentile;
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += hist[i];
      if (sum >= target) return i;
    }
    return 255;
  }

  function otsuThreshold(gray) {
    const hist = new Uint32Array(256);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
    const total = gray.length;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];

    let sumB = 0;
    let wB = 0;
    let maxVariance = -1;
    let threshold = 127;

    for (let i = 0; i < 256; i++) {
      wB += hist[i];
      if (!wB) continue;
      const wF = total - wB;
      if (!wF) break;
      sumB += i * hist[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * (mB - mF) * (mB - mF);
      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = i;
      }
    }
    return threshold;
  }

  function closeSmallGaps(active, maxGap) {
    const out = Uint8Array.from(active);
    let i = 0;
    while (i < out.length) {
      if (out[i]) { i++; continue; }
      const start = i;
      while (i < out.length && !out[i]) i++;
      const end = i - 1;
      const gap = end - start + 1;
      const leftOn = start > 0 && out[start - 1];
      const rightOn = i < out.length && out[i];
      if (gap <= maxGap && leftOn && rightOn) {
        for (let j = start; j <= end; j++) out[j] = 1;
      }
    }
    return out;
  }

  function runsFromActive(active, minLen = 1) {
    const runs = [];
    let i = 0;
    while (i < active.length) {
      if (!active[i]) { i++; continue; }
      const start = i;
      while (i < active.length && active[i]) i++;
      const end = i - 1;
      if (end - start + 1 >= minLen) runs.push({ start, end, width: end - start + 1 });
    }
    return runs;
  }

  function regionMaxRow(mask, W, H, x0, x1, y0, y1) {
    x0 = clamp(Math.floor(x0), 0, W - 1);
    x1 = clamp(Math.ceil(x1), x0 + 1, W);
    y0 = clamp(Math.floor(y0), 0, H - 1);
    y1 = clamp(Math.ceil(y1), y0 + 1, H);
    let best = 0;
    const width = x1 - x0;
    for (let y = y0; y < y1; y++) {
      let count = 0;
      const off = y * W;
      for (let x = x0; x < x1; x++) count += mask[off + x];
      best = Math.max(best, count / Math.max(1, width));
    }
    return best;
  }

  function regionMaxCol(mask, W, H, x0, x1, y0, y1) {
    x0 = clamp(Math.floor(x0), 0, W - 1);
    x1 = clamp(Math.ceil(x1), x0 + 1, W);
    y0 = clamp(Math.floor(y0), 0, H - 1);
    y1 = clamp(Math.ceil(y1), y0 + 1, H);
    let best = 0;
    const height = y1 - y0;
    for (let x = x0; x < x1; x++) {
      let count = 0;
      for (let y = y0; y < y1; y++) count += mask[y * W + x];
      best = Math.max(best, count / Math.max(1, height));
    }
    return best;
  }

  class ScaleLocalScanner {
    constructor({ video, scannerBox, workCanvas, onReading, onStatus, onFallback }) {
      this.video = video;
      this.scannerBox = scannerBox;
      this.workCanvas = workCanvas || document.createElement('canvas');
      this.ctx = this.workCanvas.getContext('2d', { willReadFrequently: true });
      this.onReading = onReading || (() => {});
      this.onStatus = onStatus || (() => {});
      this.onFallback = onFallback || (() => {});

      this.processing = false;
      this.running = false;
      this.timer = null;
      this.previousGray = null;
      this.history = [];
      this.startedAt = 0;
      this.fallbackShown = false;
      this.lastAnalysis = null;
      this.intervalMs = 280;
      this.W = 480;
      this.H = 210;
    }

    start() {
      this.stop();
      this.running = true;
      this.startedAt = performance.now();
      this.fallbackShown = false;
      this.previousGray = null;
      this.history = [];
      this.onStatus('Arahkan hanya layar angka ke dalam kotak hijau.');
      this.schedule(120);
    }

    stop() {
      this.running = false;
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.processing = false;
    }

    schedule(delay = this.intervalMs) {
      if (!this.running) return;
      this.timer = setTimeout(() => this.tick(), delay);
    }

    async tick() {
      if (!this.running || this.processing) return this.schedule();
      this.processing = true;
      try {
        const result = this.analyzeFrame();
        if (!result) return;
        this.lastAnalysis = result;

        const elapsed = performance.now() - this.startedAt;
        if (!this.fallbackShown && elapsed > 6500) {
          this.fallbackShown = true;
          this.onFallback();
        }

        if (result.quality.contrast < 30) {
          this.onStatus('Kurang kontras. Dekatkan kamera atau ubah sudut agar layar tidak silau.');
          this.history = [];
          return;
        }

        if (result.quality.sharpness < 7.5) {
          this.onStatus('Gambar belum tajam. Tahan HP sebentar agar fokus.');
          this.history = [];
          return;
        }

        if (result.quality.motion !== null && result.quality.motion > 18) {
          this.onStatus('Tahan sebentar… kamera masih bergerak.');
          return;
        }

        if (!result.text || result.confidence < 0.62) {
          this.onStatus('Mencari angka timbangan… penuhi kotak dengan layar angka.');
          return;
        }

        this.history.push({ text: result.text, confidence: result.confidence, time: performance.now() });
        this.history = this.history.filter(x => performance.now() - x.time < 1800).slice(-6);

        const same = this.history.filter(x => x.text === result.text);
        const avgConfidence = same.reduce((a, b) => a + b.confidence, 0) / Math.max(1, same.length);

        if (same.length >= 3 && avgConfidence >= 0.68) {
          this.onStatus(`Terbaca ${result.text} kg ✓`);
          this.stop();
          this.onReading(result.text, avgConfidence, result);
          return;
        }

        this.onStatus(`Terdeteksi ${result.text} kg · tahan sebentar…`);
      } catch (err) {
        console.error('Local scanner error:', err);
        this.onStatus('Scanner lokal belum berhasil. Kamu bisa input manual atau gunakan bantuan AI.');
        if (!this.fallbackShown) {
          this.fallbackShown = true;
          this.onFallback();
        }
      } finally {
        this.processing = false;
        this.schedule();
      }
    }

    getCropRect() {
      const vr = this.video.getBoundingClientRect();
      const br = this.scannerBox.getBoundingClientRect();
      const vw = this.video.videoWidth;
      const vh = this.video.videoHeight;
      if (!vw || !vh || !vr.width || !vr.height) return null;

      const scale = Math.max(vr.width / vw, vr.height / vh);
      const renderedW = vw * scale;
      const renderedH = vh * scale;
      const offsetX = (renderedW - vr.width) / 2;
      const offsetY = (renderedH - vr.height) / 2;

      let sx = ((br.left - vr.left) + offsetX) / scale;
      let sy = ((br.top - vr.top) + offsetY) / scale;
      let sw = br.width / scale;
      let sh = br.height / scale;

      sx = clamp(sx, 0, vw - 1);
      sy = clamp(sy, 0, vh - 1);
      sw = clamp(sw, 1, vw - sx);
      sh = clamp(sh, 1, vh - sy);
      return { sx, sy, sw, sh };
    }

    drawCrop(targetCanvas, width, height) {
      const crop = this.getCropRect();
      if (!crop) return false;
      targetCanvas.width = width;
      targetCanvas.height = height;
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
      return true;
    }

    captureBase64(width = 720, quality = 0.88) {
      const ratio = this.scannerBox.clientHeight / Math.max(1, this.scannerBox.clientWidth);
      const canvas = document.createElement('canvas');
      const height = Math.round(width * ratio);
      if (!this.drawCrop(canvas, width, height)) return null;
      return canvas.toDataURL('image/jpeg', quality).split(',')[1];
    }

    analyzeFrame() {
      if (!this.drawCrop(this.workCanvas, this.W, this.H)) return null;
      const image = this.ctx.getImageData(0, 0, this.W, this.H);
      const gray = new Uint8Array(this.W * this.H);
      const hist = new Uint32Array(256);

      for (let i = 0, p = 0; i < image.data.length; i += 4, p++) {
        const g = Math.round(0.299 * image.data[i] + 0.587 * image.data[i + 1] + 0.114 * image.data[i + 2]);
        gray[p] = g;
        hist[g]++;
      }

      const p10 = percentileFromHistogram(hist, gray.length, 0.10);
      const p90 = percentileFromHistogram(hist, gray.length, 0.90);
      const contrast = p90 - p10;

      let grad = 0;
      let gradN = 0;
      for (let y = 2; y < this.H - 2; y += 2) {
        for (let x = 2; x < this.W - 2; x += 2) {
          const i = y * this.W + x;
          grad += Math.abs(gray[i + 1] - gray[i - 1]) + Math.abs(gray[i + this.W] - gray[i - this.W]);
          gradN += 2;
        }
      }
      const sharpness = grad / Math.max(1, gradN);

      let motion = null;
      if (this.previousGray && this.previousGray.length === gray.length) {
        let diff = 0;
        let n = 0;
        for (let i = 0; i < gray.length; i += 6) {
          diff += Math.abs(gray[i] - this.previousGray[i]);
          n++;
        }
        motion = diff / Math.max(1, n);
      }
      this.previousGray = gray.slice();

      const span = Math.max(20, p90 - p10);
      const normalized = new Uint8Array(gray.length);
      for (let i = 0; i < gray.length; i++) {
        normalized[i] = clamp(Math.round(((gray[i] - p10) * 255) / span), 0, 255);
      }

      let threshold = otsuThreshold(normalized);
      threshold = clamp(threshold, 55, 190);
      const mask = new Uint8Array(normalized.length);
      let foreground = 0;
      for (let i = 0; i < normalized.length; i++) {
        const v = normalized[i] < threshold ? 1 : 0;
        mask[i] = v;
        foreground += v;
      }

      const density = foreground / mask.length;
      const recognition = (density < 0.015 || density > 0.58)
        ? { text: null, confidence: 0, debug: { density } }
        : this.recognizeSevenSegment(mask, this.W, this.H);

      return {
        text: recognition.text,
        confidence: recognition.confidence || 0,
        quality: { contrast, sharpness, motion, density },
        debug: recognition.debug || {}
      };
    }

    recognizeSevenSegment(mask, W, H) {
      const innerX0 = Math.floor(W * 0.035);
      const innerX1 = Math.ceil(W * 0.965);
      const innerY0 = Math.floor(H * 0.06);
      const innerY1 = Math.ceil(H * 0.94);

      const rowActive = new Uint8Array(H);
      for (let y = innerY0; y < innerY1; y++) {
        let count = 0;
        const off = y * W;
        for (let x = innerX0; x < innerX1; x++) count += mask[off + x];
        rowActive[y] = count >= Math.max(3, (innerX1 - innerX0) * 0.012) ? 1 : 0;
      }

      const rowRuns = runsFromActive(closeSmallGaps(rowActive, 5), 10)
        .filter(r => r.start >= innerY0 && r.end <= innerY1);
      if (!rowRuns.length) return { text: null, confidence: 0, debug: { reason: 'no-row-band' } };

      const band = rowRuns.sort((a, b) => b.width - a.width)[0];
      let y0 = Math.max(innerY0, band.start - 3);
      let y1 = Math.min(innerY1, band.end + 4);
      let bandH = y1 - y0;
      if (bandH < H * 0.34) return { text: null, confidence: 0, debug: { reason: 'band-too-short', bandH } };

      const colActive = new Uint8Array(W);
      for (let x = innerX0; x < innerX1; x++) {
        let count = 0;
        for (let y = y0; y < y1; y++) count += mask[y * W + x];
        colActive[x] = count >= Math.max(2, bandH * 0.028) ? 1 : 0;
      }
      const rawRuns = runsFromActive(closeSmallGaps(colActive, 2), 2)
        .filter(r => r.start >= innerX0 && r.end <= innerX1);
      if (!rawRuns.length) return { text: null, confidence: 0, debug: { reason: 'no-col-runs' } };

      const digitRuns = [];
      const dotRuns = [];
      for (const r of rawRuns) {
        let minY = y1, maxY = y0, area = 0;
        for (let x = r.start; x <= r.end; x++) {
          for (let y = y0; y < y1; y++) {
            if (mask[y * W + x]) {
              area++;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (!area) continue;
        const ySpan = maxY - minY + 1;
        const aspect = r.width / Math.max(1, bandH);
        if (ySpan >= bandH * 0.48 && aspect >= 0.035) {
          digitRuns.push({ ...r, minY, maxY, area });
        } else if (ySpan <= bandH * 0.32 && minY >= y0 + bandH * 0.55 && r.width <= bandH * 0.24) {
          dotRuns.push({ ...r, minY, maxY, area });
        }
      }

      if (!digitRuns.length || digitRuns.length > 7) {
        return { text: null, confidence: 0, debug: { reason: 'digit-count', count: digitRuns.length } };
      }

      const widths = digitRuns.map(r => r.width).sort((a, b) => a - b);
      const wideWidths = widths.filter(w => w >= bandH * 0.22);
      const expectedW = wideWidths.length
        ? wideWidths[Math.floor(wideWidths.length / 2)]
        : Math.max(bandH * 0.42, widths[Math.floor(widths.length / 2)]);

      const recognized = [];
      for (const r of digitRuns) {
        const narrow = r.width < bandH * 0.24;
        if (narrow) {
          recognized.push({ digit: '1', confidence: clamp(0.78 + (0.24 - r.width / bandH), 0.70, 0.94), run: r });
          continue;
        }

        const pad = Math.min(expectedW * 0.08, 5);
        const x0 = Math.max(innerX0, r.start - pad);
        const x1 = Math.min(innerX1, r.end + pad + 1);
        const w = x1 - x0;
        const h = bandH;

        const seg = [
          regionMaxRow(mask, W, H, x0 + w * 0.18, x0 + w * 0.82, y0, y0 + h * 0.16),
          regionMaxCol(mask, W, H, x0 + w * 0.76, x1, y0 + h * 0.12, y0 + h * 0.47),
          regionMaxCol(mask, W, H, x0 + w * 0.76, x1, y0 + h * 0.53, y0 + h * 0.89),
          regionMaxRow(mask, W, H, x0 + w * 0.18, x0 + w * 0.82, y0 + h * 0.84, y1),
          regionMaxCol(mask, W, H, x0, x0 + w * 0.24, y0 + h * 0.53, y0 + h * 0.89),
          regionMaxCol(mask, W, H, x0, x0 + w * 0.24, y0 + h * 0.12, y0 + h * 0.47),
          regionMaxRow(mask, W, H, x0 + w * 0.18, x0 + w * 0.82, y0 + h * 0.43, y0 + h * 0.58)
        ].map(v => clamp((v - 0.05) / 0.70, 0, 1));

        let bestDigit = null;
        let bestScore = -1;
        let second = -1;
        for (const [digit, pattern] of Object.entries(DIGIT_PATTERNS)) {
          let score = 0;
          for (let i = 0; i < 7; i++) score += pattern[i] ? seg[i] : (1 - seg[i]);
          score /= 7;
          if (score > bestScore) {
            second = bestScore;
            bestScore = score;
            bestDigit = digit;
          } else if (score > second) {
            second = score;
          }
        }
        const margin = bestScore - Math.max(0, second);
        const confidence = clamp(bestScore * 0.80 + margin * 0.90, 0, 1);
        recognized.push({ digit: bestDigit, confidence, run: r, segments: seg, bestScore, margin });
      }

      if (recognized.some(r => !r.digit)) return { text: null, confidence: 0, debug: { reason: 'unrecognized' } };

      let text = '';
      for (let i = 0; i < recognized.length; i++) {
        text += recognized[i].digit;
        if (i < recognized.length - 1) {
          const left = recognized[i].run.end;
          const right = recognized[i + 1].run.start;
          const maxDotGap = Math.max(10, expectedW * 0.65);
          const dot = dotRuns.find(d => d.start > left && d.end < right && (d.start - left) < maxDotGap);
          if (dot) text += '.';
        }
      }

      if (!/^\d+(?:\.\d+)?$/.test(text)) return { text: null, confidence: 0, debug: { reason: 'format', text } };
      const numeric = Number(text);
      if (!Number.isFinite(numeric) || numeric <= 0 || numeric > 9999) {
        return { text: null, confidence: 0, debug: { reason: 'range', text } };
      }

      const avg = recognized.reduce((s, r) => s + r.confidence, 0) / recognized.length;
      const min = Math.min(...recognized.map(r => r.confidence));
      const confidence = clamp(avg * 0.75 + min * 0.25, 0, 1);
      return {
        text,
        confidence,
        debug: { y0, y1, digitRuns, dotRuns, expectedW, recognized }
      };
    }
  }

  window.ScaleLocalScanner = ScaleLocalScanner;
})();
