// api/_lib/auth-email/dispatch.ts
import { createHash } from "node:crypto";
import { createElement } from "react";
import { render } from "@react-email/components";

// api/_lib/auth-email/emails/auth/EmailChangeEmail.tsx
import { Text as Text4 } from "@react-email/components";

// api/_lib/auth-email/emails/copy.ts
var AUTH_EMAIL_COPY = {
  "zh-CN": {
    brand: "\u963F\u67D1\u5C11\u5E74",
    site: "rganjunior.org",
    common: {
      codeLabel: "\u6216\u8005\u8F93\u5165\u9A8C\u8BC1\u7801\uFF1A",
      expires: "\u9A8C\u8BC1\u7801\u6216\u94FE\u63A5\u5C06\u5728\u4E00\u6BB5\u65F6\u95F4\u540E\u5931\u6548\uFF0C\u8BF7\u52FF\u8F6C\u53D1\u3002",
      ignore: "\u5982\u679C\u4E0D\u662F\u4F60\u672C\u4EBA\u64CD\u4F5C\uFF0C\u53EF\u4EE5\u5FFD\u7565\u8FD9\u5C01\u90AE\u4EF6\u3002"
    },
    signup: {
      subject: "\u6B22\u8FCE\u6765\u5230\u963F\u67D1\u5C11\u5E74",
      preview: "\u786E\u8BA4\u90AE\u7BB1\uFF0C\u7EE7\u7EED\u5B8C\u6210\u963F\u67D1\u5C11\u5E74\u8D26\u53F7\u6CE8\u518C",
      title: "\u6B22\u8FCE\u6765\u5230\u963F\u67D1\u5C11\u5E74",
      body: "\u786E\u8BA4\u4F60\u7684\u90AE\u7BB1\uFF0C\u5C31\u53EF\u4EE5\u7EE7\u7EED\u5B8C\u6210\u8D26\u53F7\u6CE8\u518C\u3002",
      button: "\u786E\u8BA4\u90AE\u7BB1"
    },
    signIn: {
      subject: "\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u767B\u5F55\u9A8C\u8BC1\u7801",
      preview: (token) => `\u4F7F\u7528\u9A8C\u8BC1\u7801 ${token} \u767B\u5F55\u963F\u67D1\u5C11\u5E74`,
      title: "\u6B22\u8FCE\u56DE\u6765",
      body: "\u8FD9\u662F\u4F60\u7684\u767B\u5F55\u9A8C\u8BC1\u7801\uFF1A",
      button: "\u767B\u5F55\u963F\u67D1\u5C11\u5E74"
    },
    magicLink: {
      subject: "\u767B\u5F55\u963F\u67D1\u5C11\u5E74",
      preview: "\u4F7F\u7528\u4E00\u6B21\u6027\u94FE\u63A5\u6216\u9A8C\u8BC1\u7801\u767B\u5F55\u963F\u67D1\u5C11\u5E74",
      title: "\u767B\u5F55\u963F\u67D1\u5C11\u5E74",
      body: "\u4F7F\u7528\u4E0B\u9762\u7684\u4E00\u6B21\u6027\u94FE\u63A5\u7EE7\u7EED\u767B\u5F55\u3002",
      button: "\u767B\u5F55\u963F\u67D1\u5C11\u5E74"
    },
    recovery: {
      subject: "\u91CD\u65B0\u8BBE\u7F6E\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u5BC6\u7801",
      preview: "\u5B89\u5168\u5730\u91CD\u65B0\u8BBE\u7F6E\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u5BC6\u7801",
      title: "\u91CD\u65B0\u8BBE\u7F6E\u5BC6\u7801",
      body: "\u6211\u4EEC\u6536\u5230\u4E86\u91CD\u65B0\u8BBE\u7F6E\u5BC6\u7801\u7684\u8BF7\u6C42\u3002",
      button: "\u91CD\u65B0\u8BBE\u7F6E\u5BC6\u7801"
    },
    invite: {
      subject: "\u9080\u8BF7\u4F60\u52A0\u5165\u963F\u67D1\u5C11\u5E74",
      preview: "\u4F60\u6536\u5230\u4E86\u4E00\u5C01\u52A0\u5165\u963F\u67D1\u5C11\u5E74\u7684\u9080\u8BF7",
      title: "\u9080\u8BF7\u4F60\u52A0\u5165\u963F\u67D1\u5C11\u5E74",
      body: "\u4F60\u6536\u5230\u4E86\u4E00\u5C01\u52A0\u5165\u963F\u67D1\u5C11\u5E74\u7684\u9080\u8BF7\u3002",
      button: "\u63A5\u53D7\u9080\u8BF7"
    },
    emailChange: {
      subject: "\u786E\u8BA4\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u90AE\u7BB1\u53D8\u66F4",
      currentPreview: "\u8BF7\u5728\u5F53\u524D\u90AE\u7BB1\u786E\u8BA4\u8FD9\u6B21\u90AE\u7BB1\u53D8\u66F4",
      currentTitle: "\u5728\u5F53\u524D\u90AE\u7BB1\u786E\u8BA4\u53D8\u66F4",
      currentBody: (newEmail) => `\u6709\u4EBA\u7533\u8BF7\u5C06\u8D26\u53F7\u90AE\u7BB1\u66F4\u6539\u4E3A ${newEmail}\u3002\u8BF7\u5148\u5728\u5F53\u524D\u90AE\u7BB1\u786E\u8BA4\u3002`,
      currentButton: "\u786E\u8BA4\u90AE\u7BB1\u53D8\u66F4",
      newPreview: "\u8BF7\u786E\u8BA4\u8FD9\u662F\u4F60\u7684\u65B0\u90AE\u7BB1",
      newTitle: "\u786E\u8BA4\u4F60\u7684\u65B0\u90AE\u7BB1",
      newBody: "\u8BF7\u5728\u65B0\u90AE\u7BB1\u5B8C\u6210\u786E\u8BA4\uFF0C\u4EE5\u7EE7\u7EED\u8FD9\u6B21\u90AE\u7BB1\u53D8\u66F4\u3002",
      newButton: "\u786E\u8BA4\u65B0\u90AE\u7BB1"
    },
    reauthentication: {
      subject: "\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u5B89\u5168\u9A8C\u8BC1\u7801",
      preview: (token) => `\u4F7F\u7528\u5B89\u5168\u9A8C\u8BC1\u7801 ${token} \u7EE7\u7EED\u64CD\u4F5C`,
      title: "\u786E\u8BA4\u662F\u4F60\u672C\u4EBA",
      body: "\u8BF7\u4F7F\u7528\u4E0B\u9762\u7684\u9A8C\u8BC1\u7801\u7EE7\u7EED\u8FD9\u9879\u654F\u611F\u64CD\u4F5C\u3002"
    },
    security: {
      password: {
        subject: "\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u5BC6\u7801\u5DF2\u66F4\u6539",
        title: "\u5BC6\u7801\u5DF2\u66F4\u6539",
        body: "\u4F60\u7684\u8D26\u53F7\u5BC6\u7801\u6700\u8FD1\u5DF2\u88AB\u66F4\u6539\u3002"
      },
      email: {
        subject: "\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u90AE\u7BB1\u5DF2\u66F4\u6539",
        title: "\u90AE\u7BB1\u5730\u5740\u5DF2\u66F4\u6539",
        body: "\u4F60\u7684\u8D26\u53F7\u90AE\u7BB1\u5730\u5740\u6700\u8FD1\u5DF2\u88AB\u66F4\u6539\u3002"
      },
      phone: {
        subject: "\u4F60\u7684\u963F\u67D1\u5C11\u5E74\u624B\u673A\u53F7\u5DF2\u66F4\u6539",
        title: "\u624B\u673A\u53F7\u5DF2\u66F4\u6539",
        body: "\u4F60\u7684\u8D26\u53F7\u624B\u673A\u53F7\u6700\u8FD1\u5DF2\u88AB\u66F4\u6539\u3002"
      },
      identity_linked: {
        subject: "\u963F\u67D1\u5C11\u5E74\u8D26\u53F7\u65B0\u589E\u4E86\u767B\u5F55\u65B9\u5F0F",
        title: "\u65B0\u589E\u767B\u5F55\u65B9\u5F0F",
        body: "\u4F60\u7684\u8D26\u53F7\u6700\u8FD1\u5173\u8054\u4E86\u4E00\u79CD\u65B0\u7684\u767B\u5F55\u65B9\u5F0F\u3002"
      },
      identity_unlinked: {
        subject: "\u963F\u67D1\u5C11\u5E74\u8D26\u53F7\u79FB\u9664\u4E86\u767B\u5F55\u65B9\u5F0F",
        title: "\u79FB\u9664\u767B\u5F55\u65B9\u5F0F",
        body: "\u4F60\u7684\u8D26\u53F7\u6700\u8FD1\u79FB\u9664\u4E86\u4E00\u79CD\u767B\u5F55\u65B9\u5F0F\u3002"
      },
      mfa_enrolled: {
        subject: "\u963F\u67D1\u5C11\u5E74\u8D26\u53F7\u65B0\u589E\u4E86\u9A8C\u8BC1\u65B9\u5F0F",
        title: "\u65B0\u589E\u9A8C\u8BC1\u65B9\u5F0F",
        body: "\u4F60\u7684\u8D26\u53F7\u6700\u8FD1\u65B0\u589E\u4E86\u4E00\u79CD\u5B89\u5168\u9A8C\u8BC1\u65B9\u5F0F\u3002"
      },
      mfa_unenrolled: {
        subject: "\u963F\u67D1\u5C11\u5E74\u8D26\u53F7\u79FB\u9664\u4E86\u9A8C\u8BC1\u65B9\u5F0F",
        title: "\u79FB\u9664\u9A8C\u8BC1\u65B9\u5F0F",
        body: "\u4F60\u7684\u8D26\u53F7\u6700\u8FD1\u79FB\u9664\u4E86\u4E00\u79CD\u5B89\u5168\u9A8C\u8BC1\u65B9\u5F0F\u3002"
      },
      warning: "\u5982\u679C\u8FD9\u4E0D\u662F\u4F60\u672C\u4EBA\u5B8C\u6210\u7684\u64CD\u4F5C\uFF0C\u8BF7\u5C3D\u5FEB\u91CD\u8BBE\u5BC6\u7801\u5E76\u8054\u7CFB\u6211\u4EEC\u3002"
    }
  },
  en: {
    brand: "R-Gan Junior",
    site: "rganjunior.org",
    common: {
      codeLabel: "Or enter this verification code:",
      expires: "This code or link expires shortly. Do not forward it.",
      ignore: "If you did not request this, you can safely ignore this email."
    },
    signup: {
      subject: "Welcome to R-Gan Junior",
      preview: "Confirm your email to finish creating your R-Gan Junior account",
      title: "Welcome to R-Gan Junior",
      body: "Confirm your email to finish creating your account.",
      button: "Confirm email"
    },
    signIn: {
      subject: "Your R-Gan Junior sign-in code",
      preview: (token) => `Use ${token} to sign in to R-Gan Junior`,
      title: "Your R-Gan Junior sign-in code",
      body: "Use this verification code to sign in:",
      button: "Sign in to R-Gan Junior"
    },
    magicLink: {
      subject: "Sign in to R-Gan Junior",
      preview: "Use a single-use link or code to sign in to R-Gan Junior",
      title: "Sign in to R-Gan Junior",
      body: "Use the single-use link below to continue signing in.",
      button: "Sign in to R-Gan Junior"
    },
    recovery: {
      subject: "Reset your R-Gan Junior password",
      preview: "Securely reset your R-Gan Junior password",
      title: "Reset your password",
      body: "We received a request to reset your password.",
      button: "Reset password"
    },
    invite: {
      subject: "You are invited to join R-Gan Junior",
      preview: "You received an invitation to join R-Gan Junior",
      title: "You are invited to R-Gan Junior",
      body: "You received an invitation to join R-Gan Junior.",
      button: "Accept invitation"
    },
    emailChange: {
      subject: "Confirm your R-Gan Junior email change",
      currentPreview: "Confirm this email change from your current address",
      currentTitle: "Confirm from your current email",
      currentBody: (newEmail) => `A request was made to change your account email to ${newEmail}. Confirm it from your current email first.`,
      currentButton: "Confirm email change",
      newPreview: "Confirm that this is your new email",
      newTitle: "Confirm your new email",
      newBody: "Confirm this new email address to continue the change.",
      newButton: "Confirm new email"
    },
    reauthentication: {
      subject: "Your R-Gan Junior security code",
      preview: (token) => `Use security code ${token} to continue`,
      title: "Confirm it is you",
      body: "Use the verification code below to continue this sensitive action."
    },
    security: {
      password: {
        subject: "Your R-Gan Junior password was changed",
        title: "Your password was changed",
        body: "The password for your account was recently changed."
      },
      email: {
        subject: "Your R-Gan Junior email was changed",
        title: "Your email address was changed",
        body: "The email address for your account was recently changed."
      },
      phone: {
        subject: "Your R-Gan Junior phone number was changed",
        title: "Your phone number was changed",
        body: "The phone number for your account was recently changed."
      },
      identity_linked: {
        subject: "A sign-in method was added to R-Gan Junior",
        title: "A sign-in method was added",
        body: "A new sign-in method was recently linked to your account."
      },
      identity_unlinked: {
        subject: "A sign-in method was removed from R-Gan Junior",
        title: "A sign-in method was removed",
        body: "A sign-in method was recently removed from your account."
      },
      mfa_enrolled: {
        subject: "A verification method was added to R-Gan Junior",
        title: "A verification method was added",
        body: "A new security verification method was recently added to your account."
      },
      mfa_unenrolled: {
        subject: "A verification method was removed from R-Gan Junior",
        title: "A verification method was removed",
        body: "A security verification method was recently removed from your account."
      },
      warning: "If you did not make this change, reset your password and contact us immediately."
    }
  }
};
function emailCopy(locale) {
  return AUTH_EMAIL_COPY[locale];
}

