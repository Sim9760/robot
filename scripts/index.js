window.onerror = function () {
  alert('Erreur détectée');
  //location.reload();
};


var app = new Eagle.Application;
var sys = {};

app.displayErrors();

app.set('router.uriDisplay', 'none');
app.set('view.directory', './www/views');

app.bundle([
  'www/scripts/router',
  'www/scripts/reader'
]);

app.on('ready', function () {
  window.log = function (msg) {
    $('#status')
      .text(msg)
      .removeClass('warning');

    $('pre').html( $('pre').html() + '<br>' + msg );
  };

  window.log.warn = function (msg) {
    $('#status')
      .text(msg)
      .addClass('warning');

    $('pre').html( $('pre').html() + '<br><b>' + msg + '</b>' );
  };
});

app.before('ready', function () {
  setTimeout(function () {
    $('#loader').css('opacity', 0);

    setTimeout(function () {
      $('#loader').remove()
    }, 1000);
  }, 2000);
});

app.on('ready', function () {
  app.use(Eagle.logger);
  app.use(function (req, res, next) {
    log(req.method.toUpperCase() + ' ' + req.path);

    next();
  });

  app.use(app.router);

  app.use(function (req, res) {
    res.status(404).send(res.message);

    log.warn('Page not found (404)');
  });
});

app.run('/init');
