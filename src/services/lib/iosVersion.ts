export function iosVersion() {
  let v = (navigator.userAgent.toLowerCase().match(/os [\d._]*/gi) + '')
    .replace(/[^0-9|_.]/gi, '')
    .replace(/_/g, '.');
  v = v.split('.')[0];
  return parseInt(v);
}
