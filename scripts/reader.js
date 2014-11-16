sys.reader = function (file) {
  var reader = new FileReader();
  var eventEmitter = new events.EventEmitter;

  reader.onloadend = function (e) {
    if (e.target.readyState == FileReader.DONE) {
      eventEmitter.emit('end', e.target.result);
    }
  };

  var blob = file.slice(0, file.size);
  reader.readAsBinaryString(blob);

  return eventEmitter;
}
