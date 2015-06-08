/*
 * Detect if the referrer is a referral spammer and prevent google analytics
 * loading if that is the case.
 *
 * @author Cooper Maruyama
 * @website convertify.io
 */

// Runs if referrer is valid.
window.trackVisitor = function() {
  // Your analytics script goes here.
  alert('track');
}

/*======================================================
=    Don't edit anything below!
======================================================*/

(function(document, trackVisitor) {
  var BLACKLIST_URL="https://s3.amazonaws.com/s3.convertify.io/spammers.txt";

  // Fetch blacklist and perform validation.
  var request = new XMLHttpRequest();
  request.open('GET', BLACKLIST_URL, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        // Parse the list
        var data = this.responseText;
        validateReferrer(data, function(err, isValid) {
          if (isValid) {
            trackVisitor();
          } else {
            // Spam detected! bypass tracking.
          }
        });
      } else {
        // AJAX request failed. Track anyways.
        trackVisitor();
      }
    }
  };

  request.send();
  request = null;

  /**
   *  Validates referrer against a blacklist of known spammers.
   *
   *  @param   {String}   blacklist - Blacklist of known spammers, delimited by
   *                                  new line.
   *
   *  @param   {Function} callback  - Callback to call. Passes an error as the
   *                                  as the 1st argument or null if no error.
   *                                  Passes true as the 2nd argument if the
   *                                  visitor is valid, or false if the visitor
   *                                  is a spammer and should not be tracked.
   *
   *
   *  @return  {Null}
   */
  var validateReferrer = function (blacklist, callback) {
    var badReferrers = blacklist.split('\n');
    var isReferrerBad = false;
    var listLength = badReferrers.length - 1;

    for (i = 0; i < listLength; i++) {
      var re = new RegExp(badReferrers[i]);
      if ( re.test(document.referrer) ) {
        isReferrerBad = true;
        break;
      }
    }
    if (!isReferrerBad) {
      callback(null, true);
    } else {
      // Referral spam detected!
      callback(null, false);
    }
  };
})(document, window.trackVisitor);

