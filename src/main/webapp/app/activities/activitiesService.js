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

/* Services */

function ActivitiesService($http, $q){

    var feedURL = ""; // TODO add your feed URL
	this.getInfo = function(){
		var info = {
			jsonURL 	: 'json/passthrough?feedurl='+escape(feedURL),
			description	: 'Scheduled activities during the conference.'
		}

		return info;
	}

	this.getActivities = function(){
		var defer = $q.defer();

		$http({
			method : 'GET',
			url : this.getInfo().jsonURL
		}).success(function(data, status, headers, config) {
			 if( status != 200 ) {
				 return defer.reject(status);
             }
			defer.resolve(data);
		}).error(function(data, status, headers, config) {
			defer.reject(status);
		});

		return defer.promise;
	}

}



