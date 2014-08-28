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

function AttendeesCtrl($scope,$rootScope,$route,$http,$window,attendeesService){

    /*
        SET THE ACTIVE PAGE
    */
    $rootScope.setActivatePage($route.current.controller.replace("Ctrl",""));

    $scope.loaded    = false;
    $scope.orgFilter = "";

    $scope.grabTheData = function(){
        if( localStorage && localStorage.getItem("attendee_cache")!=null ) {
            $scope.attendees = JSON.parse(localStorage.getItem("attendee_cache"));
        }

        attendeesService.getAttendees($rootScope.attendeeLetterChosen).then(function(data){
            $scope.attendees  = data;

            var uniqueOrganizations = [];
            var organizations       = [];
            for(var org in $scope.attendees){
                if( data[org].organization.toLowerCase()!='unknown' && data[org].organization!='' ){
                    uniqueOrganizations[ data[org].organization ] = data[org].organization;
                }
            }
            
            for(var org in uniqueOrganizations){ organizations.push( uniqueOrganizations[org] ); }
            organizations.sort(function(a,b) {
                                a = a.toLowerCase();
                                b = b.toLowerCase();
                                if( a == b) return 0;
                                if( a > b) return 1;
                                return -1;
                            });
            $scope.organizations = organizations;

            $scope.attendeesLoaded();
            if($scope.attendees.length<=0){
                $scope.attendees = new Array();
            } else if( localStorage ) {
                // Only cache results if we got results.
                // This prevents us from wiping out the cache if the web service breaks somehow.
                localStorage.setItem("attendee_cache",JSON.stringify($scope.attendees));
            }
        },function(response){
            console.log("Oops, could not get data: "+response);
            $scope.attendees = new Array();
            $scope.attendeesLoaded();
        });
    }


    /*
        LOADING Code
    */
    $scope.isLoading = function(){
        return !$scope.loaded;
    }
    $scope.attendeesLoaded = function(){
        $scope.loaded=true;
    }

    /*
        DISPLAY Code
    */
    $scope.filterAttendees = function(filter, $event){

        var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

        if( filter == '' ) {
            $scope.orgFilter                = '';
            $rootScope.attendeeLetterChosen = '';
        } else if( alphabet.indexOf(filter) > -1 ) {
            $scope.orgFilter = '';
            $rootScope.attendeeLetterChosen = filter;
        } else {
            $scope.orgFilter = filter;
            $rootScope.attendeeLetterChosen = '';
        }
    }


    // INIT
    $scope.grabTheData();
}