// api/_lib/auth-email/emails/components/EmailButton.tsx
import { Button, Section } from "@react-email/components";
import { jsx } from "react/jsx-runtime";
function EmailButton({ href, label }) {
  return /* @__PURE__ */ jsx(Section, { style: { margin: "28px 0", textAlign: "center" }, children: /* @__PURE__ */ jsx(
    Button,
    {
      href,
      style: {
        backgroundColor: "#285848",
        borderRadius: "999px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "15px",
        fontWeight: 700,
        padding: "13px 24px",
        textDecoration: "none"
      },
      children: label
    }
  ) });
}

// api/_lib/auth-email/emails/components/EmailLayout.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section as Section3
} from "@react-email/components";

// api/_lib/auth-email/emails/components/EmailFooter.tsx
import { Hr, Link, Text } from "@react-email/components";
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
function EmailFooter({ locale }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx2(Hr, { style: { borderColor: "#e5ded0", margin: "32px 0 20px" } }),
    /* @__PURE__ */ jsxs(Text, { style: { color: "#718078", fontSize: "12px", lineHeight: "20px", margin: 0, textAlign: "center" }, children: [
      locale === "zh-CN" ? "\u963F\u67D1\u5C11\u5E74 \xB7 \u5728\u771F\u5B9E\u4E16\u754C\u4E2D\uFF0C\u957F\u6210\u81EA\u5DF1" : "R-Gan Junior \xB7 Grow into yourself in the real world",
      /* @__PURE__ */ jsx2("br", {}),
      /* @__PURE__ */ jsx2(Link, { href: "https://www.rganjunior.org", style: { color: "#285848", textDecoration: "none" }, children: "rganjunior.org" })
    ] })
  ] });
}

