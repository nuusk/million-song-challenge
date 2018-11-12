const files = [`${__dirname}/../listenActivities.txt`, `${__dirname}/../tracks.txt`];

var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(files[0]);

lr.on('error', function (err) {
	// 'err' contains error object
});

lr.on('line', function (line) {
  console.log(line);
});

lr.on('end', function () {
	// All lines are read, file is closed now.
});