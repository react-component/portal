/**
 * Test usage export. Do not use in your production
 */
export function isBodyOverflowing() {
  if (window.getComputedStyle(document.body).overflowY === 'scroll')
    return true;

  return (
    document.body.scrollHeight >
      (window.innerHeight || document.documentElement.clientHeight) &&
    window.innerWidth > document.body.offsetWidth
  );
}
