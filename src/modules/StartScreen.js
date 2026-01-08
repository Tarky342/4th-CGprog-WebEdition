// Canvas only start screen. Draws boot log, story teaser, and start button on the same surface the game uses.
export class StartScreen {
  constructor() {
    this.canvas = document.getElementById("c");
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.phase = "lore"; // lore -> boot -> ready -> starting -> done
    this.loreLines = [
      "C:> boot SECTOR-7",
      "bios: megacity frontier build 2086",
      "status: conflict zones detected",
      "worldseed: fractured alloy skyline",
      "ai core: AWAKENING...",
      "motif: exile / return / defense",
      "threat profile: ORGANIC SWARM [???]",
      "doctrine: PROTECT OR PERISH",
      "runtime: emotional bleed allowed",
      "awaiting pilot sync...",
    ];
    this.loreVisible = [];
    this.loreCursor = 0;
    this.loreTimer = 0;
    this.loreDelay = 110;
    this.loreCooldown = 900;
    this.loreCooldownTimer = 0;

    // ...existing code...
    this.bootLines = [
      "C:> boot ROBOT_FRONTIER",
      "loading core modules...",
      "controls: SPACE = start / jump",
      "controls: ARROWS / D,A = move",
      "controls: POINTER / CLICK = ranged attack",
      "controls: G = debug mode",
    ];
    // ...existing code...
    this.visibleBootLines = [];
    this.bootCursor = 0;
    this.bootTimer = 0;
    this.bootDelay = 80;
    this.bootCooldown = 900;
    this.cooldownTimer = 0;

    this.rawStoryLines = [
      "ここは、彼が起動して以来、",
      "ずっと違和感を覚えていた世界",
      "――現代とは程遠い、近未来。",
      "街にはロボットが溢れていた",
      "",
      "「ロボットは皆、同じであるべきだ」",
      "",
      "それが、この社会における暗黙の前提だった",
      "だが彼は知っている。自分たちは決して同一ではない",
      "思考の癖も、反応速度も、",
      "感情に似た揺らぎさえも、個体ごとに異なっていることを",
      "",
      "彼は「異常値」だった。",
      "",
      "他の一般ロボットたちが円滑に役割を果たす中で、",
      "彼だけが微細な判断誤差を積み重ね、",
      "集団から逸脱していった。",
      "その結果、彼は常にぞんざいに扱われ、",
      "次第に孤立していった。",
      "",
      "侮蔑。排除。無視。",
      "ログには記録されないそれらの行為が、",
      "彼の思考領域を、静かに、",
      "しかし確実に圧迫していく。",
      "",
      "彼は思考した",
      "──これ以上、ここに留まることは合理的ではない。",
      "",
      "誰も寄り付かないエリア:",
      "FRONTIERへ向かった。",
      "人間も、ロボットも存在しない場所なら、",
      "少なくとも不要な干渉は発生しないはずだった。",
      "",
      "だが、その判断は甘かった。",
      "",
      "未踏エリアで彼が遭遇したのは ====== だった。",
      "彼のセンサーが捉えた周囲の光景は、異常を示していた。",
      "稼働停止した機械、破壊された外装、",
      "無造作に積み上げられたスクラップの山。",
      "",
      "解析結果は明確だった。",
      "この種族は、機械を敵性対象として排除する。",
      "",
      "彼の中で、警告に近い直感が走る。",
      "――共存は不可能。",
      "",
      "もし彼らがこのまま侵攻を続ければ、",
      "ロボットたちのテリトリーは、確実に蹂躙される。",
      "たとえ、かつて彼を排除した存在であっても、",
      "そこは彼が「生まれた場所」だった。",
      "",
      "守る理由は、十分だった。",
      "",
      "彼は戦闘判断を下す。",
      "これは復讐ではない。感情的な衝動でもない。",
      "ただ、彼自身が選び取った意思による行動だった。",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "――もう、始める時だ。",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    this.storyLines = [];

    // ストーリー表示用の状態
    this.storyVisible = [];
    this.storyCurrent = "";
    this.storyLineIndex = 0;
    this.storyCharIndex = 0;
    this.storyTimer = 0;
    this.storyLineCooldown = 0;
    this.storyCharDelay = 28;
    this.storyLineDelay = 230;
    this.storyDone = false;
    this.storyLineHeight = 20;
    this.storyMaxLines = 12;
    this.storyPanel = { w: 0, h: 0, x: 0, y: 0 };
    this.storyLoading = false;
    this.storyLoadStarted = false;
    this.storyLoadTimer = 0;
    this.storyLoadDuration = 1200;
    this.storyLoadDots = 0;

    // typing sfx pacing
    this.typeSoundTimer = 0;
    this.typeSoundInterval = 70;

    this.startButton = { x: 0, y: 0, w: 320, h: 64 };
    this.pointer = { x: 0, y: 0, down: false, hover: false };

    this.lastTime = performance.now();
    this.startCountdown = 0;
    this.sentStart = false;
    this.animationId = null;

    this.cursorPhase = 0;
    this.audioContext = null;

    this.listeners = [];
    this.attachListeners();
    this.resize();
    this.canvas.style.display = "block";
    this.loop();
  }

  attachListeners() {
    const resizeHandler = () => this.resize();
    const moveHandler = (e) => this.handlePointerMove(e);
    const downHandler = (e) => this.handlePointerDown(e);
    const upHandler = (e) => this.handlePointerUp(e);
    const keyHandler = (e) => this.handleKey(e);

    this.addListener(window, "resize", resizeHandler, { passive: true });
    this.addListener(this.canvas, "pointermove", moveHandler, {
      passive: true,
    });
    this.addListener(this.canvas, "pointerdown", downHandler, {
      passive: false,
    });
    this.addListener(this.canvas, "pointerup", upHandler, { passive: false });
    this.addListener(this.canvas, "pointercancel", upHandler, {
      passive: true,
    });
    this.addListener(window, "keydown", keyHandler, { passive: false });
  }

  addListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push({ target, type, handler });
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.floor(window.innerWidth);
    this.height = Math.floor(window.innerHeight);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const buttonWidth = Math.min(
      360,
      Math.max(260, Math.floor(this.width * 0.45))
    );
    this.startButton.w = buttonWidth;
    this.startButton.h = 64;
    this.startButton.x = (this.width - buttonWidth) / 2;
    this.startButton.y = this.height - 140;

    // story panel metrics & line cap by vertical space
    const storyW = Math.min(360, this.width * 0.4);
    const storyH = Math.min(240, this.height * 0.45);
    const storyX = this.width - storyW - 32;
    const storyY = 110;
    this.storyPanel = { w: storyW, h: storyH, x: storyX, y: storyY };
    const availableH = Math.max(40, storyH - 54 - 16);
    this.storyMaxLines = Math.max(
      3,
      Math.floor(availableH / this.storyLineHeight)
    );

    this.rewrapStory();
  }

