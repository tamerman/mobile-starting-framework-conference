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

function AttendeesService($http, $q){

    var registrantsURL = ""; // TODO add your URL

	this.getInfo = function(letter){
		var info = {
            jsonURL 	: 'json/passthrough?feedurl='+encodeURI(registrantsURL),
			description	: 'Who is attending the conference?'
		}

		return info;
	}

	this.getAttendees = function(letter){
		var defer = $q.defer();

		$http({
			method : 'GET',
			url : this.getInfo( letter ).jsonURL
		}).success(function(data, status, headers, config) {
			 if( status != 200 ) {
				 return defer.reject(status);
             }
			var registrants = data.registrants && data.registrants || data;

			for(var r in registrants){
				registrants[r].letter = registrants[r].lastname.substr(0,1).toUpperCase();
			}

			defer.resolve(registrants);
		}).error(function(data, status, headers, config) {
			defer.reject(status);
		});

		return defer.promise;
	}

}



