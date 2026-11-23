import './sandboxCheckout.css';

const METHOD_OPTIONS = [
  ['upi', 'UPI', 'Test UPI ID: success@razorpay · Instant test verification'],
  ['card', 'Card', 'Test Visa Card: 4111 •••• •••• 1111 · Exp 12/29 · CVV 123'],
  ['netbanking', 'Netbanking', 'Test Netbanking: BISEN Demo Bank (Instant approval)'],
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function openSandboxCheckout(data, onSubmit) {
  return new Promise((resolve, reject) => {
    const previouslyFocused = document.activeElement;
    const rupeeAmount = Number(data.amount || 0) / 100;
    const formattedAmount = `₹${rupeeAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    let selectedMethod = 'upi';
    let busy = false;
    let settled = false;

    const overlay = el('div', 'sbx-overlay');
    const modal = el('div', 'sbx-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sbx-title');

    const head = el('div', 'sbx-head');
    const headMeta = el('div', 'sbx-head-meta');
    const brand = el('div', 'sbx-brand', 'BISEN Studio');
    brand.id = 'sbx-title';
    const refLine = el('div', 'sbx-ref', `Order ${data.reference || ''}`);
    headMeta.append(brand, refLine);

    const headRight = el('div', 'sbx-head-right');
    const amountEl = el('div', 'sbx-amount', formattedAmount);
    const closeBtn = el('button', 'sbx-close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close test payment checkout');
    headRight.append(amountEl, closeBtn);
    head.append(headMeta, headRight);

    const banner = el('div', 'sbx-banner', 'LOCAL TEST MODE · NO REAL MONEY CHARGED');
    const body = el('div', 'sbx-body');

    const prefillParts = [
      data.prefill?.name,
      data.prefill?.contact,
      data.prefill?.email,
    ].filter(Boolean);
    if (prefillParts.length) {
      body.append(el('div', 'sbx-customer', prefillParts.join(' · ')));
    }

    body.append(el('span', 'sbx-label', 'Choose simulated payment method'));

    const tabs = el('div', 'sbx-tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Simulated payment method');
    const methodBox = el('div', 'sbx-method-box', METHOD_OPTIONS[0][2]);
    const tabButtons = METHOD_OPTIONS.map(([id, label, copy]) => {
      const btn = el('button', 'sbx-tab', label);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', id === selectedMethod ? 'true' : 'false');
      btn.addEventListener('click', () => {
        if (busy) return;
        selectedMethod = id;
        methodBox.textContent = copy;
        for (const [optId, ,] of METHOD_OPTIONS) {
          const target = tabButtons.find(item => item.dataset.method === optId);
          if (target) target.setAttribute('aria-pressed', optId === id ? 'true' : 'false');
        }
      });
      btn.dataset.method = id;
      tabs.append(btn);
      return btn;
    });

    const errorBox = el('div', 'sbx-error');
    errorBox.hidden = true;
    errorBox.setAttribute('role', 'alert');

    const actions = el('div', 'sbx-actions');
    const successBtn = el('button', 'sbx-btn-success', `Simulate Successful Payment · ${formattedAmount}`);
    successBtn.type = 'button';
    const failBtn = el('button', 'sbx-btn-fail', 'Simulate Failed Payment');
    failBtn.type = 'button';
    actions.append(successBtn, failBtn);

    body.append(tabs, methodBox, errorBox, actions);

    const foot = el(
      'div',
      'sbx-foot',
      'Simulated locally for development testing. Connect Razorpay keys in /studio → Payments for real checkout.',
    );

    modal.append(head, banner, body, foot);
    overlay.append(modal);

    const setBusy = nextBusy => {
      busy = nextBusy;
      closeBtn.disabled = nextBusy;
      successBtn.disabled = nextBusy;
      failBtn.disabled = nextBusy;
      for (const btn of tabButtons) btn.disabled = nextBusy;
      successBtn.textContent = nextBusy
        ? 'Verifying test payment…'
        : `Simulate Successful Payment · ${formattedAmount}`;
    };

    const cleanup = () => {
      document.removeEventListener('keydown', onKeyDown);
      overlay.remove();
      previouslyFocused?.focus?.();
    };

    const dismiss = () => {
      if (busy || settled) return;
      settled = true;
      cleanup();
      reject(new Error('Payment checkout was closed. Your order is saved; you can pay again from its tracking page.'));
    };

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
      }
    };

    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) dismiss();
    });

    const submitOutcome = async outcome => {
      if (busy || settled) return;
      errorBox.hidden = true;
      errorBox.textContent = '';
      setBusy(true);
      try {
        const result = await onSubmit(outcome, selectedMethod);
        settled = true;
        cleanup();
        resolve(result);
      } catch (error) {
        if (error?.order) {
          settled = true;
          cleanup();
          reject(error);
          return;
        }
        setBusy(false);
        errorBox.textContent = error?.message || 'Could not complete the simulated payment.';
        errorBox.hidden = false;
      }
    };

    successBtn.addEventListener('click', () => submitOutcome('captured'));
    failBtn.addEventListener('click', () => submitOutcome('failed'));

    document.addEventListener('keydown', onKeyDown);
    document.body.append(overlay);
    successBtn.focus();
  });
}
