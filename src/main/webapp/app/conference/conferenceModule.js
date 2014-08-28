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

var conference = angular.module('conference', ['ngRoute','ui.bootstrap','ng-iscroll', 'ngSanitize'], function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(false);
	$routeProvider.
        when('/',                    {  templateUrl: 'views/conference.html',        controller: 'ConferenceCtrl' }).
        when('/home',                {  templateUrl: 'views/conference.html',        controller: 'ConferenceCtrl' }).
        when('/schedule',            {  templateUrl: 'views/schedule.html',          controller: 'ScheduleCtrl' }).
        when('/activities',          {  templateUrl: 'views/activities.html',        controller: 'ActivitiesCtrl' }).
        when('/attendees',           {  templateUrl: 'views/attendees.html',         controller: 'AttendeesCtrl' }).
        when('/map',                 {  templateUrl: 'views/map.html',               controller: 'MapCtrl' }).
        when('/twitter',             {  templateUrl: 'views/twitter.html',           controller: 'TwitterCtrl' }).
        otherwise({ redirectTo: "/" });
})

.directive('ngRepeatIsFinished', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                scope.$evalAsync(attr.ngRepeatIsFinished);
            }
        }
    }
})

.directive('scrollTo', function ($location, $anchorScroll) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                if(attrs.scrollTo){
                    event.stopPropagation();
                    var location = attrs.scrollTo;
                    $location.hash(location);
                    $anchorScroll();
                    // stupid hack for the anchorScroll not figuring in fixed header/nav
                    setTimeout(function(){ window.scrollTo(window.pageXOffset, window.pageYOffset - 120);}, 50);
                }
            })
        }
    }
})

.directive('loading', function () {
    return {
        restrict:'E',
        transclude:true,
        replace:true,
        templateUrl: 'app/_directive-templates/loading.html'
    }
})

.directive('sessionmodalopener', function () {
    return {
        restrict:'E',
        transclude:true,
        replace:true,
        templateUrl: 'app/_directive-templates/session-modal-opener.html'
    }
})

.directive('jsonDataRefresh', ['$parse', '$timeout', '$http', function ($parse, $timeout, $http) {
    return {
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        link: function (scope, element, attrs) {
          //console.log(element);
            var isRunning = true;
            var method = 'get';
            var url = '';
            
            function successFunction(data) {
              if (data !== undefined && isRunning) {
                try {
                  $parse(attrs.ngModel).assign(scope, data);
                }
                catch (error) {
                  //Just in case scope got detroyed while we were trying to update
                  console.log(error);
                }
              }

              if (isRunning) {
                $timeout(function () { refreshFromUrl(url, interval); }, interval);
              }
            }

            function refreshFromUrl(url, interval) {
              if (isNaN(interval)) {
                interval = 2000;
              }
              $http[method](url).success(function (data, status, headers, config) {
                successFunction(data);
              })
              .error(function (data, status, headers, config) {
                console.log(data);
              });
            }

            if (attrs.ngModel !== undefined && attrs.ngModel !== '' && attrs.url !== undefined && attrs.url !== '') 
            {
                var interval = parseInt(attrs.interval);
                if(isNaN(interval))
                    interval = 2000;
                    
                if(attrs.method !== undefined && attrs.method !== '') {
                  if(attrs.method.toLowerCase() == 'get' || attrs.method.toLowerCase()=='jsonp') {
                    method = attrs.method.toLowerCase();
                  }
                }

                url = attrs.url;
                refreshFromUrl(url, interval);
            }

            scope.$on('$destroy', function () {
                isRunning = false;
            });
        }
    }
}])

.filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
})

.filter('removeString', function () {
        return function (text, toRemove) {
            return String(text).replace(toRemove,'');
        };
})

.factory('scheduleService', [ '$http', '$q', function($http, $q) {
    return new ScheduleService($http, $q);
}])

.factory('twitterService', [ '$http', '$q', function($http, $q) {
    return new TwitterService($http, $q);
}])

.factory('attendeesService', [ '$http', '$q', function($http, $q) {
    return new AttendeesService($http, $q);
}])

.factory('activitiesService', [ '$http', '$q', function($http, $q) {
    return new ActivitiesService($http, $q);
}])

.factory('mapService', [ '$http', '$q', function($http, $q) {
    return new MapService($http, $q);
}])

