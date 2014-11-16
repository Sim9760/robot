app.before('ready', function () {

  app.router.get('/init', function (req, res) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      res.render('init.html', {}, function () {
        $('form').on('submit', function (e) {
          e.preventDefault();

          var files = $('form input[type="file"]').get(0).files;

          if (files.length < 1) {
            log.warn('No file specified');
            return;
          }

          var file = files[0];

          sys.reader(file).on('end', function (content) {
            if (file.type !== 'application/json') {
              log.warn('Invalid map type');
              return;
            }

            try {
              var json = JSON.parse(content);

              sys.map = json;

              log('Map found (' + file.size + ' bytes)');

              app.redirect('/');
            } catch (err) {
              log.warn('Invalid JSON');
            }
          });
        });
      });
    } else {
      var code = 409;
      var msg = 'Error: File APIs missing   (E' + code + ')';

      res.status(code).send(msg);
      log.warn(msg);
    }
  });

  app.router.get('/', function (req, res) {
    if (!sys.tileset) {
      res.end();

      sys.tileset = new Image();

      sys.tileset.src = 'www/assets/tileset.png';
      sys.tileset.onload  = function () { app.redirect('/'); };
      sys.tileset.onerror = function () { log.warn('Failed loading tileset'); };
    } else {

      res.render('map.html', {}, function () {
        drawMap();
      });

    }


    function drawMap() {
      var canvas = $('#render > canvas').get(0);
      var ctx = canvas.getContext('2d');

      var tileSize = {
        width:  sys.map.tilewidth,
        height: sys.map.tileheight
      };

      var mapSize = {
        width:  sys.map.width,
        height: sys.map.height
      };

      var mapOffset = {
        x: (mapSize.width / 2 - 0.5) * tileSize.width,
        y: 0
      };

      var tileset = sys.map.tilesets[0];
      var tilesetSize = {
        width: tileset.imagewidth / tileSize.width,
        height: tileset.imageheight / tileSize.height
      };

      var data = sys.map.layers[0].data;

      canvas.width  = mapSize.width  * tileSize.width;
      canvas.height = mapSize.height * tileSize.height;

      var tileId, tile;

      for (var i = 0; i < data.length; i++) {
        var x = i % mapSize.width;
        var y = Math.floor(i / mapSize.width);

        tileId = data[i];

        if (tileId !== 0) {
          tileId--;
          tile = {
            x: tileId % tilesetSize.width,
            y: Math.floor(tileId / tilesetSize.width)
          };

          ctx.drawImage(
            sys.tileset,
            tile.x * tileSize.width,
            tile.y * tileSize.height,
            tileSize.width,
            tileSize.height,
            (x - y) * tileSize.height + mapOffset.x,
            (x + y) * tileSize.height / 2 + mapOffset.y,
            tileSize.width,
            tileSize.height
          );
        }
      }
    }
  });

});
