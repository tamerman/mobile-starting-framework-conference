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
'use strict';

/* Controllers */

function TwitterCtrl($scope, $rootScope, $route, $timeout, $window, twitterService){

    /*
        SET THE ACTIVE PAGE
    */
    $rootScope.setActivatePage($route.current.controller.replace("Ctrl",""));


    /*
        GLOBALS
    */
    var pullDownEl            = $window.document.getElementById('pullDown');
    var pullDownOffset        = pullDownEl.offsetHeight;
    var refreshBtnIcon        = $window.document.getElementById('refreshButtonIcon');
    var refreshBtnIconBaseCSS = "glyphicon glyphicon-refresh";

    $scope.searchTerm         = twitterService.getInfo().tweetSearchTerm;

    /*
        REFRESH ACTIOn
    */
    $scope.refresh = function(){
        $scope.getData();
        if(refreshBtnIcon){
            refreshBtnIcon.className = refreshBtnIconBaseCSS+' loading-rotation';
        }
    }

    /*
        PULL TO REFRESH SETUP
    */
    $scope.$parent.myScrollOptions = {
        'tweetWrapper': {
            snap: false,
            useTransition: true,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if (pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                } 
            },
            onScrollMove: function () {
                if (this.y > 5 && !pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'flip';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                    pullDownEl.className = '';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                    this.minScrollY = -pullDownOffset;
                }
            },
            onScrollEnd: function () {
                if (pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';
                    pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';                
                    $scope.refresh();
                } 
            }
        }
    };

    /*
        GRAB THE DATA, SET IT IN SCOPE
    */
    $scope.getData = function(){
        twitterService.getTweetsBySearch( twitterService.getInfo().tweetSearchTerm ).then(function(data){
            if(twitterService.getInfo().tweetSearchTerm2){
                $scope.BlendAnotherSearchToTweets(twitterService.getInfo().tweetSearchTerm2, data);
            }else{
                $scope.tweets  = data;
            }
        },function(response){ 
            console.log("Oops, could not get twitter data: "+response); 
            $scope.tweets = [{ "screenname":"Oops!", "avatar":"img/no-tweets.gif", "status" : "An internet connection is required to view the tweets." }];
        });

        if(twitterService.getInfo().tweetSearchTerm2){
        }
    }

    $scope.BlendAnotherSearchToTweets = function(_term, _tweets){
        twitterService.getTweetsBySearch( _term ).then(function(data){
            var combinedTweets      = [];
            var combinedTweetsDates = [];
            var combinedTweetsTmp   = [];
            var deDuped             = [];

            // filter out duplicates
            for(var t in data){
                var isDupe = false;

                for(var ot in _tweets){
                    if(data[t].id==_tweets[ot].id){ 
                        isDupe = true;
                        break;
                    }
                }

                if(!isDupe){
                    deDuped.push( data[t] );
                }
            }

            // combine tweets
            for(var t in deDuped){
                combinedTweetsTmp[deDuped[t].tweetedOnParsed] = deDuped[t];
                combinedTweetsDates.push(deDuped[t].tweetedOnParsed);
            }
            for(var ot in _tweets){
                combinedTweetsTmp[_tweets[ot].tweetedOnParsed] = _tweets[ot];
                combinedTweetsDates.push(_tweets[ot].tweetedOnParsed);
            }
            combinedTweetsDates.sort().reverse();

            for(var t in combinedTweetsDates){
                if( combinedTweetsTmp[ combinedTweetsDates[t] ].retweeted!="true" ){
                    combinedTweets.push( combinedTweetsTmp[ combinedTweetsDates[t] ] );
                }
            }

            $scope.tweets  = combinedTweets;
        },function(response){ 
            console.log("Oops, could not get twitter data: "+response); 
            $scope.tweets = _tweets;
        });
    }

    /*
        TWEETS LOADED, STOP ANIMATING BUTTON
    */
    $scope.tweetsLoaded = function(){
        if($scope.tweets[0].screenname!=""){
            //console.log("Tweets Loaded");
            $scope.$parent.myScroll['tweetWrapper'].refresh();
            if(refreshBtnIcon){
                refreshBtnIcon.className = refreshBtnIconBaseCSS;
            }
        }
    }


    // get them tweets
    $scope.getData();

}