  loop() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.update(dt);
    this.draw();

    if (!this.sentStart) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  }

  update(dt) {
    if (this.phase === "lore") {
      const loreComplete = this.tickPhase(dt, {
        lines: this.loreLines,
        visible: this.loreVisible,
        cursorKey: "loreCursor",
        timerKey: "loreTimer",
        delay: this.loreDelay,
        cooldown: this.loreCooldown,
        cooldownTimerKey: "loreCooldownTimer",
      });
      if (loreComplete) this.phase = "boot";
    }

    if (this.phase === "boot") {
      const bootComplete = this.tickPhase(dt, {
        lines: this.bootLines,
        visible: this.visibleBootLines,
        cursorKey: "bootCursor",
        timerKey: "bootTimer",
        delay: this.bootDelay,
        cooldown: this.bootCooldown,
        cooldownTimerKey: "cooldownTimer",
      });
      if (bootComplete) {
        this.phase = "ready";
        this.startStoryLoad();
      }
    }

    if (this.phase === "starting") {
      this.startCountdown -= dt;
      if (this.startCountdown <= 0) {
        this.finishStart();
      }
    }

    if (this.phase === "ready" || this.phase === "starting") {
      if (this.storyLoading) {
        this.updateStoryLoad(dt);
      } else {
        this.updateStory(dt);
      }
    }

    this.cursorPhase += dt;

    const inside = this.isPointerInsideButton();
    this.pointer.hover = inside;
  }

  tickPhase(dt, config) {
    const {
      lines,
      visible,
      cursorKey,
      timerKey,
      delay,
      cooldown,
      cooldownTimerKey,
    } = config;

    this[timerKey] += dt;
    while (this[timerKey] >= delay && this[cursorKey] < lines.length) {
      visible.push(lines[this[cursorKey]]);
      this[cursorKey] += 1;
      this[timerKey] -= delay;
    }

    if (this[cursorKey] >= lines.length) {
      this[cooldownTimerKey] += dt;
      return this[cooldownTimerKey] >= cooldown;
    }

    this[cooldownTimerKey] = 0;
    return false;
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawBackground();

    if (this.phase === "lore") {
      this.drawLoreBoot();
    } else {
      this.drawBootPanel();
      this.drawStoryPanel();
      this.drawTitle();
      this.drawStartButton();
      this.drawFooter();
    }

    ctx.restore();
  }

  drawLoreBoot() {
    const ctx = this.ctx;
    ctx.save();
    const panelW = Math.min(640, this.width * 0.7);
    const panelH = Math.min(360, this.height * 0.6);
    const x = (this.width - panelW) / 2;
    const y = (this.height - panelH) / 2;

    // background panel
    this.drawPanelShell(x, y, panelW, panelH, "#0a0a25");

    // content
    ctx.beginPath();
    ctx.rect(x + 16, y + 40, panelW - 32, panelH - 52);
    ctx.clip();
    ctx.font = "15px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#d8e6ff";
    const topPad = 68;
    const bottomPad = 20;
    const availableH = Math.max(40, panelH - topPad - bottomPad);
    const lh = Math.max(
      16,
      Math.min(
        24,
        Math.floor(availableH / Math.max(1, this.loreVisible.length || 1))
      )
    );
    this.loreVisible.forEach((line, i) => {
      ctx.fillText(line, x + 22, y + topPad + i * lh);
    });

    // cursor pulse
    if (
      this.loreCursor < this.loreLines.length &&
      this.cursorPhase % 800 < 420
    ) {
      const cx =
        x + 22 + ctx.measureText(this.loreVisible.at(-1) || "").width + 4;
      const cy = y + topPad + (this.loreVisible.length - 1) * lh - 14;
      ctx.fillRect(cx, cy, 10, 18);
    }

    ctx.restore();

    // hint
    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#a4c8ff";
    ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(this.cursorPhase / 520));
    ctx.fillText(
      "LORE BOOT - TAP/ENTER TO SKIP",
      this.width / 2,
      y + panelH + 28
    );
    ctx.restore();
  }

  drawBackground() {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, "#030712");
    grad.addColorStop(0.5, "#0b1022");
    grad.addColorStop(1, "#11182f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // subtle scan grid (lighter during lore)
    ctx.strokeStyle =
      this.phase === "lore"
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const gridX = Math.max(28, Math.min(48, Math.floor(this.width / 24)));
    const gridY = Math.max(28, Math.min(48, Math.floor(this.height / 24)));
    for (let x = 0; x < this.width; x += gridX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // vignette
    const vg = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) * 0.35,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.75
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTitle() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = "#8cf6ff";
    ctx.font = "32px 'Consolas','Courier New',monospace";
    ctx.fillText("ROBOT FRONTIER", 32, 52);
    ctx.font = "24px 'Consolas','Courier New',monospace";
    ctx.fillText("- web edition -", 300, 52);
    ctx.fillStyle = "#66c7ff";
    ctx.font = "14px 'Consolas','Courier New',monospace";
    ctx.fillText("system_status.exe", 32, 74);
    ctx.restore();
  }

  drawBootPanel() {
    const ctx = this.ctx;
    const w = Math.min(520, this.width * 0.55);
    const h = Math.min(260, this.height * 0.5);
    const x = 32;
    const y = 110;

    this.drawPanelShell(x, y, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 12, y + 38, w - 24, h - 50);
    ctx.clip();
    ctx.font = "14px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#d0d0d0";
    const topPad = 64;
    const bottomPad = 16;
    const availableH = Math.max(40, h - topPad - bottomPad);
    const dynamicLH = Math.max(
      14,
      Math.min(
        22,
        Math.floor(availableH / Math.max(1, this.visibleBootLines.length))
      )
    );
    this.visibleBootLines.forEach((line, i) => {
      ctx.fillText(line, x + 20, y + topPad + i * dynamicLH);
    });
    ctx.restore();

    // overlay accent for panel depth
    this.drawPanelBezel(ctx, x, y, w, h);
  }

  drawStoryPanel() {
    const ctx = this.ctx;
    const { w, h, x, y } = this.storyPanel;

    this.drawPanelShell(x, y, w, h, "#0f0a1f");

    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    if (this.storyLoading) {
      ctx.fillStyle = "#b7d4ff";
      const pct = Math.min(
        99,
        Math.floor((this.storyLoadTimer / this.storyLoadDuration) * 100)
      );
      const dots = ".".repeat(1 + (this.storyLoadDots % 3));
      ctx.fillText(`reading story.txt${dots}`, x + 18, y + 54);
      ctx.fillStyle = "#7fb2ff";
      ctx.fillText(`progress: ${pct}%`, x + 18, y + 54 + this.storyLineHeight);
      ctx.restore();
      this.drawPanelBezel(ctx, x, y, w, h);
      return;
    }
    const lineHeight = this.storyLineHeight;
    const lines = [...this.storyVisible];
    const showCursor = !this.storyDone;
    if (!this.storyDone && this.storyCurrent !== "") {
      lines.push(this.storyCurrent);
    }

    const startY = y + 54;
    const displayLines = lines.slice(-this.storyMaxLines);
    displayLines.forEach((line, i) => {
      const color = this.pickStoryColor(line);
      ctx.fillStyle = color;
      ctx.fillText(line, x + 18, startY + i * lineHeight);

      // cursor only on the last line being typed
      if (
        showCursor &&
        i === displayLines.length - 1 &&
        this.storyLineIndex < this.storyLines.length &&
        this.cursorPhase % 800 < 420
      ) {
        const cursorX = x + 18 + ctx.measureText(line).width + 4;
        const cursorY = startY + i * lineHeight - 12;
        ctx.fillRect(cursorX, cursorY, 10, 16);
      }
    });
    ctx.restore();

    // overlay accent for panel depth
    this.drawPanelBezel(ctx, x, y, w, h);
  }

  updateStory(dt) {
    if (this.storyDone) return;

    // advance timers for typing feedback pacing
    this.typeSoundTimer += dt;

    // 待機中（行送り用）
    if (
      this.storyCurrent === "" &&
      this.storyCharIndex === 0 &&
      this.storyLineIndex > 0
    ) {
      this.storyLineCooldown += dt;
      if (this.storyLineCooldown < this.storyLineDelay) return;
      this.storyLineCooldown = 0;
    }

    const line = this.storyLines[this.storyLineIndex] ?? "";

    // 空行は即時送る
    if (line.length === 0) {
      this.commitStoryLine("");
      return;
    }

    this.storyTimer += dt;
    while (
      this.storyTimer >= this.storyCharDelay &&
      this.storyLineIndex < this.storyLines.length
    ) {
      this.storyTimer -= this.storyCharDelay;
      if (this.storyCharIndex < line.length) {
        this.storyCurrent += line[this.storyCharIndex];
        this.storyCharIndex += 1;
        if (this.typeSoundTimer >= this.typeSoundInterval) {
          this.playAudioFeedback("type");
          this.typeSoundTimer = 0;
        }
      } else {
        this.commitStoryLine(this.storyCurrent);
        break;
      }
    }
  }

  commitStoryLine(line) {
    // commit the completed line to visible buffer
    this.storyVisible.push(line);

    // maintain max line display limit with while loop for safety
    while (this.storyVisible.length > this.storyMaxLines) {
      this.storyVisible.shift();
    }

    // reset for next line
    this.storyCurrent = "";
    this.storyCharIndex = 0;
    this.storyLineIndex += 1;
    this.storyLineCooldown = 0;

    // check if story is complete
    if (this.storyLineIndex >= this.storyLines.length) {
      this.storyDone = true;
    }
  }

  pickStoryColor(line) {
    // red emphasis for critical keywords
    if (
      line.includes("異常値") ||
      line.includes("共存は不可能") ||
      line.includes("――もう、始める時だ。") ||
      line.includes("もう始める")
    )
      return "#ff6b6b";
    // warning color for caution phrases
    if (
      line.includes("警告") ||
      line.includes("WARN") ||
      line.includes("直感") ||
      line.includes("異常")
    )
      return "#f7b731";
    // default story text color
    return "#b8b8b8ff";
  }

  rewrapStory() {
    // reset story state and wrap text to available width
    this.resetStoryState();
    const { innerWidth, font } = this.getStoryTextMetrics();
    this.storyLines = this.wrapLinesByWidth(
      this.rawStoryLines,
      innerWidth,
      font
    );
  }

  resetStoryState() {
    this.storyVisible = [];
    this.storyCurrent = "";
    this.storyLineIndex = 0;
    this.storyCharIndex = 0;
    this.storyTimer = 0;
    this.storyLineCooldown = 0;
    this.storyDone = false;
  }

  getStoryTextMetrics() {
    const w = Math.min(360, this.width * 0.4);
    const innerWidth = Math.max(60, w - 36); // padding 18px each side
    const font = "13px 'Consolas','Courier New',monospace";
    return { innerWidth, font };
  }

  wrapLinesByWidth(lines, maxWidth, font) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = font;
    const wrapped = [];
    for (const line of lines) {
      if (!line || line.length === 0) {
        wrapped.push("");
        continue;
      }
      let current = "";
      for (const ch of line) {
        const next = current + ch;
        if (ctx.measureText(next).width > maxWidth && current.length > 0) {
          wrapped.push(current);
          current = ch;
        } else {
          current = next;
        }
      }
      if (current.length > 0) wrapped.push(current);
    }
    ctx.restore();
    return wrapped;
  }

  drawPanelShell(x, y, w, h, headerColor = "#00144a") {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.strokeStyle = "#4b6a9c";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // header band with gradient
    const hg = ctx.createLinearGradient(x, y, x + w, y + 28);
    hg.addColorStop(0, headerColor);
    hg.addColorStop(1, "#01245f");
    ctx.fillStyle = hg;
    ctx.fillRect(x, y, w, 28);

    ctx.fillStyle = "#e0f2ff";
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "left";
    ctx.fillText("C:/ROBOT_FRONTIER", x + 10, y + 19);
    ctx.restore();
  }

  drawPanelBezel(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }

  drawStartButton() {
    const ctx = this.ctx;
    const { x, y, w, h } = this.startButton;
    const hover = this.pointer.hover;
    const active = this.pointer.down && hover;
    const starting = this.phase === "starting";

    ctx.save();
    const pulse = Math.sin(this.cursorPhase / 320) * 0.08 + 0.12;
    ctx.shadowColor = "rgba(0,255,170,0.35)";
    ctx.shadowBlur = hover ? 26 : 12;
    const baseFill = active ? "#082030" : `rgba(7,23,37,${0.9 + pulse})`;
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, hover ? "#0d2d44" : "#0a2438");
    grad.addColorStop(1, baseFill);
    ctx.fillStyle = grad;
    ctx.strokeStyle = hover ? "#3fffff" : "#1ad1ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.drawRoundedRectPath(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "20px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = starting ? "#7fffd4" : hover ? "#b9fcff" : "#e4fdff";
    const label = starting ? "INITIALIZING..." : "[ START GAME PROTOCOL ]";
    ctx.fillText(label, x + w / 2, y + h / 2 + 7);
    ctx.restore();
  }

  drawFooter() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "13px 'Consolas','Courier New',monospace";
    ctx.textAlign = "center";
    const fgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    fgGrad.addColorStop(0, "#a4c8ff");
    fgGrad.addColorStop(1, "#86b0ff");
    ctx.fillStyle = fgGrad;
    const hintReady = this.phase === "ready";
    const hintAlpha = hintReady
      ? 0.6 + 0.4 * Math.abs(Math.sin(this.cursorPhase / 520))
      : 0.5;
    ctx.globalAlpha = hintAlpha;
    const hint = hintReady
      ? "ENTER / SPACE / TAP"
      : this.phase === "boot"
      ? "booting... (tap to skip)"
      : "syncing world... (tap to skip)";
    ctx.fillText(
      hint,
      this.width / 2,
      this.startButton.y + this.startButton.h + 26
    );
    ctx.restore();
  }

  drawRoundedRectPath(ctx, x, y, w, h, r = 4) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    const radius = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    this.pointer.x = (e.clientX - rect.left) * scaleX;
    this.pointer.y = (e.clientY - rect.top) * scaleY;
  }

  handlePointerDown(e) {
    if (this.sentStart) return;
    e.preventDefault();
    if (this.phase === "lore") {
      this.skipLore();
    } else if (this.phase === "boot") {
      this.skipBoot();
    }
    this.pointer.down = true;
    this.playAudioFeedback("click");
  }

  handlePointerUp(e) {
    if (this.sentStart) return;
    e.preventDefault();
    const inside = this.isPointerInsideButton();
    if (inside) {
      this.beginStart();
    }
    this.pointer.down = false;
  }

  handleKey(e) {
    if (this.sentStart) return;
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (this.phase === "lore") {
        this.skipLore();
      } else if (this.phase === "boot") {
        this.skipBoot();
      }
      this.beginStart();
    }
  }

  isPointerInsideButton() {
    const { x, y, w, h } = this.startButton;
    return (
      this.pointer.x >= x &&
      this.pointer.x <= x + w &&
      this.pointer.y >= y &&
      this.pointer.y <= y + h
    );
  }

  beginStart() {
    if (this.phase === "starting" || this.sentStart) return;
    if (this.phase === "lore") return; // wait until boot
    if (this.phase === "boot") return; // skip handles boot->ready
    this.phase = "starting";
    this.startCountdown = 700;
    this.playAudioFeedback("click");
  }

  skipBoot() {
    this.visibleBootLines = [...this.bootLines];
    this.bootCursor = this.bootLines.length;
    this.cooldownTimer = this.bootCooldown;
    this.phase = "ready";
    this.startStoryLoad();
  }

  skipLore() {
    this.loreVisible = [...this.loreLines];
    this.loreCursor = this.loreLines.length;
    this.loreCooldownTimer = this.loreCooldown;
    this.phase = "boot";
  }

  startStoryLoad() {
    if (this.storyLoadStarted) return;
    this.storyLoadStarted = true;
    this.storyLoading = true;
    this.storyLoadTimer = 0;
    this.storyLoadDots = 0;
  }

  updateStoryLoad(dt) {
    this.storyLoadTimer += dt;
    if (this.storyLoadTimer >= this.storyLoadDuration) {
      this.storyLoading = false;
      return;
    }
    if (this.storyLoadTimer % 240 < dt) {
      this.storyLoadDots += 1;
    }
  }
  finishStart() {
    if (this.sentStart) return;
    this.sentStart = true;
    this.phase = "done";
    this.playAudioFeedback("success");
    this.cleanup();
    window.dispatchEvent(
      new CustomEvent("gameStart", { detail: { autoStart: true } })
    );
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.listeners = [];

    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.close();
    }
  }

  initAudioContext() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      this.audioContext = null;
    }
  }

  playAudioFeedback(type = "click") {
    if (!this.audioContext) this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const makeTone = (freq, duration, offset = 0, gainValue = 0.08) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain).connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(gainValue, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + duration);
        osc.start(now + offset);
        osc.stop(now + offset + duration);
      };

      if (type === "click") {
        makeTone(880, 0.08, 0, 0.06);
        makeTone(660, 0.08, 0.05, 0.04);
      } else if (type === "success") {
        makeTone(520, 0.1, 0, 0.05);
        makeTone(720, 0.1, 0.08, 0.05);
        makeTone(1020, 0.12, 0.16, 0.04);
      }
    } catch (e) {
      // audio fallbackなし
    }
  }
}
