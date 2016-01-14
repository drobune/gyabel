var webshot = require('webshot'),
    FeedParser = require('feedparser'),
    fs = require('fs'),
    EventEmitter = require('events'),
    request = require('request'),
    FormData = require('form-data')

const gyazoId = fs.readFileSync(process.env.HOME + '/.gyazo.id', 'utf8')

var items = []

fs.createReadStream('./dump')
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
      items.push(item)
    }
  })
  .on('end', function() {
    console.log('Got %d articles', items.length)
    var i = 0, l = items.length
    function delayCapture() {
      capture(items[i].date, items[i].title, items[i].link)
      if(++i<l){
        setTimeout(delayCapture, 5000)
      } else {
        return
      }
    }
    delayCapture()
  })

function capture (id, title, link){
  var tmpImagePath = './temp/' + id + '.png'
  webshot(link, tmpImagePath, function(err){
    if (err) {
      return
    }
    gyazo(tmpImagePath, title, link)
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
  try {
    var form = new FormData()
    form.append('id', gyazoId)
    form.append('metadata', JSON.stringify({ app: 'gyabel', title: title, url: url}))
    form.append('imagedata', fs.createReadStream(image_path))

    form.submit('http://upload.gyazo.com/upload.cgi', function(err, res) {
      res.resume()
    })
  } catch(e) {
    console.log(e)
  }
}
