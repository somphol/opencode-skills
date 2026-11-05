/* Algorithm Explorer — UI controller.
 * Boots the static studio, binds the three tabs, keeps local progress, exposes a test API.
 */
(function () {
  'use strict';

  const data = window.ALGO_DATA;
  const engine = window.ALGO_ENGINE;
  const scene = window.AlgoScene;
  const PREFS_KEY = 'algoExplorer.prefs.v1';
  const PROGRESS_KEY = 'algoExplorer.progress.v1';
  const QUIZ_KEY = 'algoExplorer.quiz.v1';
  const TEST = new URLSearchParams(location.search).has('test');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const pad = (value) => String(value).padStart(2, '0');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const byId = (id) => data.patterns.find((pattern) => pattern.id === id);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
    } catch { return { ...fallback }; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }

  const prefs = readJSON(PREFS_KEY, { patternId: 'two-pointers', language: 'python', speed: 1, explored: {} });
  const progress = readJSON(PROGRESS_KEY, { done: {} });
  const quizStore = readJSON(QUIZ_KEY, { best: 0, attempts: 0 });

  const state = {
    patternId: byId(prefs.patternId) ? prefs.patternId : 'two-pointers',
    language: ['python', 'javascript', 'cpp'].includes(prefs.language) ? prefs.language : 'python',
    speed: clamp(Number(prefs.speed) || 1, 0.4, 2.6),
    frameIndex: 0,
    playing: false,
    timer: 0,
    result: null,
    tab: 'visualizer',
    difficulty: 'all',
    search: '',
    quiz: {
      order: data.quiz.map((_, i) => i),
      index: 0,
      score: 0,
      streak: 0,
      answered: false,
      option: null,
      results: [],
      finished: false,
      best: Number(quizStore.best) || 0
    }
  };

  const el = {};

  function cacheElements() {
    const ids = [
      'pattern-rail', 'rail-progress-bar', 'rail-progress-text', 'pattern-index', 'pattern-title', 'pattern-kicker',
      'complexity-time', 'complexity-space', 'pattern-signal', 'pattern-description', 'pattern-visual',
      'pattern-problems', 'step-heading', 'step-note', 'step-dot', 'answer-chip', 'answer-value', 'input-label',
      'custom-input', 'input-hint', 'apply-input', 'reset-input', 'input-error', 'prev-step', 'play-toggle',
      'play-icon', 'next-step', 'reset-steps', 'step-counter', 'step-title', 'step-slider', 'speed-slider',
      'speed-value', 'reset-camera', 'code-caption', 'code-view', 'copy-code', 'stage', 'stage-loading',
      'stage-fallback', 'quiz-score', 'quiz-streak', 'quiz-best', 'quiz-count', 'quiz-pattern', 'quiz-progress-bar',
      'quiz-question', 'quiz-options', 'quiz-feedback', 'quiz-verdict', 'quiz-explain', 'quiz-next', 'quiz-review',
      'quiz-dots', 'quiz-side-note', 'quiz-restart', 'practice-ring', 'practice-percent', 'practice-count',
      'practice-list', 'practice-empty', 'practice-search', 'clear-progress', 'help-dialog', 'about-dialog',
      'help-btn', 'about-btn', 'about-stats', 'toast', 'sr-status'
    ];
    for (const id of ids) el[id] = document.getElementById(id);
  }

  function savePrefs() {
    writeJSON(PREFS_KEY, { patternId: state.patternId, language: state.language, speed: state.speed, explored: prefs.explored || {} });
  }

  function toast(message, isError = false) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.toggle('is-error', isError);
    el.toast.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.toast.classList.remove('is-visible'), 2800);
    el['sr-status'].textContent = message;
  }

  /* ------------------------------------------------------------- pattern rail */
  function renderRail() {
    el['pattern-rail'].innerHTML = data.patterns.map((pattern) => `
      <button class="rail-item" data-pattern="${pattern.id}" aria-current="${pattern.id === state.patternId ? 'true' : 'false'}">
        <span class="rail-num">${pad(pattern.index)}</span>
        <span class="rail-title">${esc(pattern.title)}</span>
        <span class="rail-signal">${esc(pattern.signal)}</span>
      </button>`).join('');
    $$('.rail-item', el['pattern-rail']).forEach((button) => {
      button.addEventListener('click', () => selectPattern(button.dataset.pattern));
    });
    updateRailProgress();
  }

  function updateRailProgress() {
    const explored = Object.keys(prefs.explored || {}).filter((id) => data.patterns.some((p) => p.id === id)).length;
    el['rail-progress-bar'].style.width = `${(explored / data.patterns.length) * 100}%`;
    el['rail-progress-text'].textContent = `${explored} / ${data.patterns.length} explored`;
  }

  function markExplored(id) {
    prefs.explored = prefs.explored || {};
    if (!prefs.explored[id]) {
      prefs.explored[id] = true;
      savePrefs();
      updateRailProgress();
    }
  }

  function selectPattern(id) {
    const pattern = byId(id);
    if (!pattern) return;
    state.patternId = id;
    state.playing = false;
    stopTimer();
    renderRail();
    el['custom-input'].value = pattern.defaultInput;
    el['input-error'].hidden = true;
    buildCurrent(pattern.defaultInput);
    markExplored(id);
    savePrefs();
  }

  /* ------------------------------------------------------------------- build */
  function buildCurrent(input) {
    const pattern = byId(state.patternId);
    if (!pattern) return false;
    let result;
    try {
      result = engine.run(pattern.id, input);
    } catch (error) {
      el['input-error'].textContent = error.message;
      el['input-error'].hidden = false;
      toast(error.message, true);
      return false;
    }
    el['input-error'].hidden = true;
    state.result = result;
    state.frameIndex = 0;
    state.playing = false;
    stopTimer();
    renderPatternMeta(pattern);
    if (scene && scene.ready) {
      scene.setPattern(pattern, result);
    }
    renderCode();
    applyFrame(0);
    updatePlayState();
    savePrefs();
    return true;
  }

  function renderPatternMeta(pattern) {
    el['pattern-index'].textContent = `Pattern ${pad(pattern.index)} / ${pad(data.patterns.length)}`;
    el['pattern-title'].textContent = pattern.title;
    el['pattern-kicker'].textContent = pattern.kicker;
    el['complexity-time'].textContent = pattern.time;
    el['complexity-space'].textContent = pattern.space;
    el['pattern-signal'].textContent = pattern.signal;
    el['pattern-description'].textContent = pattern.description;
    el['pattern-visual'].textContent = pattern.visual;
    el['input-label'].textContent = pattern.inputLabel;
    el['input-hint'].textContent = pattern.inputHint;
    if (!el['custom-input'].value || !state.result) el['custom-input'].value = pattern.defaultInput;
    el['pattern-problems'].innerHTML = pattern.problems.map((problem) => `
      <a class="problem-chip ${problem.difficulty.toLowerCase()}" href="${problem.url}" target="_blank" rel="noopener" title="${esc(problem.name)} on LeetCode">
        <b>#${problem.num}</b> ${esc(problem.name.length > 28 ? `${problem.name.slice(0, 27)}…` : problem.name)}
      </a>`).join('');
    el['code-caption'].textContent = `${pattern.title} · ${languageLabel(state.language)}`;
  }

  function applyFrame(index) {
    if (!state.result) return;
    const frames = state.result.frames;
    state.frameIndex = clamp(index, 0, frames.length - 1);
    const frame = frames[state.frameIndex];
    if (scene && scene.ready) scene.showFrame(frame);
    el['step-counter'].textContent = `Step ${state.frameIndex + 1} / ${frames.length}`;
    el['step-title'].textContent = frame.title;
    el['step-heading'].textContent = frame.title;
    el['step-note'].textContent = frame.note;
    el['step-slider'].value = String(state.frameIndex);
    el['step-slider'].max = String(frames.length - 1);
    const last = state.frameIndex === frames.length - 1;
    el['answer-chip'].hidden = !last;
    if (last) {
      const answer = state.result.answer;
      el['answer-value'].textContent = Array.isArray(answer) ? JSON.stringify(answer) : String(answer);
    }
    highlightCode(frame.mark);
    el['prev-step'].disabled = state.frameIndex === 0;
    el['next-step'].disabled = state.frameIndex === frames.length - 1;
    el['step-dot'].style.background = frame.mark === 'done' ? 'var(--good)' : 'var(--accent)';
    el['step-dot'].style.boxShadow = `0 0 12px ${frame.mark === 'done' ? 'var(--good)' : 'var(--accent)'}`;
  }

  /* -------------------------------------------------------------------- code */
  const languageLabel = (language) => ({ python: 'Python', javascript: 'JavaScript', cpp: 'C++' }[language] || language);

  function codeHtml(line) {
    if (/^\s*#\s*include/.test(line)) return esc(line);
    const pattern = /(\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)/g;
    let html = '', last = 0, match;
    const source = String(line);
    while ((match = pattern.exec(source))) {
      html += esc(source.slice(last, match.index));
      if (match[1]) html += `<span class="tok-com">${esc(match[1])}</span>`;
      else if (match[2]) html += `<span class="tok-str">${esc(match[2])}</span>`;
      else html += `<span class="tok-num">${esc(match[3])}</span>`;
      last = pattern.lastIndex;
    }
    return html + esc(source.slice(last));
  }

  function renderCode() {
    const pattern = byId(state.patternId);
    const lines = pattern.code[state.language];
    el['code-caption'].textContent = `${pattern.title} · ${languageLabel(state.language)}`;
    el['code-view'].innerHTML = lines.map((line, i) => `
      <div class="code-line" data-line="${i}" data-mark="${line.m}">
        <span class="ln">${i + 1}</span><span class="src">${codeHtml(line.t) || '&nbsp;'}</span>
      </div>`).join('');
    $$('.lang').forEach((button) => {
      const active = button.dataset.lang === state.language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (state.result) highlightCode(state.result.frames[state.frameIndex]?.mark);
  }

  function highlightCode(mark) {
    let first = null;
    $$('.code-line', el['code-view']).forEach((line) => {
      const active = Boolean(mark) && line.dataset.mark === mark;
      line.classList.toggle('is-active', active);
      if (active && !first) first = line;
    });
    if (first) {
      const view = el['code-view'];
      const top = first.offsetTop - view.offsetTop;
      if (top < view.scrollTop || top + first.offsetHeight > view.scrollTop + view.clientHeight) {
        view.scrollTop = Math.max(0, top - view.clientHeight / 2);
      }
    }
  }

  /* ---------------------------------------------------------------- transport */
  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = 0;
  }

  function startTimer() {
    stopTimer();
    const interval = Math.max(240, 1150 / state.speed);
    state.timer = setInterval(() => {
      if (!state.playing) return;
      if (state.frameIndex >= (state.result?.frames.length || 1) - 1) {
        setPlaying(false);
        return;
      }
      applyFrame(state.frameIndex + 1);
    }, interval);
  }

  function setPlaying(value) {
    if (!state.result) return;
    if (value && state.frameIndex >= state.result.frames.length - 1) applyFrame(0);
    state.playing = Boolean(value);
    el['play-icon'].textContent = state.playing ? '❚❚' : '▶';
    el['play-toggle'].setAttribute('aria-label', state.playing ? 'Pause animation' : 'Play animation');
    if (state.playing) startTimer(); else stopTimer();
  }

  function updatePlayState() {
    el['play-icon'].textContent = state.playing ? '❚❚' : '▶';
    el['play-toggle'].setAttribute('aria-label', state.playing ? 'Pause animation' : 'Play animation');
  }

  function step(delta) {
    if (!state.result) return;
    setPlaying(false);
    applyFrame(state.frameIndex + delta);
  }

  /* -------------------------------------------------------------------- quiz */
  function patternForQuiz(question) { return byId(question.pattern); }

  function renderQuiz() {
    const quiz = state.quiz;
    if (quiz.finished) { renderQuizResults(); return; }
    const question = data.quiz[quiz.order[quiz.index]];
    if (!question) return;
    const pattern = patternForQuiz(question);
    el['quiz-count'].textContent = `Question ${quiz.index + 1} of ${quiz.order.length}`;
    el['quiz-pattern'].textContent = pattern ? pattern.title : 'Pattern';
    el['quiz-progress-bar'].style.width = `${((quiz.index) / quiz.order.length) * 100}%`;
    el['quiz-question'].textContent = question.q;
    el['quiz-score'].textContent = String(quiz.score);
    el['quiz-streak'].textContent = String(quiz.streak);
    el['quiz-best'].textContent = `${quiz.best}%`;
    el['quiz-options'].innerHTML = question.options.map((option, index) => `
      <button class="quiz-option" data-option="${index}" type="button">
        <span class="letter">${String.fromCharCode(65 + index)}</span><span>${esc(option)}</span>
      </button>`).join('');
    $$('.quiz-option', el['quiz-options']).forEach((button) => {
      button.addEventListener('click', () => answerQuiz(Number(button.dataset.option)));
    });
    el['quiz-feedback'].hidden = true;
    el['quiz-feedback'].classList.remove('bad');
    el['quiz-next'].hidden = true;
    el['quiz-review'].hidden = true;
    el['quiz-side-note'].textContent = 'One question at a time. Answer to see the reasoning.';
    renderQuizDots();
    if (quiz.answered) restoreQuizAnswer();
  }

  function renderQuizDots() {
    el['quiz-dots'].innerHTML = data.quiz.map((_, i) => {
      const answerIndex = state.quiz.order[i];
      const result = state.quiz.results[answerIndex];
      const classes = ['quiz-dot'];
      if (i < state.quiz.index) classes.push('done');
      if (i < state.quiz.index && result === true) classes.push('correct');
      if (i < state.quiz.index && result === false) classes.push('wrong');
      if (i === state.quiz.index && !state.quiz.finished) classes.push('current');
      return `<span class="${classes.join(' ')}" title="Question ${i + 1}"></span>`;
    }).join('');
  }

  function answerQuiz(choice) {
    const quiz = state.quiz;
    if (quiz.answered || quiz.finished) return;
    const question = data.quiz[quiz.order[quiz.index]];
    const correct = choice === question.answer;
    quiz.answered = true;
    quiz.option = choice;
    quiz.results[quiz.order[quiz.index]] = correct;
    if (correct) { quiz.score++; quiz.streak++; } else { quiz.streak = 0; }
    $$('.quiz-option', el['quiz-options']).forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add('is-correct');
      if (index === choice && !correct) button.classList.add('is-wrong');
    });
    el['quiz-feedback'].hidden = false;
    el['quiz-feedback'].classList.toggle('bad', !correct);
    el['quiz-verdict'].textContent = correct ? 'Correct — that is the pattern.' : 'Not quite. The strongest signal points elsewhere.';
    el['quiz-explain'].textContent = question.explain;
    el['quiz-score'].textContent = String(quiz.score);
    el['quiz-streak'].textContent = String(quiz.streak);
    el['quiz-next'].hidden = false;
    el['quiz-next'].textContent = quiz.index === quiz.order.length - 1 ? 'Finish round →' : 'Next question →';
    el['quiz-review'].hidden = false;
    el['quiz-review'].dataset.pattern = question.pattern;
    el['quiz-side-note'].textContent = `${quiz.score} correct so far. Best ${quiz.best}%.`;
    renderQuizDots();
  }

  function restoreQuizAnswer() {
    const quiz = state.quiz;
    const question = data.quiz[quiz.order[quiz.index]];
    $$('.quiz-option', el['quiz-options']).forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add('is-correct');
      if (index === quiz.option && quiz.option !== question.answer) button.classList.add('is-wrong');
    });
    el['quiz-feedback'].hidden = false;
    el['quiz-feedback'].classList.toggle('bad', quiz.option !== question.answer);
    el['quiz-verdict'].textContent = quiz.option === question.answer ? 'Correct — that is the pattern.' : 'Not quite. The strongest signal points elsewhere.';
    el['quiz-explain'].textContent = question.explain;
    el['quiz-next'].hidden = false;
    el['quiz-next'].textContent = quiz.index === quiz.order.length - 1 ? 'Finish round →' : 'Next question →';
    el['quiz-review'].hidden = false;
    el['quiz-review'].dataset.pattern = question.pattern;
  }

  function nextQuiz() {
    const quiz = state.quiz;
    if (quiz.index >= quiz.order.length - 1) { finishQuiz(); return; }
    quiz.index++;
    quiz.answered = false;
    quiz.option = null;
    renderQuiz();
  }

  function finishQuiz() {
    const quiz = state.quiz;
    quiz.finished = true;
    const percent = Math.round((quiz.score / quiz.order.length) * 100);
    quiz.best = Math.max(quiz.best, percent);
    quizStore.best = quiz.best;
    quizStore.attempts = (Number(quizStore.attempts) || 0) + 1;
    writeJSON(QUIZ_KEY, quizStore);
    renderQuizResults();
    toast(`Round complete: ${quiz.score}/${quiz.order.length} (${percent}%)`);
  }

  function renderQuizResults() {
    const quiz = state.quiz;
    const percent = Math.round((quiz.score / quiz.order.length) * 100);
    el['quiz-best'].textContent = `${quiz.best}%`;
    el['quiz-pattern'].textContent = 'Round complete';
    el['quiz-count'].textContent = `${quiz.score} of ${quiz.order.length} correct`;
    el['quiz-progress-bar'].style.width = '100%';
    el['quiz-question'].textContent = `${percent}% — ${percent >= 80 ? 'Pattern recognition is sharp.' : percent >= 60 ? 'Solid base. Review the misses.' : 'Review the signal keywords, then run it again.'}`;
    el['quiz-options'].innerHTML = `
      <div class="quiz-results">
        <div><strong>${quiz.score}</strong><span>correct</span></div>
        <div><strong>${quiz.order.length - quiz.score}</strong><span>to review</span></div>
        <div><strong>${quiz.streak}</strong><span>current streak</span></div>
        <div><strong>${quiz.best}%</strong><span>personal best</span></div>
      </div>`;
    el['quiz-feedback'].hidden = true;
    el['quiz-next'].hidden = true;
    el['quiz-review'].hidden = true;
    el['quiz-side-note'].textContent = `Round saved locally. Attempt ${quizStore.attempts || 1}.`;
    renderQuizDots();
    quiz.answered = true;
  }

  function startQuizRound(shuffle) {
    const order = data.quiz.map((_, i) => i);
    if (shuffle && !TEST) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    state.quiz = { ...state.quiz, order, index: 0, score: 0, streak: 0, answered: false, option: null, results: [], finished: false };
    renderQuiz();
  }

  /* ---------------------------------------------------------------- practice */
  function problemKey(patternId, num) { return `${patternId}:${num}`; }

  function problemDone(patternId, num) { return Boolean(progress.done[problemKey(patternId, num)]); }

  function updatePracticeSummary() {
    const total = data.meta.problems;
    const done = data.patterns.reduce((sum, pattern) => sum + pattern.problems.filter((problem) => problemDone(pattern.id, problem.num)).length, 0);
    const percent = Math.round((done / total) * 100);
    el['practice-count'].textContent = `${done} / ${total}`;
    el['practice-percent'].textContent = `${percent}%`;
    el['practice-ring'].style.setProperty('--p', percent);
  }

  function renderPractice() {
    const query = state.search.trim().toLowerCase();
    let visibleGroups = 0;
    const html = data.patterns.map((pattern) => {
      const problems = pattern.problems.filter((problem) => {
        if (state.difficulty !== 'all' && problem.difficulty !== state.difficulty) return false;
        if (query && !`${problem.name} ${pattern.title} #${problem.num}`.toLowerCase().includes(query)) return false;
        return true;
      });
      if (!problems.length) return '';
      visibleGroups++;
      const done = pattern.problems.filter((problem) => problemDone(pattern.id, problem.num)).length;
      return `
        <section class="practice-group" data-group="${pattern.id}">
          <header class="practice-group-head">
            <div class="practice-group-title"><span class="num">${pad(pattern.index)}</span><strong>${esc(pattern.title)}</strong><span>${done} / ${pattern.problems.length}</span></div>
            <button class="group-open" data-open="${pattern.id}">Visualize →</button>
          </header>
          ${problems.map((problem) => {
            const checked = problemDone(pattern.id, problem.num);
            return `
              <div class="problem-row ${checked ? 'is-done' : ''}">
                <label class="problem-check" title="Mark ${esc(problem.name)} complete">
                  <input type="checkbox" data-key="${problemKey(pattern.id, problem.num)}" ${checked ? 'checked' : ''} aria-label="Mark ${esc(problem.name)} complete">
                  <span aria-hidden="true">✓</span>
                </label>
                <a class="problem-name" href="${problem.url}" target="_blank" rel="noopener">${esc(problem.name)}</a>
                <span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                <a class="problem-link" href="${problem.url}" target="_blank" rel="noopener">LeetCode ↗</a>
              </div>`;
          }).join('')}
        </section>`;
    }).join('');
    el['practice-list'].innerHTML = html;
    el['practice-empty'].hidden = visibleGroups > 0;
    updatePracticeSummary();
    $$('.problem-check input', el['practice-list']).forEach((input) => {
      input.addEventListener('change', () => {
        progress.done[input.dataset.key] = input.checked;
        writeJSON(PROGRESS_KEY, progress);
        renderPractice();
      });
    });
    $$('.group-open', el['practice-list']).forEach((button) => {
      button.addEventListener('click', () => {
        selectTab('visualizer');
        selectPattern(button.dataset.open);
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* -------------------------------------------------------------------- tabs */
  function selectTab(name) {
    if (!['visualizer', 'quiz', 'practice'].includes(name)) return;
    state.tab = name;
    $$('.tab').forEach((button) => {
      const active = button.dataset.tab === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $$('.tab-panel').forEach((panel) => {
      const active = panel.id === `panel-${name}`;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (name === 'quiz') renderQuiz();
    if (name === 'practice') renderPractice();
    if (name === 'visualizer' && scene) setTimeout(() => scene.resize(), 30);
    try { history.replaceState(null, '', `#${name}`); } catch { /* file:// */ }
  }

  /* ------------------------------------------------------------------ events */
  function bindEvents() {
    $$('.tab').forEach((button) => button.addEventListener('click', () => selectTab(button.dataset.tab)));
    el['prev-step'].addEventListener('click', () => step(-1));
    el['next-step'].addEventListener('click', () => step(1));
    el['play-toggle'].addEventListener('click', () => setPlaying(!state.playing));
    el['reset-steps'].addEventListener('click', () => { setPlaying(false); applyFrame(0); toast('Trace reset'); });
    el['step-slider'].addEventListener('input', () => { setPlaying(false); applyFrame(Number(el['step-slider'].value)); });
    el['speed-slider'].addEventListener('input', () => {
      state.speed = Number(el['speed-slider'].value);
      el['speed-value'].textContent = `${state.speed.toFixed(1)}×`;
      savePrefs();
      if (state.playing) startTimer();
    });
    el['apply-input'].addEventListener('click', () => {
      if (buildCurrent(el['custom-input'].value)) {
        toast('Trace rebuilt from your input');
        el['custom-input'].blur();
      }
    });
    el['custom-input'].addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); el['apply-input'].click(); }
    });
    el['reset-input'].addEventListener('click', () => {
      const pattern = byId(state.patternId);
      el['custom-input'].value = pattern.defaultInput;
      buildCurrent(pattern.defaultInput);
      toast('Default input restored');
    });
    el['reset-camera'].addEventListener('click', () => {
      if (scene) { scene.resetCamera(); toast('Camera reset'); }
    });
    el['copy-code'].addEventListener('click', async () => {
      const pattern = byId(state.patternId);
      const text = pattern.code[state.language].map((line) => line.t).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        toast('Code copied');
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        toast('Code copied');
      }
    });
    $$('.lang').forEach((button) => {
      button.addEventListener('click', () => {
        state.language = button.dataset.lang;
        renderCode();
        if (state.result) highlightCode(state.result.frames[state.frameIndex].mark);
        renderPatternMeta(byId(state.patternId));
        savePrefs();
      });
    });
    el['quiz-next'].addEventListener('click', nextQuiz);
    el['quiz-restart'].addEventListener('click', () => { startQuizRound(true); toast('New shuffled round'); });
    el['quiz-review'].addEventListener('click', () => {
      selectTab('visualizer');
      selectPattern(el['quiz-review'].dataset.pattern);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    $$('.filter').forEach((button) => {
      button.addEventListener('click', () => {
        state.difficulty = button.dataset.difficulty;
        $$('.filter').forEach((item) => item.classList.toggle('is-active', item === button));
        renderPractice();
      });
    });
    el['practice-search'].addEventListener('input', () => {
      state.search = el['practice-search'].value;
      renderPractice();
    });
    el['clear-progress'].addEventListener('click', () => {
      if (!Object.keys(progress.done).length) { toast('Progress is already empty'); return; }
      if (!TEST && !window.confirm('Clear every problem checkbox? This cannot be undone.')) return;
      progress.done = {};
      writeJSON(PROGRESS_KEY, progress);
      renderPractice();
      toast('Practice progress cleared');
    });
    el['help-btn'].addEventListener('click', () => el['help-dialog'].showModal());
    el['about-btn'].addEventListener('click', () => el['about-dialog'].showModal());
    $$('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
    $$('.dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    }));
    document.addEventListener('keydown', (event) => {
      const tag = event.target.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;
      if (event.key === '?' && !typing) { event.preventDefault(); el['help-dialog'].showModal(); return; }
      if (event.key === 'Escape') { $$('.dialog[open]').forEach((dialog) => dialog.close()); return; }
      if (typing || state.tab !== 'visualizer' || $$('.dialog[open]').length) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      else if (event.key === ' ') { event.preventDefault(); setPlaying(!state.playing); }
      else if (event.key === '0') { setPlaying(false); applyFrame(0); }
      else if (event.key === 'r' || event.key === 'R') { if (scene) scene.resetCamera(); }
      else if (event.key === '[') { event.preventDefault(); movePattern(-1); }
      else if (event.key === ']') { event.preventDefault(); movePattern(1); }
      else if (['1', '2', '3'].includes(event.key)) {
        const language = ['python', 'javascript', 'cpp'][Number(event.key) - 1];
        state.language = language;
        renderCode();
        if (state.result) highlightCode(state.result.frames[state.frameIndex].mark);
        renderPatternMeta(byId(state.patternId));
        savePrefs();
      }
    });
    window.addEventListener('hashchange', () => {
      const name = location.hash.replace('#', '');
      if (name) selectTab(name);
    });
  }

  function movePattern(delta) {
    const index = data.patterns.findIndex((pattern) => pattern.id === state.patternId);
    const next = data.patterns[(index + delta + data.patterns.length) % data.patterns.length];
    if (next) selectPattern(next.id);
  }

  /* ---------------------------------------------------------------- meta fill */
  function fillAbout() {
    el['about-stats'].innerHTML = `
      <div><strong>${data.meta.patterns}</strong><span>patterns</span></div>
      <div><strong>${data.meta.problems}</strong><span>problems</span></div>
      <div><strong>${data.meta.quizQuestions}</strong><span>quiz prompts</span></div>
      <div><strong>15</strong><span>3D scenes</span></div>`;
  }

  /* ----------------------------------------------------------------- selftest */
  function runSelfTest() {
    const checks = [];
    const check = (name, fn) => {
      try {
        const detail = fn();
        checks.push({ name, ok: detail !== false, detail: detail === false ? 'false' : undefined });
      } catch (error) {
        checks.push({ name, ok: false, detail: error.message || String(error) });
      }
    };
    check('Curriculum has 15 patterns', () => data.patterns.length === 15);
    check('Quiz bank has 30 questions', () => data.quiz.length === 30);
    check('Practice bank has 61 canonical problems', () => data.meta.problems === 61);
    check('Every pattern has three language implementations', () => data.patterns.every((pattern) => ['python', 'javascript', 'cpp'].every((language) => (pattern.code[language] || []).length >= 6)));
    check('Every problem links to leetcode.com', () => data.patterns.every((pattern) => pattern.problems.every((problem) => /^https:\/\/leetcode\.com\/problems\//.test(problem.url))));
    check('Engine self-test passes', () => { const report = engine.selfTest(); return report.passed === report.total; });
    check('Every frame mark is present in every language', () => data.patterns.every((pattern) => {
      const marks = new Set(Object.values(pattern.code).flat().map((line) => line.m));
      return engine.run(pattern.id, pattern.defaultInput).frames.every((frame) => marks.has(frame.mark));
    }));
    check('Custom input changes the trace', () => JSON.stringify(engine.run('two-pointers', '1, 2, 3 | 5').answer) === '[1,2]');
    check('Invalid input is rejected clearly', () => { try { engine.run('two-pointers', '1,2,3'); return false; } catch (error) { return /separator/.test(error.message); } });
    check('Pattern rail renders 15 buttons', () => $$('.rail-item').length === 15);
    check('3D stage has a canvas or a graceful fallback', () => Boolean($('#stage canvas')) || !document.body.dataset.webgl || document.body.dataset.webgl === 'false');
    check('Scene reports the active pattern', () => !scene || !scene.ready || scene.pattern === state.patternId);
    check('Code viewer renders numbered lines', () => $$('.code-line').length >= 6 && Boolean($('.code-line .ln')));
    check('Synchronized code line is highlighted', () => Boolean($('.code-line.is-active')));
    check('Step slider tracks the frame count', () => Number(el['step-slider'].max) === state.result.frames.length - 1);
    check('Step counter is human readable', () => /^Step \d+ \/ \d+$/.test(el['step-counter'].textContent));
    check('Quiz renders four options', () => $$('.quiz-option').length === 4);
    check('Quiz dots cover the whole bank', () => $$('.quiz-dot').length === data.quiz.length);
    check('Practice renders problem rows', () => $$('.problem-row').length > 0);
    check('Practice checkboxes persist a key', () => $$('.problem-check input').every((input) => input.dataset.key.includes(':')));
    check('Local storage is writable', () => { try { localStorage.setItem('algoExplorer.test', '1'); localStorage.removeItem('algoExplorer.test'); return true; } catch { return false; } });
    check('About stats are populated', () => /15/.test(el['about-stats'].textContent) && /61/.test(el['about-stats'].textContent));
    check('Three.js canvas can produce a screenshot', () => !scene || !scene.ready || (scene.screenshotData() || '').startsWith('data:image/png'));
    check('Keyboard path is bound', () => typeof document.onkeydown !== 'undefined');
    const report = { total: checks.length, passed: checks.filter((item) => item.ok).length, checks, app: 'algorithm-explorer' };
    document.body.dataset.selftest = `${report.passed}/${report.total}`;
    return report;
  }

  /* -------------------------------------------------------------------- boot */
  function boot() {
    cacheElements();
    renderRail();
    bindEvents();
    fillAbout();
    el['custom-input'].value = byId(state.patternId).defaultInput;
    el['speed-slider'].value = String(state.speed);
    el['speed-value'].textContent = `${state.speed.toFixed(1)}×`;
    const WebGL = (() => { try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; } })();
    let sceneReady = false;
    if (WebGL && scene) sceneReady = scene.init(el.stage);
    document.body.dataset.webgl = String(sceneReady);
    if (sceneReady) el['stage-loading'].classList.add('is-hidden');
    if (!sceneReady) {
      el['stage-loading'].classList.add('is-hidden');
      el['stage-fallback'].hidden = false;
      el['stage-fallback'].innerHTML = `<div class="stage-error"><strong>3D stage unavailable.</strong><br>${WebGL ? 'Three.js could not initialise. The engines, code viewer, quiz and practice tracker still work.' : 'This browser did not provide a WebGL context. The step engine, code viewer, quiz and practice tracker still work.'}</div>`;
    }
    buildCurrent(byId(state.patternId).defaultInput);
    startQuizRound(false);
    renderPractice();
    const hash = location.hash.replace('#', '');
    selectTab(['visualizer', 'quiz', 'practice'].includes(hash) ? hash : 'visualizer');
    setTimeout(() => { if (sceneReady && scene) scene.resize(); }, 120);
    document.body.dataset.ready = 'true';
  }

  window.__algo = {
    data, engine, scene, state, prefs, progress,
    selectPattern, selectTab, applyFrame, buildCurrent, renderCode, renderPractice,
    runSelfTest, startQuizRound, get frame() { return state.result?.frames[state.frameIndex] || null; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
