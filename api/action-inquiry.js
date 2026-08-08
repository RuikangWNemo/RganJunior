const CONTACT_EMAIL = 'contact@rganjunior.org';

const PROGRAM_LABELS = {
  'life-experience-camp': '生活体验营 / Life Discovery Camp',
  'life-co-creation-camp': '生活共创营 / Life Co-creation Camp',
  'life-camp': '生活共创营 / Life Co-creation Camp',
  'action-group': "阿柑少年行动小组 / R'gan Junior Action Group",
  'public-projects': '青少年研究计划 / Youth Research Programme',
};

const FIELD_ENV = {
  program: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PROGRAM',
  name: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_NAME',
  participantProfile: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PARTICIPANT_PROFILE',
  city: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_CITY',
  preferredTime: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PREFERRED_TIME',
  partySize: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PARTY_SIZE',
  contact: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_CONTACT',
  question: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_QUESTION',
  language: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_LANGUAGE',
  submittedAt: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_SUBMITTED_AT',
  page: 'ACTION_INQUIRY_GOOGLE_FORM_ENTRY_PAGE',
};

const REQUIRED_FIELD_KEYS = [
  'program',
  'name',
  'participantProfile',
  'city',
  'preferredTime',
  'partySize',
  'contact',
  'question',
  'submittedAt',
];

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
    const value = request.body.toString('utf8');
    return value ? JSON.parse(value) : {};
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const value = Buffer.concat(chunks).toString('utf8');
  return value ? JSON.parse(value) : {};
}

function compactString(value, maxLength = 220) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function compactMultiline(value, maxLength = 1800) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\n{3,}/g, '\n\n').slice(0, maxLength);
}

function normalizePayload(payload) {
  const program = compactString(payload.program, 40);

  return {
    program,
    programLabel: PROGRAM_LABELS[program] ?? program,
    name: compactString(payload.name, 120),
    participantProfile: compactString(payload.participantProfile, 160),
    city: compactString(payload.city, 120),
    preferredTime: compactString(payload.preferredTime, 160),
    partySize: compactString(payload.partySize, 20),
    contact: compactString(payload.contact, 180),
    question: compactMultiline(payload.question),
    language: compactString(payload.language, 10) || 'zh',
    page: compactString(payload.page, 180) || '/programs/inquiry',
    consent: payload.consent === true,
    website: compactString(payload.website, 160),
    submittedAt: new Date().toISOString(),
  };
}

function validateSubmission(submission) {
  if (!PROGRAM_LABELS[submission.program]) return 'INVALID_PROGRAM';
  if (!submission.name) return 'MISSING_NAME';
  if (!submission.participantProfile) return 'MISSING_PARTICIPANT_PROFILE';
  if (!submission.city) return 'MISSING_CITY';
  if (!submission.preferredTime) return 'MISSING_PREFERRED_TIME';
  const partySize = Number(submission.partySize);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) return 'INVALID_PARTY_SIZE';
  if (!submission.contact) return 'MISSING_CONTACT';
  if (!submission.question) return 'MISSING_QUESTION';
  if (!submission.consent) return 'MISSING_CONSENT';
  return null;
}

function getGoogleFormActionUrl() {
  const rawUrl = process.env.ACTION_INQUIRY_GOOGLE_FORM_ACTION_URL?.trim();
  return rawUrl ? rawUrl.replace('/viewform', '/formResponse') : '';
}

function assertGoogleFormConfig() {
  const missing = [];

  if (!getGoogleFormActionUrl()) {
    missing.push('ACTION_INQUIRY_GOOGLE_FORM_ACTION_URL');
  }

  for (const key of REQUIRED_FIELD_KEYS) {
    const envName = FIELD_ENV[key];
    if (!process.env[envName]?.trim()) missing.push(envName);
  }

  return missing;
}

function appendField(params, key, value) {
  const entryId = process.env[FIELD_ENV[key]]?.trim();
  if (entryId && value) params.append(entryId, value);
}

async function submitToGoogleForm(submission) {
  const missingConfig = assertGoogleFormConfig();
  if (missingConfig.length > 0) {
    const error = new Error(`Missing Google Form configuration: ${missingConfig.join(', ')}`);
    error.code = 'MISSING_GOOGLE_FORM_CONFIG';
    throw error;
  }

  const params = new URLSearchParams();
  appendField(params, 'program', submission.programLabel);
  appendField(params, 'name', submission.name);
  appendField(params, 'participantProfile', submission.participantProfile);
  appendField(params, 'city', submission.city);
  appendField(params, 'preferredTime', submission.preferredTime);
  appendField(params, 'partySize', submission.partySize);
  appendField(params, 'contact', submission.contact);
  appendField(params, 'question', submission.question);
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
  const webhookUrl = process.env.ACTION_INQUIRY_NOTIFICATION_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: CONTACT_EMAIL,
      subject: `新的项目参与意向：${submission.programLabel} / ${submission.name}`,
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
  if (submission.website) return sendJson(response, 200, { ok: true });

  const validationError = validateSubmission(submission);
  if (validationError) return sendJson(response, 400, { ok: false, code: validationError });

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
        message: 'Action enquiry form is not configured yet.',
      });
    }

    return sendJson(response, 502, {
      ok: false,
      code: error.code || 'SUBMISSION_FAILED',
      message: 'Action enquiry submission failed.',
    });
  }
}
