var fs = require('fs');
var utils = require('utils');

casper.options.verbose = true;
casper.options.logLevel = 'error'; // debug
casper.options.timeout = 120 * 1000;
casper.options.pageSettings = {
  loadImages: true,
  loadPlugins: false,
  userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
};
casper.options.viewportSize = {
  width: 1280,
  height: 800
};

casper.on('resource.error', function(resource) {
  if (!resource.url.match(/google-analytics\.com/) &&
    !resource.url.match(/fonts\.net/) &&
    !resource.url.match(/twimg\.net/)
  ) {
    this.echo(resource.url + " not found.", "RED_BAR");
  }
});

casper.on('open', function (location) {
  this.echo(location + ' opened');
});

var sites = casper.cli.get("sites").split(" ");
var siteURLs = [];
var limit = ~~casper.cli.get("limit") || 20;
var numberOfSuccess = 6 * limit + 6;

casper.each(sites, function (self, site) {
  casper.test.begin('Testing ' + site, numberOfSuccess, function suite(test) {
    casper.start(site, function() {
      siteURLs = [];
      this.echo(this.getTitle());
      globalPageTests(test);

      var links = this.evaluate(function() {
        links = document.getElementsByTagName('a');
        links = Array.prototype.map.call(links,function(link){
          return link.getAttribute('href');
        });
        return links;
      });

      // Add newly found URLs to the stack
      var baseUrl = this.getGlobal('location').origin;
      Array.prototype.forEach.call(links, function(link) {
        var addLink = true;

        // Ensure this link is not an in-page hyperlink.
        if (link.match(/^#.*/)) {
          addLink = false;
        }

        // We have already tested the homepage.
        else if (link.match(/^\/$/)) {
          addLink = false;
        }

        // Ensure this link is on the same domain
        else if (link.match(/^https?:\/\/.*/) && link.indexOf(baseUrl) !== 0) {
          addLink = false;
        }

        if (addLink) {
          var newUrl = absoluteUri(baseUrl, link);
          if (siteURLs.indexOf(newUrl) == -1) {
            if (siteURLs.length < limit) {
              casper.echo(casper.colorizer.format('-> Pushed ' + newUrl + ' onto the stack', { fg: 'magenta' }));
              siteURLs.push(newUrl);
            }
          }
        }
      });
    });

    casper.then(function() {
      casper.each(siteURLs, function(self, link) {
        casper.thenOpen(link, function(a) {
          globalPageTests(test);
        });
      });
    });

    casper.run(function() {
      test.done();
    });
  });
});
