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

function ScheduleCtrl($scope,$rootScope,$http,$timeout,$route,$routeParams,$window,$log,$modal,scheduleService){

    /*
        SET THE ACTIVE PAGE
    */
    $rootScope.setActivatePage($route.current.controller.replace("Ctrl",""));
    $scope.favorites        = store.get('favoriteSessions');
    $scope.conferenceDates  = scheduleService.getConferenceDates();
    $scope.sessionId        = $routeParams.sessionId && $routeParams.sessionId || null; 
    $scope.swipedItemId     = false;
    $scope.trackFilter      = "";
    $scope.dateSelected     = $scope.dateSelected && $scope.dateSelected || $rootScope.conferenceDay;
    $scope.sessions         = store.get("session_cache");

    var dateArray = $scope.conferenceDates[0].substr(0,10).split('-');
    $scope.dateToFilterOn = dateArray[1]+'/'+dateArray[2]+'/'+dateArray[0];

    $scope.grabTheData = function(){
    	scheduleService.getSchedule($scope.dateSelected).then(function(data){
            $scope.updateFavoritesIsOverFlag();
    		$scope.sessions      = data;
            $scope.favorites     = store.get('favoriteSessions');

            var uniqueTracks = [];
            var tracks       = [];
            var cleanFavorites = [];
            for(var track in $scope.sessions){
                if( $scope.sessions[track].track.toLowerCase()!='unknown' && $scope.sessions[track].track!='' ){
                    uniqueTracks[ $scope.sessions[track].track ] = $scope.sessions[track].track;
                }
                for( var s in $scope.favorites ) {
                    if( $scope.favorites[s].id == $scope.sessions[track].id ) {
                        cleanFavorites.push($scope.sessions[track]);
                    }
                }
            }

            for(var track in uniqueTracks){ tracks.push( track ); }
            tracks.sort(function(a,b) {
                                a = a.toLowerCase();
                                b = b.toLowerCase();
                                if( a == b) return 0;
                                if( a > b) return 1;
                                return -1;
                            });

            $scope.tracks = tracks;

            if($scope.sessions.length<=0){
                $scope.sessions = new Array();
                $scope.sessionsLoaded();
            } else {
                store.set('session_cache',$scope.sessions);
                store.set("favoriteSessions",cleanFavorites);
                $scope.favorites = cleanFavorites;
                $log.info("Refreshed the session cache: " + new Date());
            }
    	},function(response){
            var today = new Date();
            $scope.sessionsLoaded();
            $scope.sessions = [{ "id":"-1", "title":"Oops!", "details":"There was a problem obtaining the schedule. Please make sure you have an internet connection.", "date": "01-Jan-1969", "starttime": "12:00 AM", "endtime": "12:00 AM" }];
    		console.log("Oops, could not get data: "+response);
    	});
    }

    $scope.isTodayFinished = function(){
        for(var s in $scope.sessions){
            if(!$scope.sessions[s].isOver) return false;
        }

        $scope.sessionsLoaded();
        return true;
    }

    /*
        FILTERING Code 
    */
    $scope.changeDate = function(timeStamp){
        if(timeStamp!='fav'){
//            $scope.loaded = true;
            $scope.sessions = store.get('session_cache');
            $scope.dateSelected=timeStamp.substr(0,10) ? timeStamp.substr(0,10) : $scope.conferenceDates[0].substr(0,10);
            var dateArray = $scope.dateSelected.split('-');
            $scope.dateToFilterOn = dateArray[1]+'/'+dateArray[2]+'/'+dateArray[0];
        }else{
            $scope.dateSelected = timeStamp;
            $scope.dateToFilterOn = '';
            $scope.sessions     = store.get('favoriteSessions');
        }
    }

    /*
        FAVORITES Code 
    */
    $scope.isFavorite = function(sessionId){

        var favSessions    = store.get('favoriteSessions');
            favSessions    = favSessions ? favSessions : new Array();

        for(var x in favSessions){
            if(favSessions[x].id == sessionId){ return true; }
        }

        return false;
    }

    $scope.hasFavorites = function(){
        var favSessions = store.get('favoriteSessions');
            favSessions = favSessions ? favSessions : new Array();

        return favSessions.length;
    }

    $scope.allFavoritesOver = function(){
        var favSessions = store.get('favoriteSessions');
            favSessions = favSessions ? favSessions : new Array();

        for(var x in favSessions){
            if(!favSessions[x].isOver){
                return false;
            }
        }

        return true;
    }

    $scope.addToFavorites = function(sessionId, sessionObj){

        var favSessions = store.get('favoriteSessions');
            favSessions = favSessions ? favSessions : new Array();

        if(store.disabled){ 
            alert("Error. There seems to be a problem saving this information. Make sure your browser allows cookies.")
            return false;
        }else{
            favSessions.push(sessionObj);
            store.set('favoriteSessions', favSessions);
            $scope.favorites = store.get('favoriteSessions');
            $scope.undoAllSwipes();

            return true;
        }

        $scope.$apply();
    }

    $scope.removeFromFavorites = function(sessionId){

        var favSessions    = store.get('favoriteSessions');
        favSessions    = favSessions ? favSessions : new Array();

        for( var s in favSessions ) {
            if( favSessions[s].id == $scope.localSession.id ) {
                favSessions.splice(s,1);
                break;
            }
        }

        store.set('favoriteSessions', favSessions);
        $scope.undoAllSwipes();
        
        return true;
    }

    $scope.updateFavoritesIsOverFlag = function(){
        var favSessions = store.get('favoriteSessions');
            favSessions    = favSessions ? favSessions : new Array();

        var monthNameToNumber = {
                "Jan":"01",
                "Feb":"02",
                "Mar":"03",
                "Apr":"04",
                "May":"05",
                "Jun":"06",
                "Jul":"07",
                "Aug":"08",
                "Sep":"09",
                "Oct":"10",
                "Nov":"11",
                "Dec":"12"
            }

        for(var s in favSessions){
            favSessions[s].isOver = favSessions[s].dateObject<=(new Date()).getTime();
        }

        store.set('favoriteSessions', favSessions);
    }

    $scope.toggleFavoriteFlag = function(sessionId, sessionObj){

        if($scope.isFavorite(sessionId))
            $scope.removeFromFavorites(sessionObj);
        else
            $scope.addToFavorites(sessionId, sessionObj);
        
        $scope.$apply();
        
        return true;
    }

    $scope.grabTheData();

    $scope.open = function(sessionObject) {
        scheduleService.localSession = sessionObject;

        var modalInstance = $modal.open({
            templateUrl: 'views/session-modal.html',
            controller: SessionModalInstanceCtrl
        });

        modalInstance.result.then(function (selectedItem) {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
    };
}

var SessionModalInstanceCtrl = function ($scope, $modalInstance, scheduleService) {

    $scope.localSession = scheduleService.localSession;
    $scope.conferencePresentationMaterialsUrl = scheduleService.conferencePresentationMaterialsUrl;

    $scope.ok = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.isFavorite = function(sessionId){

        var favSessions    = store.get('favoriteSessions');
        favSessions    = favSessions ? favSessions : new Array();

        for(var x in favSessions){
            if(favSessions[x].id == sessionId){ return true; }
        }

        return false;
    }

    $scope.hasFavorites = function(){
        var favSessions = store.get('favoriteSessions');
        favSessions = favSessions ? favSessions : new Array();

        return favSessions.length;
    }

    $scope.addToFavorites = function(sessionId){

        var favSessions = store.get('favoriteSessions');
        favSessions = favSessions ? favSessions : new Array();

        favSessions.push($scope.localSession);
        store.set('favoriteSessions', favSessions);
        return true;
    }

    $scope.removeFromFavorites = function(sessionId){

        var favSessions    = store.get('favoriteSessions');
        favSessions    = favSessions ? favSessions : new Array();

        for( var s in favSessions ) {
            if( favSessions[s].id == $scope.localSession.id ) {
                favSessions.splice(s,1);
                break;
            }
        }

        store.set('favoriteSessions', favSessions);
        return true;
    }

    $scope.evaluationFormSubmission = function(formID, loaderID, completeID, buttonID){
        $("#"+formID).submit();
        $("#"+loaderID).show();
        setTimeout( 'killEvaluationFormSubmissionLoader("'+loaderID+'")', 900);
        setTimeout( 'showEvaluationFormSubmissionComplete("'+completeID+'")', 910);
        setTimeout( 'disableEvaluationFormSubmissionButton("'+buttonID+'")', 10);
    }
};
