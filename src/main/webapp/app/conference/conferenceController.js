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

function ConferenceCtrl($scope, $rootScope, $timeout, $route, $location, $templateCache, $log, scheduleService){

    $rootScope.hasLocalStorage      = !store.disabled;
    $rootScope.conferenceDay        = "";
    $rootScope.angularConferenceDay = "";
    $rootScope.conferenceName       = scheduleService.conferenceName;
    $rootScope.conferenceLocation   = scheduleService.conferenceLocation;

    $scope.init = function() {
        $scope.today           = new Date();
        $scope.todayFormatted  = $scope.today.getFullYear()+"-"+(($scope.today.getMonth()+1)<10&&"0"+($scope.today.getMonth()+1)||($scope.today.getMonth()+1))+"-"+($scope.today.getDate()<10&&"0"+$scope.today.getDate()||$scope.today.getDate());
        $scope.conferenceDates = scheduleService.getConferenceDates();
        $scope.SCHEDULE_SERVICE = scheduleService;

        // if we're not in the conference, go to the first day of the conference
        for( var i=0; i < $scope.conferenceDates.length; i++ ) {
            if($scope.conferenceDates[i].substr(0,10)==$scope.todayFormatted){
                $rootScope.conferenceDay        = $scope.todayFormatted;
                $rootScope.angularConferenceDay = $rootScope.conferenceDay+"T100000Z";
            }
        }
        if($rootScope.conferenceDay==""){
            $rootScope.conferenceDay        = $scope.conferenceDates[0].substr(0,10);
            $rootScope.angularConferenceDay = $rootScope.conferenceDay+"T100000Z";
        }

        $scope.isReadyForEval = $scope.calculateReadyForEval();
    }

    $scope.readyForEval = function() {
        return $scope.isReadyForEval;
    }

    $scope.calculateReadyForEval = function(){
        var numberOfDays = Object.keys(scheduleService.getConferenceDates()).length;
        $log.info("There are "+numberOfDays+" in "+$rootScope.conferenceName);
        var strDateToShow = $scope.conferenceDates[numberOfDays-1].substr(0,10);
        $log.debug("strDateToShow is "+strDateToShow);
        var intDateToShow = Date.parse( strDateToShow );
        $log.debug("intDateToShow is "+intDateToShow);
        var intToday      = Date.parse( $scope.todayFormatted );
        $log.debug("intToday is "+intToday);

        // stupid iPad 1 !!
        if(!intDateToShow){ intDateToShow = new Date( strDateToShow ); }
        if(!intToday){ intDateToShow = new Date( todayFormatted ); }

        if(intToday < intDateToShow){ return false; }
        if(store.get('tookOverallEval'+($rootScope.conferenceName.replace(' ','_')))){ return false; }

        return true;
    }

    $scope.evaluationFormSubmission = function(formID, loaderID, completeID, buttonID){
        $("#"+formID).submit();
        $("#"+loaderID).show();
        setTimeout( 'killEvaluationFormSubmissionLoader("'+loaderID+'")', 900);
        setTimeout( 'showEvaluationFormSubmissionComplete("'+completeID+'")', 910);
        setTimeout( 'disableEvaluationFormSubmissionButton("'+buttonID+'")', 10);
    }

    $scope.tookOverallEval = function(){
        $timeout(function(){store.set('tookOverallEval'+($rootScope.conferenceName.replace(' ','_')),true);},2500);
    }

    $scope.clearCache = function() { 
        $templateCache.removeAll();
    }


    // ------------------
    // ROOT SCOPE STUFF
    // ------------------
    $rootScope.activePage = $rootScope.activePage!='' && $rootScope.activePage || '';

    $rootScope.isPageActive = function(pg){
        if( pg.toLowerCase()==$rootScope.activePage.toLowerCase() &&  $rootScope.activePage.toLowerCase()=="splash"){
            $location.path("/home");
            return false;
        }
        return pg.toLowerCase()==$rootScope.activePage.toLowerCase();
    }

    $rootScope.setActivatePage = function(pg){
        $rootScope.activePage = pg.toLowerCase();
    }

    // INIT FOR DEV
    // $templateCache.removeAll();
    // 
}

