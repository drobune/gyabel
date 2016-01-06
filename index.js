var webshot = require('webshot');
 
webshot('google.com', 'google.png', function(err) {
  // screenshot now saved to google.png 
});
