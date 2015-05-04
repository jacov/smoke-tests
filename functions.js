// Turn a (possibly) relative URI into a full RFC 3986-compliant URI
// With minor modifications, courtesy: https://gist.github.com/Yaffle/1088850
function absoluteUri(base, href) {

  // Parse a URI and return its constituent parts
  function parseUri(url) {
    var match = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    return (match ? { href: match[0] || '', protocol: match[1] || '', authority: match[2] || '', host: match[3] || '', hostname: match[4] || '',
      port: match[5] || '', pathname: match[6] || '', search: match[7] || '', hash: match[8] || '' } : null);
  }

  // Resolve dots in the path
  function resolvePathDots(input) {
    var output = [];
    input.replace(/^(\.\.?(\/|$))+/, '')
      .replace(/\/(\.(\/|$))+/g, '/')
      .replace(/\/\.\.$/, '/../')
      .replace(/\/?[^\/]*/g, function (part) { part === '/..' ? output.pop() : output.push(part); });
    return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
  }

  // Parse base and href
  href = parseUri(href || '');
  base = parseUri(base || '');

  // Build and return the URI
  return !href || !base ? null : (href.protocol || base.protocol) +
  (href.protocol || href.authority ? href.authority : base.authority) +
  (resolvePathDots(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname))) +
  (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) + href.hash;

}

function globalPageTests(casp) {
  casp.test.assertHttpStatus(200);
  casp.test.assertExists('title');
  casp.test.assertDoesntExist('.warning');
  casp.test.assertDoesntExist('.error');
  casp.test.assertDoesntExist('.node-unpublished');
  casp.test.assertTextDoesntExist('PHP Fatal', 'page body does not contain "PHP Fatal"');

  // This is the required snippet to send all page views to a communal GA
  // bucket.
  //
  // drush vset googleanalytics_codesnippet_after "ga('create', 'UA-54970022-1', 'auto', {'name': 'govcms'}); ga('govcms.send', 'pageview', {'anonymizeIp': true});"
  casp.test.assertMatch(casp.getPageContent(), /.*UA-54970022-1.*/i, 'page body does contain "UA-54970022-1"');

  // Try to find a fonts.com broken font banner.
  casp.test.assertDoesntExist('#mti_wfs_colophon', 'No fonts.com banner found');
}
