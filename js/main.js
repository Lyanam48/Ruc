// Shared utilities
const navigate = (url) => window.location.href = url;

const resolveHtml = (page) => {
  const base = window.location.pathname.includes('/html/') ? '' : 'html/';
  return base + page;
};
