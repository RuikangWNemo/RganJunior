const CONTACT_EMAIL = 'contact@rganjunior.org';

const AUDIENCE_LABELS = {
  'join-youth': '成为阿柑少年 / Youth',
  'join-parents': '成为阿柑家长 / Parent',
  'join-partners': '成为合作伙伴 / Partner',
};

const INTEREST_LABELS = {
  mountain: '山野探索 / Mountain exploration',
  field: '田野调查 / Field research',
  'urban-rural': '城乡行动 / Urban-rural action',
  collaboration: '课程 / 合作 / Course / partnership',
};

const FIELD_ENV = {
  audience: 'JOIN_GOOGLE_FORM_ENTRY_AUDIENCE',
  name: 'JOIN_GOOGLE_FORM_ENTRY_NAME',
  ageGrade: 'JOIN_GOOGLE_FORM_ENTRY_AGE_GRADE',
  organization: 'JOIN_GOOGLE_FORM_ENTRY_ORGANIZATION',
  city: 'JOIN_GOOGLE_FORM_ENTRY_CITY',
  contact: 'JOIN_GOOGLE_FORM_ENTRY_CONTACT',
  interests: 'JOIN_GOOGLE_FORM_ENTRY_INTERESTS',
  message: 'JOIN_GOOGLE_FORM_ENTRY_MESSAGE',
  language: 'JOIN_GOOGLE_FORM_ENTRY_LANGUAGE',
  submittedAt: 'JOIN_GOOGLE_FORM_ENTRY_SUBMITTED_AT',
  page: 'JOIN_GOOGLE_FORM_ENTRY_PAGE',
};

const REQUIRED_FIELD_KEYS = ['audience', 'name', 'contact', 'message', 'submittedAt'];

function sendJson(response, status, body) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(body);
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return request.body ? JSON.parse(request.body) : {};
  }

  if (Buffer.isBuffer(request.body)) {
    const text = request.body.toString('utf8');
    return text ? JSON.parse(text) : {};
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function compactString(value, maxLength = 220) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function compactMultiline(value, maxLength = 1800) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\n{3,}/g, '\n\n').slice(0, maxLength);
}

function normalizePayload(payload) {
  const audience = compactString(payload.audience, 40);
  const interests = Array.isArray(payload.interests)
    ? payload.interests.map((item) => compactString(item, 80)).filter(Boolean).slice(0, 8)
    : [];
  const interestLabels = interests.map((item) => INTEREST_LABELS[item] ?? item);

  return {
    audience,
    audienceLabel: AUDIENCE_LABELS[audience] ?? audience,
    name: compactString(payload.name, 120),
    ageGrade: compactString(payload.ageGrade, 120),
    organization: compactString(payload.organization, 160),
    city: compactString(payload.city, 120),
    contact: compactString(payload.contact, 180),
    interests,
    interestLabels,
    message: compactMultiline(payload.message),
    language: compactString(payload.language, 10) || 'zh',
    page: compactString(payload.page, 180) || '/join',
    consent: payload.consent === true,
    website: compactString(payload.website, 160),
    submittedAt: new Date().toISOString(),
  };
}

function validateSubmission(submission) {
  if (!AUDIENCE_LABELS[submission.audience]) {
    return 'INVALID_AUDIENCE';
  }

  if (!submission.name) {
    return 'MISSING_NAME';
  }

  if (!submission.contact) {
    return 'MISSING_CONTACT';
  }

  if (!submission.message) {
    return 'MISSING_MESSAGE';
  }

  if (!submission.consent) {
    return 'MISSING_CONSENT';
  }

  return null;
}

function getGoogleFormActionUrl() {
  const rawUrl = process.env.JOIN_GOOGLE_FORM_ACTION_URL?.trim();

  if (!rawUrl) {
    return '';
  }

  return rawUrl.replace('/viewform', '/formResponse');
}

function assertGoogleFormConfig() {
  const missing = [];

  if (!getGoogleFormActionUrl()) {
    missing.push('JOIN_GOOGLE_FORM_ACTION_URL');
  }

  for (const key of REQUIRED_FIELD_KEYS) {
    const envName = FIELD_ENV[key];

    if (!process.env[envName]?.trim()) {
      missing.push(envName);
    }
  }

  return missing;
}

function appendField(params, key, value) {
  const entryId = process.env[FIELD_ENV[key]]?.trim();

  if (!entryId) {
    return;
  }

  const values = Array.isArray(value) ? value : [value];

  for (const item of values) {
    if (item) {
      params.append(entryId, item);
    }
  }
}

async function submitToGoogleForm(submission) {
  const missingConfig = assertGoogleFormConfig();

  if (missingConfig.length > 0) {
    const error = new Error(`Missing Google Form configuration: ${missingConfig.join(', ')}`);
    error.code = 'MISSING_GOOGLE_FORM_CONFIG';
    throw error;
  }

  const params = new URLSearchParams();

  appendField(params, 'audience', submission.audienceLabel);
  appendField(params, 'name', submission.name);
  appendField(params, 'ageGrade', submission.ageGrade);
  appendField(params, 'organization', submission.organization);
  appendField(params, 'city', submission.city);
  appendField(params, 'contact', submission.contact);
  appendField(params, 'interests', submission.interestLabels);
  appendField(params, 'message', submission.message);
  appendField(params, 'language', submission.language);
  appendField(params, 'submittedAt', submission.submittedAt);
  appendField(params, 'page', submission.page);

  const googleResponse = await fetch(getGoogleFormActionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: params,
    redirect: 'manual',
  });

  if (![200, 302, 303].includes(googleResponse.status)) {
    const error = new Error(`Google Form rejected submission with status ${googleResponse.status}`);
    error.code = 'GOOGLE_FORM_REJECTED';
    throw error;
  }
}

async function notifyWebhook(submission) {
  const webhookUrl = process.env.JOIN_NOTIFICATION_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: CONTACT_EMAIL,
      subject: `新的阿柑少年加入申请：${submission.name}`,
      submission,
    }),
  });

  if (!response.ok) {
    throw new Error(`Notification webhook failed with status ${response.status}`);
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  let payload;

  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return sendJson(response, 400, { ok: false, code: 'INVALID_JSON' });
  }

  const submission = normalizePayload(payload);

  if (submission.website) {
    return sendJson(response, 200, { ok: true });
  }

  const validationError = validateSubmission(submission);

  if (validationError) {
    return sendJson(response, 400, { ok: false, code: validationError });
  }

  try {
    await submitToGoogleForm(submission);

    try {
      await notifyWebhook(submission);
    } catch (notificationError) {
      console.error(notificationError);
    }

    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error(error);

    if (error.code === 'MISSING_GOOGLE_FORM_CONFIG') {
      return sendJson(response, 500, {
        ok: false,
        code: error.code,
        message: 'Join form is not configured yet.',
      });
    }

    return sendJson(response, 502, {
      ok: false,
      code: error.code || 'SUBMISSION_FAILED',
      message: 'Join form submission failed.',
    });
  }
}