// api/_lib/auth-email/emails/components/EmailLogo.tsx
import { Img, Section as Section2, Text as Text2 } from "@react-email/components";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var LOGO_URL = "https://www.rganjunior.org/brand/rgan-junior-email-logo.png";
function EmailLogo({ locale }) {
  const brand = locale === "zh-CN" ? "\u963F\u67D1\u5C11\u5E74" : "R-Gan Junior";
  const alt = locale === "zh-CN" ? "\u963F\u67D1\u5C11\u5E74\u5B98\u65B9\u6807\u5FD7" : "Official R-Gan Junior logo";
  return /* @__PURE__ */ jsxs2(Section2, { style: { textAlign: "center" }, children: [
    /* @__PURE__ */ jsx3(
      Img,
      {
        alt,
        height: "64",
        src: LOGO_URL,
        style: { borderRadius: "18px", display: "inline-block" },
        width: "64"
      }
    ),
    /* @__PURE__ */ jsx3(Text2, { style: { color: "#24483b", fontSize: "17px", fontWeight: 700, margin: "12px 0 0" }, children: brand })
  ] });
}

// api/_lib/auth-email/emails/components/EmailLayout.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function EmailLayout({
  children,
  locale,
  preview,
  title
}) {
  return /* @__PURE__ */ jsxs3(Html, { lang: locale === "zh-CN" ? "zh-CN" : "en", children: [
    /* @__PURE__ */ jsx4(Head, {}),
    /* @__PURE__ */ jsx4(Preview, { children: preview }),
    /* @__PURE__ */ jsx4(Body, { style: { backgroundColor: "#f5f0e6", fontFamily: "Arial, Helvetica, sans-serif", margin: 0, padding: "28px 12px" }, children: /* @__PURE__ */ jsxs3(
      Container,
      {
        style: {
          backgroundColor: "#fffdf8",
          border: "1px solid #ebe2d3",
          borderRadius: "24px",
          boxShadow: "0 16px 44px rgba(42, 70, 58, 0.08)",
          margin: "0 auto",
          maxWidth: "580px",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsx4(Section3, { style: { backgroundColor: "#ea6a2a", height: "6px" } }),
          /* @__PURE__ */ jsxs3(Section3, { style: { padding: "34px 28px 30px" }, children: [
            /* @__PURE__ */ jsxs3(Section3, { "aria-hidden": "true", style: { color: "#ea6a2a", fontSize: "12px", letterSpacing: "8px", marginBottom: "22px", textAlign: "center" }, children: [
              "\u25CF ",
              /* @__PURE__ */ jsx4("span", { style: { color: "#5b8566" }, children: "\u2014" }),
              " \u25CF"
            ] }),
            /* @__PURE__ */ jsx4(EmailLogo, { locale }),
            /* @__PURE__ */ jsx4(
              Heading,
              {
                style: {
                  color: "#24483b",
                  fontSize: "28px",
                  fontWeight: 700,
                  letterSpacing: "-0.4px",
                  lineHeight: "38px",
                  margin: "30px 0 14px",
                  textAlign: "center"
                },
                children: title
              }
            ),
            children,
            /* @__PURE__ */ jsx4(EmailFooter, { locale })
          ] })
        ]
      }
    ) })
  ] });
}

