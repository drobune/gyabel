var webshot = require('webshot'),
    FeedParser = require('feedparser'),
    fs = require('fs'),
    EventEmitter = require('events')

fs.createReadStream('./data/test')
  .on('error', function (error) {
    console.error(error)
  })
  .pipe(new FeedParser())
  .on('error', function (error) {
    console.error(error)
  })
  .on('meta', function (meta) {
    console.log('===== %s =====', meta.title)
  })
  .on('readable', function() {
    var stream = this, item
    while (item = stream.read()) {
      console.log('Got article: %s', item.title || item.description)
      capture(item.date, item.title, item.link)
    }
  })

function capture (id, title, link){
  var renderStream = webshot(link)
  var file = fs.createWriteStream('./temp/' + id, {encoding: 'binary'})
  renderStream.on('data', function(data) {
    file.write(data.toString('binary'), 'binary')
  })
}

//function gyazo (image_path, metadata, url){
//}
