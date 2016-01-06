var webshot = require('webshot'),
    FeedParser = require('feedparser'),
    fs = require('fs'),
    EventEmitter = require('events'),
    request = require('request'),
    FormData = require('form-data')

const gyazoId = fs.readFileSync(process.env.HOME + '/.gyazo.id', 'utf8')


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
  //var renderStream = webshot(link)
  //renderStream.setMaxListeners(2)
  //  renderStream.on('finish', function(data) {
  //  writeImage(data)
  //})
  var tmpImagePath = './temp/' + id + '.png'
  webshot(link, tmpImagePath, function(err){
    gyazo(tmpImagePath, title, link)
  })
}

function writeImage (data){
  var file = fs.createWriteStream('./temp/' + id, {encoding: 'binary'})
  file.write(data.toString('binary'), 'binary')
  file.end()
  file.on('finish', function() {
    console.log('all writes are now complete.')
  })
}



function gyazo (image_path, title, url){
  /* うまくいかなかった
     var formData = {
     id: gyazoId,
     imageData: fs.createReadStream(image_path),
     metadata: {
     app: 'gyabel',
     title: title,
     url: url
     }
     }

     request.post(
     {
     url:'http://upload.gyazo.com/upload.cgi',
     formData: formData
     },
     function optionalCallback(err, httpResponse, body) {
     if (err) {
     return console.error('upload failed:', err)
     }
     console.log('Upload successful!  Server responded with:', body)
     }
     )
  */
  var form = new FormData()
  form.append('id', gyazoId)
  form.append('metadata', JSON.stringify({ app: 'gyabel', title: title, url: url}))
  form.append('imagedata', fs.createReadStream(image_path))

  form.submit('http://upload.gyazo.com/upload.cgi', function(err, res) {
    res.resume()
  })

}
