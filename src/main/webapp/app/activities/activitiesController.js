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

function ActivitiesCtrl($scope,$rootScope,$route,$http,$window,activitiesService){

    /*
        SET THE ACTIVE PAGE
    */
    $rootScope.setActivatePage($route.current.controller.replace("Ctrl",""));

    $scope.loaded     = false;

    $scope.grabTheData = function(){
        activitiesService.getActivities().then(function(data){
            $scope.activities  = data;
            if($scope.activities.length<=0){
                $scope.activities = new Array();
                $scope.activitiesLoaded();
            }
        },function(response){
            console.log("Oops, could not get data: "+response);
            $scope.activities = [{ "title":"Oops!", "task" : "An internet connection is required to view the activities." }];
            $scope.activitiesLoaded();
        });
    }


    $scope.hasActivities = function(d){

        for(var a in $scope.activities){
            if($scope.activities[a].date==d){ return true; }
        }

        return false;
    }

    /*
        LOADING Code 
    */
    $scope.isLoading = function(){
        return !$scope.loaded;
    }
    $scope.activitiesLoaded = function(){
        $scope.loaded=true;
    }

    /*
        DISPLAY Code
    */




    // INIT
    $scope.grabTheData();
}



