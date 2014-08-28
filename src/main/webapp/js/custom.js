/*
 * The MIT License
 * Copyright (c) 2011 Kuali Mobility Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
$(document).ready(function () {

    //console.log("JS: SETUP APPCACHE LISTENER");
    window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          // Swap it in and reload the page to get the new version.
          //console.log("JS: APPCACHE UPDATED!!!");
          window.applicationCache.swapCache();
          //window.location.reload();
        } else {
          // Manifest didn't changed. Nothing new yet.
        }
      }, false);    

});

function loadMap(iframeSRC){
    var i = $("#collapseGoogle").find('iframe');
    i.delay(250).attr('src', iframeSRC);
}

function evaluationFormSubmission(formID, loaderID, completeID, buttonID){
    $("#"+formID).submit();
    $("#"+loaderID).show();
    setTimeout( 'killEvaluationFormSubmissionLoader("'+loaderID+'")', 900);
    setTimeout( 'showEvaluationFormSubmissionComplete("'+completeID+'")', 910);
    setTimeout( 'disableEvaluationFormSubmissionButton("'+buttonID+'")', 10);
}

function disableEvaluationFormSubmissionButton(buttonID){
    $("#"+buttonID).addClass("disabled");
}
function killEvaluationFormSubmissionLoader(loaderID){
    $("#"+loaderID).hide();   
}

function showEvaluationFormSubmissionComplete(completeID){
    $("#"+completeID).show();

    // hack to hide forms on home/dashboard screen
    $( "#HomepageEvalForm01" ).fadeOut( 1600 );
    $( "#HomepageEvalForm02" ).fadeOut( 1600 );
}