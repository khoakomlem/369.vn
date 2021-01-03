chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    let coRef = 1;
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name === 'Origin') {
        details.requestHeaders[i].value = 'https://www.facebook.com';
      }
      if (details.requestHeaders[i].name === 'referer') {
        coRef = 0;
        details.requestHeaders[i].value = 'https://www.facebook.com';
      }
    }
    if(coRef){
      details.requestHeaders.push({name:'referer', value: 'https://www.facebook.com'});
    }
    return { requestHeaders: details.requestHeaders };
  },
  {urls: ['*://*.facebook.com/*']},
  [ 'blocking', 'requestHeaders', 'extraHeaders']
);