// api/_lib/auth-email/emails/components/VerificationCode.tsx
import { Section as Section4, Text as Text3 } from "@react-email/components";

// api/_lib/auth-email/emails/format.ts
function formatVerificationCode(token) {
  const compact = token.replace(/\s+/g, "");
  if (compact.length === 6) return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  if (compact.length === 8) return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  return compact;
}

// api/_lib/auth-email/emails/components/VerificationCode.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function VerificationCode({ token }) {
  return /* @__PURE__ */ jsx5(
    Section4,
    {
      style: {
        backgroundColor: "#fff8ed",
        border: "1px solid #f2d3b6",
        borderRadius: "18px",
        margin: "18px 0 24px",
        padding: "18px 12px",
        textAlign: "center"
      },
      children: /* @__PURE__ */ jsx5(
        Text3,
        {
          style: {
            color: "#24483b",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "5px",
            lineHeight: "1.2",
            margin: 0
          },
          children: formatVerificationCode(token)
        }
      )
    }
  );
}

// api/_lib/auth-email/emails/styles.ts
var bodyTextStyle = {
  color: "#3f5049",
  fontSize: "15px",
  lineHeight: "25px",
  margin: "14px 0"
};

// api/_lib/auth-email/emails/auth/EmailChangeEmail.tsx
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function EmailChangeEmail(props) {
  const copy = emailCopy(props.locale);
  const current = props.recipientRole === "current";
  const title = current ? copy.emailChange.currentTitle : copy.emailChange.newTitle;
  const preview = current ? copy.emailChange.currentPreview : copy.emailChange.newPreview;
  const body = current ? copy.emailChange.currentBody(props.newEmail) : copy.emailChange.newBody;
  const button = current ? copy.emailChange.currentButton : copy.emailChange.newButton;
  return /* @__PURE__ */ jsxs4(EmailLayout, { locale: props.locale, preview, title, children: [
    /* @__PURE__ */ jsx6(Text4, { style: bodyTextStyle, children: body }),
    /* @__PURE__ */ jsx6(EmailButton, { href: props.confirmationUrl, label: button }),
    props.token ? /* @__PURE__ */ jsxs4(Fragment2, { children: [
      /* @__PURE__ */ jsx6(Text4, { style: bodyTextStyle, children: copy.common.codeLabel }),
      /* @__PURE__ */ jsx6(VerificationCode, { token: props.token })
    ] }) : null,
    /* @__PURE__ */ jsx6(Text4, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx6(Text4, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/emails/auth/InviteEmail.tsx
import { Text as Text5 } from "@react-email/components";
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function InviteEmail({ confirmationUrl: confirmationUrl2, locale }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs5(EmailLayout, { locale, preview: copy.invite.preview, title: copy.invite.title, children: [
    /* @__PURE__ */ jsx7(Text5, { style: bodyTextStyle, children: copy.invite.body }),
    /* @__PURE__ */ jsx7(EmailButton, { href: confirmationUrl2, label: copy.invite.button }),
    /* @__PURE__ */ jsx7(Text5, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx7(Text5, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/emails/auth/MagicLinkEmail.tsx
import { Text as Text6 } from "@react-email/components";
import { Fragment as Fragment3, jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
function MagicLinkEmail({ confirmationUrl: confirmationUrl2, locale, token }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs6(EmailLayout, { locale, preview: copy.magicLink.preview, title: copy.magicLink.title, children: [
    /* @__PURE__ */ jsx8(Text6, { style: bodyTextStyle, children: copy.magicLink.body }),
    confirmationUrl2 ? /* @__PURE__ */ jsx8(EmailButton, { href: confirmationUrl2, label: copy.magicLink.button }) : null,
    token ? /* @__PURE__ */ jsxs6(Fragment3, { children: [
      /* @__PURE__ */ jsx8(Text6, { style: bodyTextStyle, children: copy.common.codeLabel }),
      /* @__PURE__ */ jsx8(VerificationCode, { token })
    ] }) : null,
    /* @__PURE__ */ jsx8(Text6, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx8(Text6, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/emails/auth/PasswordResetEmail.tsx
import { Text as Text7 } from "@react-email/components";
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function PasswordResetEmail({ confirmationUrl: confirmationUrl2, locale }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs7(EmailLayout, { locale, preview: copy.recovery.preview, title: copy.recovery.title, children: [
    /* @__PURE__ */ jsx9(Text7, { style: bodyTextStyle, children: copy.recovery.body }),
    /* @__PURE__ */ jsx9(EmailButton, { href: confirmationUrl2, label: copy.recovery.button }),
    /* @__PURE__ */ jsx9(Text7, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx9(Text7, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/emails/auth/ReauthenticationEmail.tsx
import { Text as Text8 } from "@react-email/components";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function ReauthenticationEmail({ locale, token }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs8(EmailLayout, { locale, preview: copy.reauthentication.preview(formatVerificationCode(token)), title: copy.reauthentication.title, children: [
    /* @__PURE__ */ jsx10(Text8, { style: bodyTextStyle, children: copy.reauthentication.body }),
    /* @__PURE__ */ jsx10(VerificationCode, { token }),
    /* @__PURE__ */ jsx10(Text8, { style: bodyTextStyle, children: copy.common.expires })
  ] });
}

// api/_lib/auth-email/emails/auth/SecurityNotificationEmail.tsx
import { Text as Text9 } from "@react-email/components";
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
function SecurityNotificationEmail({ detail, locale, oldValue, value }) {
  const copy = emailCopy(locale);
  const notification = copy.security[detail];
  return /* @__PURE__ */ jsxs9(EmailLayout, { locale, preview: notification.subject, title: notification.title, children: [
    /* @__PURE__ */ jsx11(Text9, { style: bodyTextStyle, children: notification.body }),
    oldValue && value ? /* @__PURE__ */ jsxs9(Text9, { style: { ...bodyTextStyle, backgroundColor: "#f5f0e6", borderRadius: "12px", padding: "12px 14px" }, children: [
      oldValue,
      " \u2192 ",
      value
    ] }) : value ? /* @__PURE__ */ jsx11(Text9, { style: { ...bodyTextStyle, backgroundColor: "#f5f0e6", borderRadius: "12px", padding: "12px 14px" }, children: value }) : null,
    /* @__PURE__ */ jsx11(Text9, { style: bodyTextStyle, children: copy.security.warning })
  ] });
}

// api/_lib/auth-email/emails/auth/SignInCodeEmail.tsx
import { Text as Text10 } from "@react-email/components";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function SignInCodeEmail({ confirmationUrl: confirmationUrl2, locale, token }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs10(EmailLayout, { locale, preview: copy.signIn.preview(formatVerificationCode(token)), title: copy.signIn.title, children: [
    /* @__PURE__ */ jsx12(Text10, { style: bodyTextStyle, children: copy.signIn.body }),
    /* @__PURE__ */ jsx12(VerificationCode, { token }),
    confirmationUrl2 ? /* @__PURE__ */ jsx12(EmailButton, { href: confirmationUrl2, label: copy.signIn.button }) : null,
    /* @__PURE__ */ jsx12(Text10, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx12(Text10, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/emails/auth/SignupEmail.tsx
import { Text as Text11 } from "@react-email/components";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
function SignupEmail({ confirmationUrl: confirmationUrl2, locale, token }) {
  const copy = emailCopy(locale);
  return /* @__PURE__ */ jsxs11(EmailLayout, { locale, preview: copy.signup.preview, title: copy.signup.title, children: [
    /* @__PURE__ */ jsx13(Text11, { style: bodyTextStyle, children: copy.signup.body }),
    confirmationUrl2 ? /* @__PURE__ */ jsx13(EmailButton, { href: confirmationUrl2, label: copy.signup.button }) : null,
    /* @__PURE__ */ jsx13(Text11, { style: bodyTextStyle, children: copy.common.codeLabel }),
    /* @__PURE__ */ jsx13(VerificationCode, { token }),
    /* @__PURE__ */ jsx13(Text11, { style: bodyTextStyle, children: copy.common.expires }),
    /* @__PURE__ */ jsx13(Text11, { style: bodyTextStyle, children: copy.common.ignore })
  ] });
}

// api/_lib/auth-email/schema.ts
import { z } from "zod";
var AUTH_EMAIL_ACTIONS = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
  "reauthentication",
  "password_changed_notification",
  "email_changed_notification",
  "phone_changed_notification",
  "identity_linked_notification",
  "identity_unlinked_notification",
  "mfa_factor_enrolled_notification",
  "mfa_factor_unenrolled_notification"
];
var metadataSchema = z.record(z.unknown()).default({});
var emailActionSchema = z.enum(AUTH_EMAIL_ACTIONS);
var authEmailPayloadSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    new_email: z.union([z.string().email(), z.literal("")]).optional().default(""),
    phone: z.string().optional().default(""),
    app_metadata: metadataSchema,
    user_metadata: metadataSchema
  }).passthrough(),
  email_data: z.object({
    token: z.string().optional().default(""),
    token_hash: z.string().optional().default(""),
    redirect_to: z.string().optional().default(""),
    email_action_type: emailActionSchema,
    site_url: z.string().optional().default(""),
    token_new: z.string().optional().default(""),
    token_hash_new: z.string().optional().default(""),
    old_email: z.string().optional().default(""),
    old_phone: z.string().optional().default(""),
    provider: z.string().optional().default(""),
    factor_type: z.string().optional().default("")
  }).passthrough()
}).passthrough();
function normalizeLocale(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh-hans") return "zh-CN";
  return null;
}
function selectAuthEmailLocale(appMetadata, userMetadata) {
  return normalizeLocale(appMetadata.locale) ?? normalizeLocale(userMetadata.locale) ?? "zh-CN";
}

// api/_lib/auth-email/urls.ts
var PRODUCTION_ORIGINS = /* @__PURE__ */ new Set([
  "https://rganjunior.org",
  "https://www.rganjunior.org"
]);
function canonicalFallback(runtime) {
  return new URL(runtime.canonicalSiteUrl).origin;
}
function sanitizeAuthRedirect(candidate, runtime) {
  const fallback = canonicalFallback(runtime);
  try {
    const url = new URL(candidate);
    const allowedOrigins = new Set(PRODUCTION_ORIGINS);
    allowedOrigins.add(fallback);
    if (!runtime.production) {
      for (const previewOrigin of runtime.previewOrigins ?? []) {
        allowedOrigins.add(new URL(previewOrigin).origin);
      }
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        allowedOrigins.add(url.origin);
      }
    }
    if (!allowedOrigins.has(url.origin)) return fallback;
    if (runtime.production && url.protocol !== "https:") return fallback;
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}
function buildConfirmationUrl(input, runtime) {
  const confirmationUrl2 = new URL("/auth/v1/verify", runtime.supabaseUrl);
  confirmationUrl2.searchParams.set("token", input.tokenHash);
  confirmationUrl2.searchParams.set("type", input.action);
  confirmationUrl2.searchParams.set(
    "redirect_to",
    sanitizeAuthRedirect(input.redirectTo, runtime)
  );
  return confirmationUrl2.toString();
}

// api/_lib/auth-email/dispatch.ts
var AuthEmailDispatchError = class extends Error {
  constructor(message = "Invalid data for authentication email delivery") {
    super(message);
    this.name = "AuthEmailDispatchError";
  }
};
function required(value, field) {
  if (!value) throw new AuthEmailDispatchError(`Missing required auth email field: ${field}`);
  return value;
}
function idempotencyKey(webhookId, action, recipientRole) {
  const digest = createHash("sha256").update(`${webhookId}:${action}:${recipientRole}`).digest("hex").slice(0, 40);
  return `auth-${digest}`;
}
async function renderedDelivery(input) {
  const [html, text] = await Promise.all([
    render(input.node),
    render(input.node, { plainText: true })
  ]);
  return {
    action: input.action,
    html,
    idempotencyKey: idempotencyKey(input.webhookId, input.action, input.recipientRole),
    recipientRole: input.recipientRole,
    subject: input.subject,
    text,
    to: input.to
  };
}
function confirmationUrl(payload, runtime, tokenHash) {
  return buildConfirmationUrl({
    action: payload.email_data.email_action_type,
    redirectTo: payload.email_data.redirect_to,
    tokenHash: required(tokenHash, "token_hash")
  }, runtime);
}
function securityDetail(action) {
  switch (action) {
    case "password_changed_notification":
      return "password";
    case "email_changed_notification":
      return "email";
    case "phone_changed_notification":
      return "phone";
    case "identity_linked_notification":
      return "identity_linked";
    case "identity_unlinked_notification":
      return "identity_unlinked";
    case "mfa_factor_enrolled_notification":
      return "mfa_enrolled";
    case "mfa_factor_unenrolled_notification":
      return "mfa_unenrolled";
    default:
      throw new AuthEmailDispatchError(`Unsupported security notification action: ${action}`);
  }
}
function securityValues(payload) {
  switch (payload.email_data.email_action_type) {
    case "email_changed_notification":
      return { oldValue: payload.email_data.old_email, value: payload.user.email };
    case "phone_changed_notification":
      return { oldValue: payload.email_data.old_phone, value: payload.user.phone };
    case "identity_linked_notification":
    case "identity_unlinked_notification":
      return { value: payload.email_data.provider };
    case "mfa_factor_enrolled_notification":
    case "mfa_factor_unenrolled_notification":
      return { value: payload.email_data.factor_type };
    default:
      return {};
  }
}
async function buildEmailChangeDeliveries(payload, runtime, locale, webhookId) {
  const action = payload.email_data.email_action_type;
  const copy = emailCopy(locale);
  const newEmail = required(payload.user.new_email, "user.new_email");
  const hasSecureEmailChangeField = Boolean(
    payload.email_data.token_new || payload.email_data.token_hash_new
  );
  if (hasSecureEmailChangeField) {
    const currentToken = required(payload.email_data.token, "token");
    const currentHash = required(payload.email_data.token_hash_new, "token_hash_new");
    const newToken = required(payload.email_data.token_new, "token_new");
    const newHash = required(payload.email_data.token_hash, "token_hash");
    return Promise.all([
      renderedDelivery({
        action,
        node: createElement(EmailChangeEmail, {
          confirmationUrl: confirmationUrl(payload, runtime, currentHash),
          locale,
          newEmail,
          recipientRole: "current",
          token: currentToken
        }),
        recipientRole: "current",
        subject: copy.emailChange.subject,
        to: payload.user.email,
        webhookId
      }),
      renderedDelivery({
        action,
        node: createElement(EmailChangeEmail, {
          confirmationUrl: confirmationUrl(payload, runtime, newHash),
          locale,
          newEmail,
          recipientRole: "new",
          token: newToken
        }),
        recipientRole: "new",
        subject: copy.emailChange.subject,
        to: newEmail,
        webhookId
      })
    ]);
  }
  const token = required(payload.email_data.token_new || payload.email_data.token, "token");
  const tokenHash = required(payload.email_data.token_hash, "token_hash");
  return [await renderedDelivery({
    action,
    node: createElement(EmailChangeEmail, {
      confirmationUrl: confirmationUrl(payload, runtime, tokenHash),
      locale,
      newEmail,
      recipientRole: "new",
      token
    }),
    recipientRole: "new",
    subject: copy.emailChange.subject,
    to: newEmail,
    webhookId
  })];
}
async function buildAuthEmailDeliveries(payload, runtime, webhookId) {
  const action = payload.email_data.email_action_type;
  const locale = selectAuthEmailLocale(
    payload.user.app_metadata,
    payload.user.user_metadata
  );
  const copy = emailCopy(locale);
  const recipient = payload.user.email;
  if (action === "email_change") {
    return buildEmailChangeDeliveries(payload, runtime, locale, webhookId);
  }
  let node;
  let subject;
  switch (action) {
    case "signup":
      subject = copy.signup.subject;
      node = createElement(SignupEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
        token: required(payload.email_data.token, "token")
      });
      break;
    case "invite":
      subject = copy.invite.subject;
      node = createElement(InviteEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale
      });
      break;
    case "magiclink":
      subject = copy.magicLink.subject;
      node = createElement(MagicLinkEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
        token: payload.email_data.token
      });
      break;
    case "email":
      subject = copy.signIn.subject;
      node = createElement(SignInCodeEmail, {
        confirmationUrl: payload.email_data.token_hash ? confirmationUrl(payload, runtime, payload.email_data.token_hash) : void 0,
        locale,
        token: required(payload.email_data.token, "token")
      });
      break;
    case "recovery":
      subject = copy.recovery.subject;
      node = createElement(PasswordResetEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale
      });
      break;
    case "reauthentication":
      subject = copy.reauthentication.subject;
      node = createElement(ReauthenticationEmail, {
        locale,
        token: required(payload.email_data.token, "token")
      });
      break;
    default: {
      const detail = securityDetail(action);
      const notification = copy.security[detail];
      subject = notification.subject;
      node = createElement(SecurityNotificationEmail, {
        detail,
        locale,
        ...securityValues(payload)
      });
    }
  }
  return [await renderedDelivery({
    action,
    node,
    recipientRole: "primary",
    subject,
    to: recipient,
    webhookId
  })];
}
export {
  AuthEmailDispatchError,
  buildAuthEmailDeliveries
};
